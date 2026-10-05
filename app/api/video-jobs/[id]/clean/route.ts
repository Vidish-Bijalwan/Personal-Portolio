export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedVideoJob, toBuffer } from '@/lib/video/access';

/**
 * GET /api/video-jobs/[id]/clean
 * Owner-gated. 402 {code:'LOCKED'} unless unlocked=true (₹49 payment
 * verified). 404 unless status=done with clean bytes stored.
 * Serves the clean mp4 as an attachment download.
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

  if (!job.unlocked) {
    return NextResponse.json(
      {
        code: 'LOCKED',
        error: 'Clean download unlocks after payment verification',
      },
      { status: 402 }
    );
  }

  const bytes = toBuffer(job.clean);
  if (job.status !== 'done' || !bytes) {
    return NextResponse.json(
      { code: 'NOT_READY', error: 'Clean file is not ready yet' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': 'video/mp4',
      'content-length': String(bytes.byteLength),
      'content-disposition': `attachment; filename="pixaura-${job.id}.mp4"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
