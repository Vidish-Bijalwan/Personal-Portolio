/**
 * Etch — Cashfree Payment Gateway (hosted checkout) integration.
 *
 * Flow: server creates a PG order (POST /pg/orders) -> client opens the
 * hosted checkout with the returned payment_session_id -> Cashfree redirects
 * to our return_url and/or fires webhooks -> we verify server-side via
 * GET /pg/orders/{id} (never trust the redirect alone) and mark the
 * internal order PAYMENT_VERIFIED, which flips generations.unlocked via the
 * same unlock hooks the manual-UPI flow uses.
 *
 * ENVIRONMENT SWITCH (no code change to go live):
 *   CASHFREE_ENV=sandbox    (default) -> CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET
 *                                          + https://sandbox.cashfree.com/pg
 *   CASHFREE_ENV=production -> CASHFREE_LIVE_CLIENT_ID / CASHFREE_LIVE_CLIENT_SECRET
 *                                          + https://api.cashfree.com/pg
 * Going live = set CASHFREE_ENV=production in Vercel + redeploy. Production
 * also needs: KYC approved, domain whitelisted in the Cashfree dashboard,
 * webhook URL registered.
 *
 * LAW (same as manual UPI):
 * - Server is the sole authority for amount — never accept amount from the client.
 * - Webhook signature verified with the RAW body (not parsed JSON).
 * - Fulfilment only when Cashfree says order_status === 'PAID'.
 * - Secrets come from process.env at runtime — never logged, never committed.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  auditLogs,
  generationOrders,
  orders,
  payments,
} from '@/lib/db/schema';
import { runUnlockHooks } from './manual-upi';

export type CashfreeEnv = 'sandbox' | 'production';

/** Cashfree PG REST API version pinned for every call. */
export const CASHFREE_API_VERSION = '2023-08-01';

export interface CashfreeConfig {
  env: CashfreeEnv;
  clientId: string;
  clientSecret: string;
  /** e.g. https://sandbox.cashfree.com/pg */
  baseUrl: string;
  /** mode passed to the checkout.js SDK: 'sandbox' | 'production' */
  checkoutMode: 'sandbox' | 'production';
}

/**
 * Resolve the active Cashfree environment from CASHFREE_ENV.
 * Throws when the matching key pair is missing — callers map this to 503.
 */
export function getCashfreeConfig(): CashfreeConfig {
  const raw = (process.env.CASHFREE_ENV ?? 'sandbox').trim().toLowerCase();
  if (raw !== 'sandbox' && raw !== 'production') {
    throw new Error('CASHFREE_ENV must be "sandbox" or "production"');
  }
  const env = raw as CashfreeEnv;
  const clientId =
    env === 'production'
      ? process.env.CASHFREE_LIVE_CLIENT_ID
      : process.env.CASHFREE_CLIENT_ID;
  const clientSecret =
    env === 'production'
      ? process.env.CASHFREE_LIVE_CLIENT_SECRET
      : process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      `Cashfree ${env} credentials are not configured ` +
        `(missing ${env === 'production' ? 'CASHFREE_LIVE_CLIENT_ID / CASHFREE_LIVE_CLIENT_SECRET' : 'CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET'})`
    );
  }
  return {
    env,
    clientId,
    clientSecret,
    baseUrl:
      env === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg',
    checkoutMode: env,
  };
}

/**
 * Integer paise -> rupees decimal for Cashfree (Cashfree takes rupees,
 * NOT paise: 1900 paise -> 19.00).
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise) || paise <= 0) {
    throw new Error('amountPaise must be a positive integer');
  }
  return paise / 100;
}

/** 10-digit Indian mobile number — required by Cashfree's create-order API. */
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export interface CashfreeOrderPayloadInput {
  /** Our gateway order id, e.g. etch_VLSH8H4K2P_lz3abc */
  cashfreeOrderId: string;
  /** integer paise, server-side price — converted to rupees in the payload */
  amountPaise: number;
  customerId: string;
  customerEmail?: string;
  /** 10-digit Indian mobile, validated */
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
}

