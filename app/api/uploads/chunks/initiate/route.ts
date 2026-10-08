export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { initiateChunkedUpload } from '@/lib/muse/chunked-uploads';

/**
 * POST /api/uploads/chunks/initiate
 * Body (JSON): { name, size, mimeType, chunkSize? }
 * Auth required. Validates the file against the intake policy
 * (image/video allowlist, per-file totals: images 8MB / videos 100MB)
 * and opens a resumable session. The chunk plan (chunkSize/totalChunks)
 * in the response is authoritative — the client must use it.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const result = await initiateChunkedUpload(user.id, {
    name: typeof body?.name === 'string' ? body.name : '',
    size: Number(body?.size),
    mimeType: typeof body?.mimeType === 'string' ? body.mimeType : '',
    chunkSize:
      body?.chunkSize === undefined ? undefined : Number(body.chunkSize),
  });

  if (!result.ok) {
    return NextResponse.json(
      { code: 'UPLOAD_REJECTED', error: result.error },
      { status: 400 }
    );
  }
  return NextResponse.json(result.session, { status: 201 });
}
