export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/to-qc — RESULT_UPLOADED → OPERATOR_QC */
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
    assertTransition(job.state, 'OPERATOR_QC');
    await patchJob(job.id, { state: 'OPERATOR_QC' });
    await auditAdmin('fulfillment.to_qc', { jobId: job.id, to: 'OPERATOR_QC' });
    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'OPERATOR_QC' },
      { status: 200 }
    );
  });
}