export interface CashfreeOrderPayload {
  order_id: string;
  order_amount: number;
  order_currency: 'INR';
  customer_details: {
    customer_id: string;
    customer_email?: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
  };
}

/**
 * Build the POST /pg/orders body. Pure function — unit-tested.
 * Optional fields are OMITTED when blank (Cashfree validates present-but-empty).
 */
export function buildCashfreeOrderPayload(
  input: CashfreeOrderPayloadInput
): CashfreeOrderPayload {
  if (!input.cashfreeOrderId || input.cashfreeOrderId.length > 50) {
    throw new Error('cashfreeOrderId must be 1..50 chars');
  }
  if (!isValidIndianPhone(input.customerPhone)) {
    throw new Error('customerPhone must be a 10-digit Indian mobile number');
  }
  const customer_details: CashfreeOrderPayload['customer_details'] = {
    customer_id: input.customerId,
    customer_phone: input.customerPhone.trim(),
  };
  const email = input.customerEmail?.trim();
  if (email) customer_details.customer_email = email;
  return {
    order_id: input.cashfreeOrderId,
    order_amount: paiseToRupees(input.amountPaise),
    order_currency: 'INR',
    customer_details,
    order_meta: {
      return_url: input.returnUrl,
      notify_url: input.notifyUrl,
    },
  };
}

export class CashfreeHttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'CashfreeHttpError';
    this.status = status;
    this.code = code;
  }
}

function cashfreeHeaders(cfg: CashfreeConfig): Record<string, string> {
  return {
    'x-client-id': cfg.clientId,
    'x-client-secret': cfg.clientSecret,
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
  };
}

export interface CashfreeCreateOrderResult {
  paymentSessionId: string;
  cashfreeOrderId: string;
  orderStatus: string;
}

/**
 * Create a PG order. baseUrlOverride is test-only (lets tests point at a mock).
 * Throws CashfreeHttpError with a sanitized message (no secrets).
 */
