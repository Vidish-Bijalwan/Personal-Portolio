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
 * GET /api/gen/[id]/preview
 * Owner-gated. 404 unless status=done AND watermarked bytes exist.
 * Serves the watermarked deliverable inline (JPEG/PNG for images,
 * mp4 for video), nosniff, private cache.
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

  const bytes = toBuffer(gen.watermarked);
  if (gen.status !== 'done' || !bytes) {
    return NextResponse.json(
      { code: 'PREVIEW_NOT_READY', error: 'Preview is not ready yet' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': gen.mime,
      'content-length': String(bytes.byteLength),
      'content-disposition': `inline; filename="vidish-${gen.id}.${extFor(gen.mime)}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
