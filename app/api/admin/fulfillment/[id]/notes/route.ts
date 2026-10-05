export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { auditAdmin, withAdminTransition } from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/** POST /api/admin/fulfillment/[id]/notes {body} — append timestamped entry to operatorNotes */
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
    const note = typeof body?.body === 'string' ? body.body.trim() : '';
    if (!note) {
      return NextResponse.json({ error: 'BODY_REQUIRED' }, { status: 400 });
    }
    const entry = `[${new Date().toISOString()}] ${note}`;
    const merged = job.operatorNotes
      ? `${job.operatorNotes}\n${entry}`
      : entry;
    await patchJob(job.id, { operatorNotes: merged });
    await auditAdmin('fulfillment.note', { jobId: job.id, note });
    return NextResponse.json(
      { ok: true, jobId: job.id, operatorNotes: merged },
      { status: 200 }
    );
  });
}
