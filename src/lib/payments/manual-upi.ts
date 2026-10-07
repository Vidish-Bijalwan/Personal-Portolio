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
import { auditLogs, generationOrders, generations, orders, payments, videoJobOrders, videoJobs } from '@/lib/db/schema';
import {
  buildUpiUri,
  isValidUtr,
  newOrderCode,
  newShortCode,
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
 * Lookup by full code (VLSH-XXXXXX) or the 4-char short code (A3F9).
 * Used by the owner's phone-ping confirm flow, which only sees the
 * short code.
 */
async function getOrderByCodeOrShort(codeOrShort: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.code, codeOrShort))
    .limit(1);
  if (order) return order;
  const [byShort] = await db
    .select()
    .from(orders)
    .where(eq(orders.shortCode, codeOrShort))
    .limit(1);
  if (!byShort) {
    throw new PaymentHttpError(
      404,
      'ORDER_NOT_FOUND',
      `No order ${codeOrShort}`
    );
  }
  return byShort;
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
  // 4-char human code for the owner's phone ping (YES <code> / NO <code>).
  // 31^4 combos; retry a few times on the rare collision.
  let shortCode = newShortCode();
  for (let i = 0; i < 5; i++) {
    const [existing] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.shortCode, shortCode))
      .limit(1);
    if (!existing) break;
    shortCode = newShortCode();
  }
  const checkout = await new ManualUpiProvider().createCheckout({
    code,
    amountPaise: input.amountPaise,
  });
  await db.insert(orders).values({
    code,
    shortCode,
    jobId: input.jobId,
    userId: input.userId,
    provider: 'manual_upi',
    amountPaise: input.amountPaise,
    currency: 'INR',
    status: 'PAYMENT_PENDING',
    expiresAt: new Date(checkout.expiresAt),
  });
  return { code, shortCode, amountPaise: input.amountPaise, ...checkout };
}

/**
 * Payment-claim flow: the user paid in their UPI app and tapped "I've paid".
 * No UTR, no screenshot — the owner gets a phone ping and confirms.
 * Ownership, expiry validated server-side. Idempotent: claiming an already
 * claimed order returns the current state instead of erroring.
 */