export async function createCashfreeOrder(
  payload: CashfreeOrderPayload,
  cfg: CashfreeConfig,
  baseUrlOverride?: string
): Promise<CashfreeCreateOrderResult> {
  const base = baseUrlOverride ?? cfg.baseUrl;
  let res: Response;
  try {
    res = await fetch(`${base}/orders`, {
      method: 'POST',
      headers: cashfreeHeaders(cfg),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    throw new CashfreeHttpError(
      502,
      'CASHFREE_UNREACHABLE',
      `Cashfree order API unreachable: ${e instanceof Error ? e.message : 'network error'}`
    );
  }
  const data = (await res.json().catch(() => null)) as {
    payment_session_id?: string;
    order_id?: string;
    order_status?: string;
    code?: string;
    message?: string;
  } | null;
  if (!res.ok || !data?.payment_session_id) {
    throw new CashfreeHttpError(
      502,
      'CASHFREE_ORDER_FAILED',
      `Cashfree rejected the order (${data?.code ?? res.status}): ${data?.message ?? 'unknown error'}`
    );
  }
  return {
    paymentSessionId: data.payment_session_id,
    cashfreeOrderId: data.order_id ?? payload.order_id,
    orderStatus: data.order_status ?? 'ACTIVE',
  };
}

export interface CashfreeOrderStatus {
  orderId: string;
  orderStatus: string;
  orderAmount: number;
}

/** GET /pg/orders/{id} — the source of truth for fulfilment. */
export async function fetchCashfreeOrder(
  cashfreeOrderId: string,
  cfg: CashfreeConfig,
  baseUrlOverride?: string
): Promise<CashfreeOrderStatus> {
  const base = baseUrlOverride ?? cfg.baseUrl;
  let res: Response;
  try {
    res = await fetch(
      `${base}/orders/${encodeURIComponent(cashfreeOrderId)}`,
      {
        method: 'GET',
        headers: cashfreeHeaders(cfg),
        signal: AbortSignal.timeout(15000),
      }
    );
  } catch (e) {
    throw new CashfreeHttpError(
      502,
      'CASHFREE_UNREACHABLE',
      `Cashfree order fetch unreachable: ${e instanceof Error ? e.message : 'network error'}`
    );
  }
  const data = (await res.json().catch(() => null)) as {
    order_id?: string;
    order_status?: string;
    order_amount?: number;
    code?: string;
    message?: string;
  } | null;
  if (!res.ok || !data?.order_status) {
    throw new CashfreeHttpError(
      502,
      'CASHFREE_FETCH_FAILED',
      `Cashfree order fetch failed (${data?.code ?? res.status}): ${data?.message ?? 'unknown error'}`
    );
  }
  return {
    orderId: data.order_id ?? cashfreeOrderId,
    orderStatus: data.order_status,
    orderAmount: data.order_amount ?? 0,
  };
}

/** Order statuses that mean money moved. */
export function isCashfreePaidStatus(orderStatus: string): boolean {
  return orderStatus === 'PAID';
}

/**
 * Verify a webhook's authenticity.
 * Cashfree signs: Base64(HMAC-SHA256(x-webhook-timestamp + RAW body, secret)).
 * The raw body must be used — never parsed-then-reserialized JSON.
 */
export function verifyCashfreeWebhookSignature(input: {
  signature: string | null;
  timestamp: string | null;
  rawBody: string;
  secret: string;
}): boolean {
  const { signature, timestamp, rawBody, secret } = input;
  if (!signature || !timestamp || !secret) return false;
  const expected = createHmac('sha256', secret)
    .update(timestamp + rawBody, 'utf8')
    .digest('base64');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export interface MarkPaidInput {
  cashfreeOrderId: string;
  cfPaymentId?: string | null;
  /** integer paise, from the gateway event (converted from rupees) */
  paidAmountPaise: number;
  rawPayload: unknown;
}

export type MarkPaidResult =
  | { ok: true; orderId: string; already: boolean }
  | { ok: false; reason: 'ORDER_NOT_FOUND' | 'ORDER_NOT_PAYABLE' | 'AMOUNT_MISMATCH' };

/**
 * Mark the internal order PAYMENT_VERIFIED from a confirmed Cashfree payment.
 * Idempotent: already-verified orders are a no-op (webhooks + return URL can
 * both fire). Amount must match the server-side order amount exactly.
 */
export async function markCashfreeOrderPaid(
  input: MarkPaidInput
): Promise<MarkPaidResult> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.cashfreeOrderId, input.cashfreeOrderId))
    .limit(1);
  if (!order) return { ok: false, reason: 'ORDER_NOT_FOUND' };
  if (order.status === 'PAYMENT_VERIFIED') {
    return { ok: true, orderId: order.id, already: true };
  }
  if (order.status !== 'PAYMENT_PENDING') {
    return { ok: false, reason: 'ORDER_NOT_PAYABLE' };
  }
  if (input.paidAmountPaise !== order.amountPaise) {
    await db
      .update(orders)
      .set({ status: 'AMOUNT_MISMATCH' })
      .where(eq(orders.id, order.id));
    await db.insert(auditLogs).values({
      actorUserId: 'cashfree',
      action: 'payment.amount_mismatch',
      target: {
        code: order.code,
        expectedPaise: order.amountPaise,
        paidPaise: input.paidAmountPaise,
      },
    });
    return { ok: false, reason: 'AMOUNT_MISMATCH' };
  }
  await db
    .update(orders)
    .set({
      status: 'PAYMENT_VERIFIED',
      verifiedAt: new Date(),
      verifiedByUserId: 'cashfree',
      verifiedAmountPaise: order.amountPaise,
    })
    .where(eq(orders.id, order.id));
  await db.insert(payments).values({
    orderId: order.id,
    cashfreePaymentId: input.cfPaymentId ?? null,
    amountPaise: order.amountPaise,
    method: 'cashfree',
    status: 'verified',
    rawPayload: input.rawPayload as Record<string, unknown>,
  });
  await db.insert(auditLogs).values({
    actorUserId: 'cashfree',
    action: 'payment.verify',
    target: {
      code: order.code,
      amountPaise: order.amountPaise,
      cashfreeOrderId: input.cashfreeOrderId,
    },
  });
  await runUnlockHooks(order.id);
  return { ok: true, orderId: order.id, already: false };
}

