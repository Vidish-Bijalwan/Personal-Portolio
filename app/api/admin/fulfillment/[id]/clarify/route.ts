export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/clarify {message} — → NEEDS_CLARIFICATION */
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
    const message =
      typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json(
        { error: 'MESSAGE_REQUIRED' },
        { status: 400 }
      );
    }
    assertTransition(job.state, 'NEEDS_CLARIFICATION');
    await patchJob(job.id, {
      state: 'NEEDS_CLARIFICATION',
      clarificationRequest: message,
    });
    await auditAdmin('fulfillment.clarify', { jobId: job.id, message });
    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'NEEDS_CLARIFICATION' },
      { status: 200 }
    );
  });
}
