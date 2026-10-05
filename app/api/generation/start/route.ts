export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';
import { createManualPaymentOrder } from '@/lib/payments/manual-upi';
import { canTransition } from '@/src/lib/vilish/types';

/**
 * POST /api/generation/start
 * Body: { quoteId: string, country?: string }
 * Auth required. India (UPI) only: any other country -> 400
 * INTL_PAYMENTS_COMING_SOON. Creates a manual-UPI payment order, persists
 * it, and moves the job QUOTED -> PAYMENT_PENDING. The customer pays in
 * their UPI app, submits the UTR, and an admin verifies it before the job
 * queues. No Razorpay anywhere in this flow.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', error: 'Sign in required' },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const quoteId = typeof body?.quoteId === 'string' ? body.quoteId : null;
  if (!quoteId) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'quoteId is required' },
      { status: 400 }
    );
  }

  const country =
    typeof body?.country === 'string' && body.country.trim()
      ? body.country.trim().toUpperCase()
      : 'IN';
  if (country !== 'IN') {
    return NextResponse.json(
      {
        code: 'INTL_PAYMENTS_COMING_SOON',
        message:
          'International payments coming soon — India (UPI) only for now',
      },
      { status: 400 }
    );
  }

  const quoteRows = await db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.id, quoteId))
    .limit(1);
  const quote = quoteRows[0];
  if (!quote || !quote.jobId) {
    return NextResponse.json(
      { code: 'QUOTE_NOT_FOUND', error: 'Quote not found' },
      { status: 404 }
    );
  }
  if (new Date(quote.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { code: 'QUOTE_EXPIRED', error: 'Quote expired' },
      { status: 410 }
    );
  }

  const jobRows = await db
    .select()
    .from(schema.generationJobs)
    .where(eq(schema.generationJobs.id, quote.jobId))
    .limit(1);
  const job = jobRows[0];
  if (!job) {
    return NextResponse.json(
      { code: 'JOB_NOT_FOUND', error: 'Job not found' },
      { status: 404 }
    );
  }
  if (job.state !== 'QUOTED') {
    return NextResponse.json(
      { code: 'INVALID_STATE', error: `Job is ${job.state}, expected QUOTED` },
      { status: 409 }
    );
  }

  let payment: {
    code: string;
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    amountPaise: number;
    expiresAt: string;
  };
  try {
    payment = await createManualPaymentOrder({
      jobId: job.id,
      userId: user.id,
      amountPaise: quote.totalPaise,
    });
  } catch {
    return NextResponse.json(
      { code: 'PAYMENT_ORDER_FAILED', error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  if (!canTransition(job.state, 'PAYMENT_PENDING')) {
    return NextResponse.json(
      { code: 'INVALID_STATE', error: 'Job cannot move to PAYMENT_PENDING' },
      { status: 409 }
    );
  }
  await db
    .update(schema.generationJobs)
    .set({ state: 'PAYMENT_PENDING', updatedAt: new Date() })
    .where(eq(schema.generationJobs.id, job.id));

  return NextResponse.json({
    jobId: job.id,
    payment: {
      code: payment.code,
      upiUri: payment.upiUri,
      ...(payment.qrDataUri ? { qrDataUri: payment.qrDataUri } : {}),
      ...(payment.qrImageUrl ? { qrImageUrl: payment.qrImageUrl } : {}),
      vpa: payment.vpa,
      payeeName: payment.payeeName,
      amountPaise: payment.amountPaise,
      expiresAt: payment.expiresAt,
    },
  });
}
