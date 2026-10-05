// Status: IMPLEMENTED (needs UPI_VPA/UPI_PAYEE_NAME env; dev placeholder allowed, clearly marked in .env.example)
//
// Manual UPI payment mode — the ONLY active payment path in this build.
// Razorpay was removed from the MVP by owner decision (2026-10-05).
//
// LAW:
// - Server is the sole authority for recipient VPA and amount — never
//   accept amount/vpa/status from the client.
// - Screenshot is supporting evidence ONLY — never auto-verifies.
// - Generation is queued ONLY on PAYMENT_VERIFIED (enforced by the job
//   state machine + worker; this module never touches generation jobs).
import QRCode from 'qrcode';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { auditLogs, orders, payments } from '@/lib/db/schema';
import {
  buildUpiUri,
  isValidUtr,
  newOrderCode,
  normalizeUtr,
  type PaymentOrderState,
  type PaymentProvider,
} from '@/lib/vilish/types';

/** HTTP-shaped error thrown by the service layer; routes map it to responses. */
export class PaymentHttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'PaymentHttpError';
    this.status = status;
    this.code = code;
  }
}

export interface UpiConfig {
  enabled: boolean;
  vpa: string;
  payeeName: string;
  /** Optional pre-hosted static QR image; when set, no QR is generated. */
  qrImageUrl: string | null;
  /** Payment window in minutes for a PENDING order. */
  orderTtlMin: number;
}

export function getUpiConfig(): UpiConfig {
  const enabled = process.env.UPI_PAYMENT_ENABLED === 'true';
  const vpa = process.env.UPI_VPA ?? '';
  const payeeName = process.env.UPI_PAYEE_NAME ?? '';
  if (enabled && (!vpa || !payeeName)) {
    throw new Error(
      'UPI payments are enabled but UPI_VPA / UPI_PAYEE_NAME are not set'
    );
  }
  return {
    enabled,
    vpa,
    payeeName,
    qrImageUrl: process.env.UPI_QR_IMAGE || null,
    orderTtlMin: Number(process.env.MANUAL_UPI_ORDER_TTL_MIN ?? 30),
  };
}

export class ManualUpiProvider implements PaymentProvider {
  readonly id = 'manual_upi' as const;

  async createCheckout(order: {
    code: string;
    amountPaise: number;
  }): Promise<{
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    expiresAt: string;
  }> {
    const cfg = getUpiConfig();
    const upiUri = buildUpiUri({
      vpa: cfg.vpa,
      payeeName: cfg.payeeName,
      amountPaise: order.amountPaise,
      orderCode: order.code,
    });
    const expiresAt = new Date(
      Date.now() + cfg.orderTtlMin * 60_000
    ).toISOString();
    const base = { upiUri, vpa: cfg.vpa, payeeName: cfg.payeeName, expiresAt };
    if (cfg.qrImageUrl) return { ...base, qrImageUrl: cfg.qrImageUrl };
    // No third-party QR API: render locally with the `qrcode` lib.
    const qrDataUri = await QRCode.toDataURL(upiUri, { width: 512, margin: 2 });
    return { ...base, qrDataUri };
  }
}

async function getOrderByCode(code: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.code, code))
    .limit(1);
  if (!order) {
    throw new PaymentHttpError(404, 'ORDER_NOT_FOUND', `No order ${code}`);
  }
  return order;
}

/**
 * Create a PAYMENT_PENDING manual-UPI order. Amount comes from the server
 * (the job's customerPrice) — never from the client.
 */
export async function createManualPaymentOrder(input: {
  jobId: string;
  userId: string | null;
  amountPaise: number;
}) {
  if (!Number.isInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new PaymentHttpError(
      400,
      'INVALID_AMOUNT',
      'Amount must be a positive integer (paise).'
    );
  }
  const code = newOrderCode();
  const checkout = await new ManualUpiProvider().createCheckout({
    code,
    amountPaise: input.amountPaise,
  });
  await db.insert(orders).values({
    code,
    jobId: input.jobId,
    userId: input.userId,
    provider: 'manual_upi',
    amountPaise: input.amountPaise,
    currency: 'INR',
    status: 'PAYMENT_PENDING',
    expiresAt: new Date(checkout.expiresAt),
  });
  return { code, amountPaise: input.amountPaise, ...checkout };
}

/**
 * Customer submits their UTR + optional screenshot asset.
 * Ownership, expiry, and format are validated server-side.
 */
