export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { finalizeChunkedUpload } from '@/lib/muse/chunked-uploads';

/**
 * POST /api/uploads/chunks/finalize
 * Body (JSON): { sessionId }
 * Auth required. Assembles the chunks in order, then runs the SAME
 * validation the direct path gets: per-file total size caps and the
 * magic-byte content check on the assembled bytes. Returns a `fileId`
 * the order routes accept as an `uploadIds` entry. A missing chunk or
 * failed check returns a clear 4xx — never a truncated file.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
  const result = await finalizeChunkedUpload(user.id, sessionId);

  if (!result.ok) {
    const code =
      result.status === 410
        ? 'SESSION_EXPIRED'
        : result.status === 403
          ? 'FORBIDDEN'
          : result.status === 413
            ? 'FILE_TOO_LARGE'
            : 'FINALIZE_FAILED';
    return NextResponse.json(
      { code, error: result.error },
      { status: result.status ?? 400 }
    );
  }
  return NextResponse.json(result.file, { status: 201 });
}
