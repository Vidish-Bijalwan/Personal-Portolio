export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generationJobs } from '@/lib/db/schema';
import {
  createManualPaymentOrder,
  PaymentHttpError,
} from '@/lib/payments/manual-upi';

/** POST {jobId} → create a PAYMENT_PENDING manual-UPI order. */
export async function POST(req: NextRequest) {
  try {
    const { user, response: authResponse } = await requireSession();
    if (!user) return authResponse;
    const body = await req.json().catch(() => null);
    const jobId = body?.jobId;
    if (typeof jobId !== 'string' || !jobId) {
      return NextResponse.json({ error: 'INVALID_JOB' }, { status: 400 });
    }
    const [job] = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, jobId))
      .limit(1);
    if (!job || job.userId !== user.id) {
      return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
    }
    if (job.state !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { error: 'JOB_NOT_PAYMENT_PENDING', state: job.state },
        { status: 409 }
      );
    }
    // Amount comes from the server (job.customerPrice) — never the client.
    const checkout = await createManualPaymentOrder({
      jobId: job.id,
      userId: user.id,
      amountPaise: job.customerPrice,
    });
    return NextResponse.json(checkout, { status: 200 });
  } catch (e) {
    if (e instanceof PaymentHttpError) {
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