export async function submitPaymentUtr(input: {
  code: string;
  utrReference: string;
  screenshotAssetId?: string;
  userId: string | null;
}) {
  const order = await getOrderByCode(input.code);
  if (order.userId !== input.userId) {
    throw new PaymentHttpError(
      403,
      'FORBIDDEN',
      'Order does not belong to this user.'
    );
  }
  if (!isValidUtr(input.utrReference)) {
    throw new PaymentHttpError(
      400,
      'INVALID_UTR',
      'UTR / payment reference format is not valid.'
    );
  }
  if (order.status !== 'PAYMENT_PENDING') {
    throw new PaymentHttpError(
      409,
      'ORDER_NOT_PENDING',
      `Order is ${order.status}; cannot submit payment.`
    );
  }
  if (order.expiresAt && order.expiresAt.getTime() < Date.now()) {
    await db
      .update(orders)
      .set({ status: 'PAYMENT_EXPIRED' })
      .where(eq(orders.id, order.id));
    throw new PaymentHttpError(
      410,
      'ORDER_EXPIRED',
      'Payment window expired; please create a new order.'
    );
  }
  const normalized = normalizeUtr(input.utrReference);
  // Duplicate detection: same UTR already submitted/verified on ANOTHER order.
  const dupes = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.utrReference, normalized),
        ne(orders.id, order.id),
        inArray(orders.status, [
          'PAYMENT_SUBMITTED',
          'PAYMENT_VERIFIED',
          'GENERATION_QUEUED',
        ])
      )
    )
    .limit(1);
  const duplicateFlag = dupes.length > 0;
  await db
    .update(orders)
    .set({
      utrReference: normalized,
      screenshotAssetId: input.screenshotAssetId ?? null,
      status: 'PAYMENT_SUBMITTED',
      duplicateFlag,
    })
    .where(eq(orders.id, order.id));
  return { status: 'PAYMENT_SUBMITTED' as PaymentOrderState, duplicateFlag };
}

/**
 * Admin confirms payment after MANUAL verification (bank statement / UPI app).
 * NEVER auto-verify from screenshots, app-returns, timers, or SMS.
 */
export async function verifyPaymentOrder(input: {
  code: string;
  adminUserId: string;
  verifiedAmountPaise?: number;
  acknowledgeDuplicate?: boolean;
}) {
  const order = await getOrderByCode(input.code);
  if (order.status !== 'PAYMENT_SUBMITTED') {
    throw new PaymentHttpError(
      409,
      'ORDER_NOT_SUBMITTED',
      `Order is ${order.status}; cannot verify.`
    );
  }
  if (order.duplicateFlag && !input.acknowledgeDuplicate) {
    throw new PaymentHttpError(
      409,
      'DUPLICATE_UTR',
      'Possible duplicate payment reference — acknowledge to proceed'
    );
  }
  if (
    input.verifiedAmountPaise != null &&
    input.verifiedAmountPaise !== order.amountPaise
  ) {
    await db
      .update(orders)
      .set({ status: 'AMOUNT_MISMATCH' })
      .where(eq(orders.id, order.id));
    await db.insert(auditLogs).values({
      actorUserId: input.adminUserId,
      action: 'payment.amount_mismatch',
      target: {
        code: order.code,
        expectedPaise: order.amountPaise,
        verifiedPaise: input.verifiedAmountPaise,
      },
    });
    return { status: 'AMOUNT_MISMATCH' as PaymentOrderState, jobId: order.jobId };
  }
  const verifiedAmountPaise = input.verifiedAmountPaise ?? order.amountPaise;
  await db
    .update(orders)
    .set({
      status: 'PAYMENT_VERIFIED',
      verifiedAt: new Date(),
      verifiedByUserId: input.adminUserId,
      verifiedAmountPaise,
    })
    .where(eq(orders.id, order.id));
  await db.insert(payments).values({
    orderId: order.id,
    utrReference: order.utrReference,
    amountPaise: order.amountPaise,
    method: 'upi_manual',
    status: 'verified',
  });
  await db.insert(auditLogs).values({
    actorUserId: input.adminUserId,
    action: 'payment.verify',
    // NOTE: VPA deliberately excluded — it is the business's receiving
    // address, shown to the paying customer only, never to third parties.
    target: { code: order.code, amountPaise: order.amountPaise },
  });
  return { status: 'PAYMENT_VERIFIED' as PaymentOrderState, jobId: order.jobId };
}

/** Admin rejects a submitted payment (wrong amount, no matching transfer). */
export async function rejectPaymentOrder(input: {
  code: string;
  adminUserId: string;
  reason?: string;
}) {
  const order = await getOrderByCode(input.code);
  await db
    .update(orders)
    .set({ status: 'PAYMENT_REJECTED' })
    .where(eq(orders.id, order.id));
  await db.insert(auditLogs).values({
    actorUserId: input.adminUserId,
    action: 'payment.reject',
    target: { code: order.code, reason: input.reason ?? null },
  });
  return { status: 'PAYMENT_REJECTED' as PaymentOrderState };
}
