/**
 * Etch — manual-UPI order plumbing for the generations table.
 *
 * orders.job_id is NOT NULL with an FK to generation_jobs, so every
 * generations-linked payment first creates a minimal operator stub job
 * (DRAFT, never routed anywhere) and then the real manual-UPI order via
 * the EXISTING createManualPaymentOrder — no new payment system.
 */
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import {
  ManualUpiProvider,
  createManualPaymentOrder,
} from '@/lib/payments/manual-upi';

/** Matches the ManualPayment shape the payment modal expects. */
export interface GenerationPayment {
  code: string;
  upiUri: string;
  qrDataUri?: string;
  qrImageUrl?: string;
  vpa: string;
  payeeName: string;
  amountPaise: number;
  expiresAt: string;
}

function toPaymentShape(
  code: string,
  amountPaise: number,
  p: {
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    expiresAt: string;
  }
): GenerationPayment {
  return {
    code,
    upiUri: p.upiUri,
    ...(p.qrDataUri ? { qrDataUri: p.qrDataUri } : {}),
    ...(p.qrImageUrl ? { qrImageUrl: p.qrImageUrl } : {}),
    vpa: p.vpa,
    payeeName: p.payeeName,
    amountPaise,
    expiresAt: p.expiresAt,
  };
}

/**
 * Create the stub generation_jobs row that orders.job_id requires, then a
 * manual-UPI order for `amountPaise`, then the generation_orders link.
 * The stub stays DRAFT: the payment-verify route skips job routing for it
 * (no legal DRAFT → PAID transition) and the unlock hook flips
 * generations.unlocked instead.
 */
export async function createGenerationOrder(input: {
  generationId: string;
  userId: string;
  amountPaise: number;
  purpose: 'unlock' | 'video';
  stubPrompt: string;
  aspectRatio: string;
  quality: string;
}): Promise<{ orderId: string; payment: GenerationPayment }> {
  const [stub] = await db
    .insert(schema.generationJobs)
    .values({
      userId: input.userId,
      prompt: input.stubPrompt,
      aspectRatio: input.aspectRatio,
      quality: input.quality,
      customerPrice: input.amountPaise,
      fulfillmentMode: 'operator',
      jobKind: 'generation',
    })
    .returning();

  const payment = await createManualPaymentOrder({
    jobId: stub.id,
    userId: input.userId,
    amountPaise: input.amountPaise,
  });

  const orderRows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.code, payment.code))
    .limit(1);
  const order = orderRows[0];
  if (!order) {
    throw new Error('order row missing after createManualPaymentOrder');
  }

  await db.insert(schema.generationOrders).values({
    orderId: order.id,
    generationId: input.generationId,
    purpose: input.purpose,
  });

  return { orderId: order.id, payment: toPaymentShape(payment.code, payment.amountPaise, payment) };
}

/**
 * Find an existing still-pending order link for (generation, purpose).
 * Used to make unlock idempotent: a second POST resumes the pending
 * payment instead of minting a duplicate order.
 */
export async function findPendingOrderLink(
  generationId: string,
  purpose: 'unlock' | 'video'
): Promise<{ orderId: string; payment: GenerationPayment } | null> {
  const links = await db
    .select()
    .from(schema.generationOrders)
    .where(
      and(
        eq(schema.generationOrders.generationId, generationId),
        eq(schema.generationOrders.purpose, purpose)
      )
    )
    .limit(1);
  const link = links[0];
  if (!link) return null;
  const orderRows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, link.orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order || order.status !== 'PAYMENT_PENDING') return null;
  if (order.expiresAt && order.expiresAt.getTime() < Date.now()) return null;

  const checkout = await new ManualUpiProvider().createCheckout({
    code: order.code,
    amountPaise: order.amountPaise,
  });
  return {
    orderId: order.id,
    payment: {
      ...toPaymentShape(order.code, order.amountPaise, checkout),
      expiresAt: order.expiresAt
        ? order.expiresAt.toISOString()
        : checkout.expiresAt,
    },
  };
}
