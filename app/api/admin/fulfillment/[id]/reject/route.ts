export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/reject {reason} — → REJECTED (reason → errorMessage) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminTransition(req, async () => {
    const { id } = await params;
    const job = await getFulfillmentJob(id);
    if (!job) {
      return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
    }
    const body = await req.json().catch(() => null);
    const reason =
      typeof body?.reason === 'string' ? body.reason.trim() : '';
    if (!reason) {
      return NextResponse.json({ error: 'REASON_REQUIRED' }, { status: 400 });
    }
    assertTransition(job.state, 'REJECTED');
    await patchJob(job.id, { state: 'REJECTED', errorMessage: reason });
    await auditAdmin('fulfillment.reject', { jobId: job.id, reason });
    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'REJECTED' },
      { status: 200 }
    );
  });
}
