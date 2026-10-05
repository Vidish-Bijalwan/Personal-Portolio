export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/start — APPROVED_FOR_GENERATION → GENERATING */
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
    assertTransition(job.state, 'GENERATING');
    await patchJob(job.id, { state: 'GENERATING' });
    await auditAdmin('fulfillment.start', { jobId: job.id, to: 'GENERATING' });
    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'GENERATING' },
      { status: 200 }
    );
  });
}
