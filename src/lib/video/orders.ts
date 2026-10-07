/**
 * Etch — manual-UPI order plumbing for the video_jobs table.
 *
 * Mirrors src/lib/free/orders.ts: orders.job_id is NOT NULL with an FK
 * to generation_jobs, so every video-job payment first creates a minimal
 * operator stub job (DRAFT, never routed anywhere) and then the real
 * manual-UPI order via the EXISTING createManualPaymentOrder — no new
 * payment system. The verify hook flips video_jobs.unlocked from the
 * video_job_orders link (purpose='video_studio').
 */
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import {
  ManualUpiProvider,
  createManualPaymentOrder,
} from '@/lib/payments/manual-upi';
import { VIDEO_JOB_PRICE_PAISE } from './constants';

/** Matches the ManualPayment shape the payment modal expects. */
export interface VideoJobPayment {
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
): VideoJobPayment {
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
 * Create the stub generation_jobs row that orders.job_id requires, then
 * a ₹39 manual-UPI order, then the video_job_orders link.
 */
export async function createVideoJobOrder(input: {
  videoJobId: string;
  userId: string;
  tool: string;
}): Promise<{ orderId: string; payment: VideoJobPayment }> {
  const [stub] = await db
    .insert(schema.generationJobs)
    .values({
      userId: input.userId,
      prompt: `Video Studio ${input.tool} job ${input.videoJobId}`,
      aspectRatio: '16:9',
      quality: 'studio',
      customerPrice: VIDEO_JOB_PRICE_PAISE,
      fulfillmentMode: 'operator',
      jobKind: 'generation',
    })
    .returning();

  const payment = await createManualPaymentOrder({
    jobId: stub.id,
    userId: input.userId,
    amountPaise: VIDEO_JOB_PRICE_PAISE,
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

  await db.insert(schema.videoJobOrders).values({
    orderId: order.id,
    videoJobId: input.videoJobId,
    purpose: 'video_studio',
  });

  return {
    orderId: order.id,
    payment: toPaymentShape(payment.code, payment.amountPaise, payment),
  };
}

/**
 * Find an existing still-pending order link for (videoJob, 'video_studio').
 * Used to make payment resume idempotent: a second payment open resumes
 * the pending order instead of minting a duplicate.
 */
export async function findPendingVideoJobOrderLink(
  videoJobId: string
): Promise<{ orderId: string; payment: VideoJobPayment } | null> {
  const links = await db
    .select()
    .from(schema.videoJobOrders)
    .where(
      and(
        eq(schema.videoJobOrders.videoJobId, videoJobId),
        eq(schema.videoJobOrders.purpose, 'video_studio')
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