/**
 * Session-aware fallback for the return URL: Cashfree's `_self` redirect
 * appends `?order_id=` per the docs, but the redirect does not reliably
 * carry it (seen in production: paid order, no usable query params). When
 * the primary lookup fails, the logged-in user's most recent
 * PAYMENT_PENDING cashfree order within the window is the order they were
 * just paying for. It is still VERIFIED against Cashfree's API before any
 * fulfilment — never trusted from the session alone.
 */
export async function findRecentPendingCashfreeOrder(
  userId: string,
  windowMinutes = 60
): Promise<typeof orders.$inferSelect | undefined> {
  const cutoff = new Date(Date.now() - windowMinutes * 60_000);
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.provider, 'cashfree'),
        eq(orders.status, 'PAYMENT_PENDING'),
        gt(orders.createdAt, cutoff)
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return rows[0];
}

/** Recent cashfree orders for the payment-status page (newest first). */
export async function listRecentCashfreeOrders(
  userId: string,
  windowMinutes = 90
): Promise<(typeof orders.$inferSelect)[]> {
  const cutoff = new Date(Date.now() - windowMinutes * 60_000);
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.provider, 'cashfree'),
        gt(orders.createdAt, cutoff)
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(5);
}

export interface PaymentStatusOrderLite {
  code: string;
  status: string;
  createdAt: string;
  destination: string;
}

export type PaymentStatusKind =
  | 'verified'
  | 'confirming'
  | 'stale'
  | 'failed'
  | 'empty';

/**
 * Pure derivation of the payment-status page state from the user's recent
 * cashfree orders. Unit-tested; the page itself just renders the result.
 * - verified: money moved (or the unlock pipeline already queued) -> download link
 * - confirming: pending and fresh -> "Confirming your payment…" + auto-retry
 * - stale: pending but past the webhook window -> honest "not confirmed" state
 * - failed: terminal rejection/expiry/mismatch -> genuine error
 */
export function derivePaymentStatus(
  lite: PaymentStatusOrderLite[],
  nowMs: number,
  confirmingWindowMs = 10 * 60_000
): { kind: PaymentStatusKind; order: PaymentStatusOrderLite | null } {
  const [latest] = lite;
  if (!latest) return { kind: 'empty', order: null };
  if (latest.status === 'PAYMENT_VERIFIED' || latest.status === 'GENERATION_QUEUED') {
    return { kind: 'verified', order: latest };
  }
  if (
    latest.status === 'PAYMENT_REJECTED' ||
    latest.status === 'PAYMENT_EXPIRED' ||
    latest.status === 'AMOUNT_MISMATCH'
  ) {
    return { kind: 'failed', order: latest };
  }
  const age = nowMs - new Date(latest.createdAt).getTime();
  if (age >= confirmingWindowMs) return { kind: 'stale', order: latest };
  return { kind: 'confirming', order: latest };
}

/**
 * Where the customer lands after paying: unlock orders go back to the
 * watch room (both free-tier and generate-first paid image unlocks live
 * on generations rows at /watch/[id]), paid-video orders to the video
 * watch room — mirroring the manual-UPI post-payment destinations.
 */
export async function resolvePostPaymentDestination(
  orderId: string
): Promise<string> {
  const links = await db
    .select()
    .from(generationOrders)
    .where(eq(generationOrders.orderId, orderId))
    .limit(1);
  const link = links[0];
  if (!link) return '/?payment=error';
  if (link.purpose === 'video') return `/watch/${link.generationId}?paid=1`;
  if (link.purpose === 'unlock') return `/watch/${link.generationId}?paid=1`;
  return `/generation/${link.generationId}?paid=1`;
}
