export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { buildReferenceBundle } from '@/lib/fulfillment/bundle';
import {
  latestOrderForJob,
  loadFulfillmentDetail,
} from '@/lib/fulfillment/detail';

/**
 * GET /api/admin/fulfillment/[id]/bundle
 * ZIP download `<orderCode>.zip`:
 * `<orderCode>/order.json`, `<orderCode>/prompt.txt`,
 * `<orderCode>/references/<filename>`
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  const { id } = await params;

  const detail = await loadFulfillmentDetail(id);
  if (!detail) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
  }
  const order = await latestOrderForJob(id);
  if (!order) {
    return NextResponse.json({ error: 'NO_ORDER' }, { status: 404 });
  }

  const { job, references } = detail;
  let zip: Buffer;
  try {
    zip = await buildReferenceBundle(
      {
        id: job.id,
        prompt: job.prompt,
        task: job.task,
        jobKind: job.jobKind,
        aspectRatio: job.aspectRatio,
        quality: job.quality,
        state: job.state,
        createdAt: job.createdAt,
      },
      {
        code: order.code,
        amountPaise: order.amountPaise,
        status: order.status,
        userId: order.userId,
      },
      references.map((r) => ({
        id: r.id,
        url: r.url,
        mimeType: r.mimeType,
        filename: r.filename,
      }))
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: 'BUNDLE_FAILED',
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }

  const filename = `${order.code}.zip`;
  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zip.length),
    },
  });
}
