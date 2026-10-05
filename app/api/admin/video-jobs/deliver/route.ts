export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { videoJobs } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { mimeForMagic } from '@/lib/free/policy';
import { decodeB64Strict } from '@/lib/video/validate';
import { canTransitionVideoJob } from '@/lib/video/constants';

/** Max deliverable bytes per mp4 file: 50MB. */
const OUTPUT_MAX_BYTES = 50 * 1024 * 1024;

/**
 * POST /api/admin/video-jobs/deliver
 * Admin token auth. Body: { id, watermarked_b64, clean_b64, mime }.
 * Stores the watcher deliverables (watermarked + clean mp4) on a
 * video_jobs row and marks it done. Both files must be video/mp4
 * (magic-byte validated) and ≤50MB each. Does NOT touch `unlocked` —
 * that flips only via the payment verify hook (purpose='video_studio').
 * Walks the state machine to 'done' through legal hops
 * (queued → processing → done).
 */
export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== 'string' || !id) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'id is required' },
      { status: 400 }
    );
  }

  const rows = await db
    .select()
    .from(videoJobs)
    .where(eq(videoJobs.id, id))
    .limit(1);
  const job = rows[0];
  if (!job) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Video job not found' },
      { status: 404 }
    );
  }

  // Walk the state machine to 'done' through legal hops so the
  // transition matrix stays authoritative.
  const hops = job.status === 'queued' ? ['processing', 'done'] : ['done'];
  let from = job.status;
  for (const to of hops) {
    if (!canTransitionVideoJob(from, to)) {
      return NextResponse.json(
        {
          code: 'INVALID_STATE',
          error: `Cannot deliver: status is ${job.status}`,
        },
        { status: 409 }
      );
    }
    from = to;
  }

  const claimedMime: string | undefined =
    typeof body?.mime === 'string' ? body.mime : undefined;
  if (claimedMime !== undefined && claimedMime !== 'video/mp4') {
    return NextResponse.json(
      { code: 'INVALID_MIME', error: 'mime must be video/mp4' },
      { status: 400 }
    );
  }

  let watermarked: Buffer;
  let clean: Buffer;
  try {
    watermarked = decodeB64Strict('watermarked_b64', body?.watermarked_b64);
    clean = decodeB64Strict('clean_b64', body?.clean_b64);
  } catch (e) {
    return NextResponse.json(
      { code: 'INVALID_BASE64', error: (e as Error).message },
      { status: 400 }
    );
  }

  if (watermarked.byteLength > OUTPUT_MAX_BYTES || clean.byteLength > OUTPUT_MAX_BYTES) {
    return NextResponse.json(
      { code: 'FILE_TOO_LARGE', error: 'Deliverable must be 50MB or smaller' },
      { status: 400 }
    );
  }
  if (
    mimeForMagic(watermarked) !== 'video/mp4' ||
    mimeForMagic(clean) !== 'video/mp4'
  ) {
    return NextResponse.json(
      { code: 'INVALID_FILE_TYPE', error: 'Deliverables must be .mp4 files' },
      { status: 400 }
    );
  }

  await db
    .update(videoJobs)
    .set({
      watermarked,
      clean,
      mime: 'video/mp4',
      status: 'done',
      stage: null,
      updatedAt: new Date(),
    })
    .where(eq(videoJobs.id, id));

  return NextResponse.json({ ok: true, id, status: 'done' });
}
