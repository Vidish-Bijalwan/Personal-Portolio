export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationJobs, orders } from '@/lib/db/schema';
import {
  PaymentHttpError,
  verifyPaymentOrder,
} from '@/lib/payments/manual-upi';
import { canTransition } from '@/lib/vilish/types';

function unauthorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN;
}

/**
 * POST {verifiedAmountPaise?, acknowledgeDuplicate?}
 * On PAYMENT_VERIFIED the job moves PAYMENT_PENDING → PAID → QUEUED
 * (sequentially, skipping gracefully when a transition is illegal).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { code } = await params;
  try {
    const body = await req.json().catch(() => null);
    const result = await verifyPaymentOrder({
      code,
      // Token-based admin auth has no user record; audit actor is the role.
      adminUserId: 'admin',
      verifiedAmountPaise: body?.verifiedAmountPaise,
      acknowledgeDuplicate: body?.acknowledgeDuplicate,
    });
    if (result.status === 'AMOUNT_MISMATCH') {
      return NextResponse.json(
        {
          ok: true,
          status: 'AMOUNT_MISMATCH',
          message: 'Amount mismatch — generation NOT queued',
        },
        { status: 200 }
      );
    }
    const [job] = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, result.jobId))
      .limit(1);
    let queued = false;
    if (job && canTransition(job.state, 'PAID')) {
      await db
        .update(generationJobs)
        .set({ state: 'PAID' })
        .where(eq(generationJobs.id, job.id));
      if (canTransition('PAID', 'QUEUED')) {
        await db
          .update(generationJobs)
          .set({ state: 'QUEUED' })
          .where(eq(generationJobs.id, job.id));
        queued = true;
      }
    }
    if (queued) {
      await db
        .update(orders)
        .set({ status: 'GENERATION_QUEUED' })
        .where(eq(orders.code, code));
    }
    return NextResponse.json(
      { ok: true, jobId: result.jobId, status: result.status },
      { status: 200 }
    );
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
