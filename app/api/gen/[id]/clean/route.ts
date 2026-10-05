export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration, toBuffer } from '@/lib/free/access';

function extFor(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'video/mp4') return 'mp4';
  return 'jpg';
}

/**
 * GET /api/gen/[id]/clean
 * Owner-gated. 402 {code:'LOCKED'} unless unlocked=true (payment
 * verified). 404 unless status=done with clean bytes stored.
 * Serves the clean deliverable as an attachment download.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { gen, error } = await getOwnedGeneration(id, user.id);
  if (error) return error;

  if (!gen.unlocked) {
    return NextResponse.json(
      {
        code: 'LOCKED',
        error: 'Clean download unlocks after payment verification',
      },
      { status: 402 }
    );
  }

  const bytes = toBuffer(gen.clean);
  if (gen.status !== 'done' || !bytes) {
    return NextResponse.json(
      { code: 'NOT_READY', error: 'Clean file is not ready yet' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': gen.mime,
      'content-length': String(bytes.byteLength),
      'content-disposition': `attachment; filename="vidish-${gen.id}.${extFor(gen.mime)}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
