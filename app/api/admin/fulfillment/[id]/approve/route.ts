export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/approve — AWAITING_OPERATOR_REVIEW → APPROVED_FOR_GENERATION */
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
    assertTransition(job.state, 'APPROVED_FOR_GENERATION');
    await patchJob(job.id, { state: 'APPROVED_FOR_GENERATION' });
    await auditAdmin('fulfillment.approve', { jobId: job.id, to: 'APPROVED_FOR_GENERATION' });
    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'APPROVED_FOR_GENERATION' },
      { status: 200 }
    );
  });
}
