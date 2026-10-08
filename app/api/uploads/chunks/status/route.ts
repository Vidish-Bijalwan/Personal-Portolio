export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getUploadStatus } from '@/lib/muse/chunked-uploads';

/**
 * GET /api/uploads/chunks/status?sessionId=…
 * Auth required. Authoritative resume state: which chunk indices the
 * server already has. The client merges this with its localStorage
 * progress after a reload instead of restarting the upload.
 */
export async function GET(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const sessionId = req.nextUrl.searchParams.get('sessionId') ?? '';
  const result = await getUploadStatus(user.id, sessionId);
  if (!result.ok) {
    const code =
      result.status === 410
        ? 'SESSION_EXPIRED'
        : result.status === 403
          ? 'FORBIDDEN'
          : 'SESSION_NOT_FOUND';
    return NextResponse.json(
      { code, error: result.error },
      { status: result.status ?? 404 }
    );
  }
  return NextResponse.json(result.session);
}
