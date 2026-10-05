export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { videoJobs } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { toBuffer } from '@/lib/video/access';

/**
 * GET /api/admin/video-jobs/[id]/input
 * Admin token auth. Returns the job's uploaded source video bytes as
 * video/mp4 (binary). The claim endpoint deliberately returns no bytea;
 * the watcher fetches the input here after claiming.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(_req);
  if (authFail) return authFail;

  const { id } = await params;
  const rows = await db
    .select({ input: videoJobs.input, inputMime: videoJobs.inputMime })
    .from(videoJobs)
    .where(eq(videoJobs.id, id))
    .limit(1);
  const row = rows[0];
  const bytes = row ? toBuffer(row.input) : null;
  if (!row || !bytes) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Input video not found' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': row.inputMime || 'video/mp4',
      'content-length': String(bytes.byteLength),
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
