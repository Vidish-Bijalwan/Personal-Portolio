export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedVideoJob, toBuffer } from '@/lib/video/access';
import { OUTPUT_MIME_EXT } from '@/lib/video/constants';

/**
 * GET /api/video-jobs/[id]/clean
 * Owner-gated. 402 {code:'LOCKED'} unless unlocked=true (₹39 payment
 * verified). 404 unless status=done with clean bytes stored.
 * Serves the clean file as an attachment download (mp4, mp3 or gif
 * depending on the tool).
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

  const mime = job.mime || 'video/mp4';
  const ext =
    (OUTPUT_MIME_EXT as Record<string, string>)[mime] ?? 'mp4';
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': mime,
      'content-length': String(bytes.byteLength),
      'content-disposition': `attachment; filename="etch-${job.id}.${ext}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
