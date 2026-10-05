export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedVideoJob, toBuffer } from '@/lib/video/access';

/**
 * GET /api/video-jobs/[id]/preview
 * Owner-gated. 404 unless status=done AND watermarked bytes exist.
 * Serves the watermarked AI-processed mp4 inline, nosniff, private cache.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { job, error } = await getOwnedVideoJob(id, user.id);
  if (error) return error;

  const bytes = toBuffer(job.watermarked);
  if (job.status !== 'done' || !bytes) {
    return NextResponse.json(
      { code: 'PREVIEW_NOT_READY', error: 'Preview is not ready yet' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': 'video/mp4',
      'content-length': String(bytes.byteLength),
      'content-disposition': `inline; filename="pixaura-${job.id}.mp4"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
