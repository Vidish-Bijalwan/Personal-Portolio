export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, getTakes, patchJob } from '@/lib/fulfillment/job';

/**
 * POST /api/admin/fulfillment/[id]/deliver {takeId?, qcNotes?}
 * OPERATOR_QC → READY. Sets outputAssetId (chosen take, default latest),
 * deliveredAt=now, fulfillmentSource='operator'.
 */
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
    const takeId = typeof body?.takeId === 'string' ? body.takeId : null;
    const qcNotes =
      typeof body?.qcNotes === 'string' && body.qcNotes.trim()
        ? body.qcNotes.trim()
        : null;

    const takes = await getTakes(job.id);
    if (takes.length === 0) {
      return NextResponse.json({ error: 'NO_TAKES' }, { status: 409 });
    }
    const take = takeId
      ? takes.find((t) => t.id === takeId)
      : takes[takes.length - 1];
    if (!take) {
      return NextResponse.json({ error: 'TAKE_NOT_FOUND' }, { status: 404 });
    }
    if (!take.assetId) {
      return NextResponse.json({ error: 'TAKE_HAS_NO_ASSET' }, { status: 409 });
    }

    assertTransition(job.state, 'READY');
    await patchJob(job.id, {
      state: 'READY',
      outputAssetId: take.assetId,
      deliveredAt: new Date(),
      fulfillmentSource: 'operator',
      ...(qcNotes !== null ? { qcNotes } : {}),
    });
    await auditAdmin('fulfillment.deliver', {
      jobId: job.id,
      takeId: take.id,
      takeLabel: take.takeLabel,
      assetId: take.assetId,
      qcNotes,
    });
    return NextResponse.json(
      {
        ok: true,
        jobId: job.id,
        state: 'READY',
        takeId: take.id,
        assetId: take.assetId,
      },
      { status: 200 }
    );
  });
}