export async function claimPaymentPaid(input: {
  code: string;
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
  if (order.status === 'PAYMENT_AWAITING_OWNER') {
    return {
      status: 'PAYMENT_AWAITING_OWNER' as PaymentOrderState,
      shortCode: order.shortCode,
    };
  }
  if (order.status !== 'PAYMENT_PENDING') {
    throw new PaymentHttpError(
      409,
      'ORDER_NOT_PENDING',
      `Order is ${order.status}; cannot claim payment.`
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
  await db
    .update(orders)
    .set({
      status: 'PAYMENT_AWAITING_OWNER',
      ownerPingedAt: null,
      pingCount: 0,
    })
    .where(eq(orders.id, order.id));
  return {
    status: 'PAYMENT_AWAITING_OWNER' as PaymentOrderState,
    shortCode: order.shortCode,
  };
}

/**
 * Customer submits their UTR + optional screenshot asset.
 * Ownership, expiry, and format are validated server-side.
 * (Legacy path — the payment modal now uses claimPaymentPaid instead.)
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
 * Admin confirms payment after MANUAL verification (bank statement / UPI app,
 * or the owner's YES reply to the phone ping).
 * NEVER auto-verify from screenshots, app-returns, timers, or SMS.
 * Accepts both the legacy PAYMENT_SUBMITTED (UTR flow) and the
 * PAYMENT_AWAITING_OWNER (claim flow) states.
 */
export async function verifyPaymentOrder(input: {
  code: string;
  adminUserId: string;
  verifiedAmountPaise?: number;
  acknowledgeDuplicate?: boolean;
}) {
  const order = await getOrderByCodeOrShort(input.code);
  if (
    order.status !== 'PAYMENT_SUBMITTED' &&
    order.status !== 'PAYMENT_AWAITING_OWNER'
  ) {
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
  await runUnlockHooks(order.id);
  return { status: 'PAYMENT_VERIFIED' as PaymentOrderState, jobId: order.jobId };
}

/**
 * Shared unlock side-effects: flip generations.unlocked / videoJobs.unlocked
 * for orders linked via generationOrders / videoJobOrders. Never throws —
 * a missing table must NEVER break payment verification.
 */
async function runUnlockHooks(orderId: string): Promise<void> {
  // Free-tier / paid-video unlock side-effect: if this order is linked to a
  // generations row (purpose 'unlock' = clean-image unlock,
  // purpose 'video' = paid clip), flip its unlocked flag so the clean
  // download opens. Guarded: a missing generations table (legacy DB where
  // the 0004 migration hasn't applied) must NEVER break payment verify.
  try {
    const links = await db
      .select()
      .from(generationOrders)
      .where(eq(generationOrders.orderId, orderId))
      .limit(1);
    const link = links[0];
    if (link && (link.purpose === 'unlock' || link.purpose === 'video')) {
      await db
        .update(generations)
        .set({ unlocked: true, updatedAt: new Date() })
        .where(eq(generations.id, link.generationId));
    }
  } catch (hookErr) {
    console.error('[payments] generation unlock hook failed:', hookErr);
  }
  // Video Studio unlock side-effect (W2): if this order is linked to a
  // video_jobs row (purpose 'video_studio' = clean-video unlock),
  // flip its unlocked flag so the clean mp4 opens. Same guard as above:
  // a missing video_jobs table must NEVER break payment verify.
  try {
    const vlinks = await db
      .select()
      .from(videoJobOrders)
      .where(eq(videoJobOrders.orderId, orderId))
      .limit(1);
    const vlink = vlinks[0];
    if (vlink && vlink.purpose === 'video_studio') {
      await db
        .update(videoJobs)
        .set({ unlocked: true, updatedAt: new Date() })
        .where(eq(videoJobs.id, vlink.videoJobId));
    }
  } catch (hookErr) {
    console.error('[payments] video-job unlock hook failed:', hookErr);
  }
}

/**
 * Owner/admin testing bypass: mark a fresh order verified with NO payment.
 *
 * Call sites MUST gate on isAdminEmail() first — this function performs no
 * allowlist check itself. Accepts PAYMENT_PENDING (fresh), PAYMENT_AWAITING_OWNER
 * and PAYMENT_SUBMITTED orders. Writes a distinct audit action
 * ('payment.admin_bypass', amount recorded as 0) and runs the same unlock
 * side-effects as verifyPaymentOrder. Safety/moderation is unaffected.
 */
export async function verifyOrderAdminBypass(input: {
  code: string;
  adminUserId: string;
}) {
  const order = await getOrderByCodeOrShort(input.code);
  if (
    order.status !== 'PAYMENT_PENDING' &&
    order.status !== 'PAYMENT_AWAITING_OWNER' &&
    order.status !== 'PAYMENT_SUBMITTED'
  ) {
    throw new PaymentHttpError(
      409,
      'ORDER_NOT_BYPASSABLE',
      `Order is ${order.status}; cannot bypass.`
    );
  }
  console.info(
    `[admin] bypass-verify order ${order.code} (₹${(order.amountPaise / 100).toFixed(2)}) for ${input.adminUserId}`
  );
  await db
    .update(orders)
    .set({
      status: 'PAYMENT_VERIFIED',
      verifiedAt: new Date(),
      verifiedByUserId: input.adminUserId,
      verifiedAmountPaise: 0,
    })
    .where(eq(orders.id, order.id));
  await db.insert(payments).values({
    orderId: order.id,
    utrReference: order.utrReference,
    amountPaise: 0,
    method: 'admin_bypass',
    status: 'verified',
  });
  await db.insert(auditLogs).values({
    actorUserId: input.adminUserId,
    action: 'payment.admin_bypass',
    target: { code: order.code, amountPaise: order.amountPaise },
  });
  await runUnlockHooks(order.id);
  return { status: 'PAYMENT_VERIFIED' as PaymentOrderState, jobId: order.jobId };
}

/** Admin rejects a submitted payment (wrong amount, no matching transfer). */
export async function rejectPaymentOrder(input: {
  code: string;
  adminUserId: string;
  reason?: string;
}) {
  const order = await getOrderByCodeOrShort(input.code);
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

/**
 * Owner replied YES to the phone ping. Single place that flips an
 * awaiting-owner order to paid: delegates to verifyPaymentOrder, so the
 * generations-unlock hook and audit trail run exactly as the manual
 * admin-verify path.
 */
export async function setOrderPaidByOwner(input: { code: string }) {
  const order = await getOrderByCodeOrShort(input.code);
  return verifyPaymentOrder({ code: order.code, adminUserId: 'owner' });
}

/**
 * Owner replied NO to the phone ping (payment not received). The order
 * goes back to PAYMENT_PENDING — NOT PAYMENT_REJECTED — so the user can
 * check their UPI app and tap "I've paid" again. Ping throttle resets
 * so the re-claim pings the owner again.
 */
export async function rejectOrderPayment(input: { code: string }) {
  const order = await getOrderByCodeOrShort(input.code);
  if (order.status !== 'PAYMENT_AWAITING_OWNER') {
    throw new PaymentHttpError(
      409,
      'ORDER_NOT_AWAITING_OWNER',
      `Order is ${order.status}; cannot send back to pending.`
    );
  }
  await db
    .update(orders)
    .set({ status: 'PAYMENT_PENDING', ownerPingedAt: null, pingCount: 0 })
    .where(eq(orders.id, order.id));
  await db.insert(auditLogs).values({
    actorUserId: 'owner',
    action: 'payment.claim_rejected',
    target: { code: order.code, shortCode: order.shortCode },
  });
  return { status: 'PAYMENT_PENDING' as PaymentOrderState };
}

/** Phone-ping throttle: ping at most every 4 minutes, max 5 pings per order. */
export const OWNER_PING_INTERVAL_MS = 4 * 60 * 1000;
export const OWNER_PING_MAX = 5;

/**
 * Pure predicate the payment-watch cron uses to decide whether an
 * awaiting-owner order needs another phone ping right now.
 */
export function shouldPingOwner(
  order: { ownerPingedAt: Date | null; pingCount: number },
  now: number = Date.now()
): boolean {
  if (order.pingCount >= OWNER_PING_MAX) return false;
  if (!order.ownerPingedAt) return true;
  return now - order.ownerPingedAt.getTime() >= OWNER_PING_INTERVAL_MS;
}
