export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { videoJobs } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { mimeForMagic } from '@/lib/free/policy';
import {
  audioMimeForMagic,
  decodeB64Strict,
  gifMimeForMagic,
} from '@/lib/video/validate';
import { canTransitionVideoJob, OUTPUT_MIMES, type OutputMime } from '@/lib/video/constants';

/** Max deliverable bytes per file: 50MB. */
const OUTPUT_MAX_BYTES = 50 * 1024 * 1024;

/**
 * POST /api/admin/video-jobs/deliver
 * Admin token auth. Body: { id, watermarked_b64, clean_b64, mime }.
 * Stores the watcher deliverables (watermarked + clean) on a
 * video_jobs row and marks it done. mime is one of video/mp4,
 * audio/mpeg (convert tool — the preview IS the mp3; the download is
 * the paywalled part), or image/gif (gif tool). Both files are
 * magic-byte validated and ≤50MB each. Does NOT touch `unlocked` —
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

  const claimedMime: OutputMime | undefined =
    typeof body?.mime === 'string' &&
    (OUTPUT_MIMES as readonly string[]).includes(body.mime)
      ? (body.mime as OutputMime)
      : undefined;
  if (!claimedMime) {
    return NextResponse.json(
      { code: 'INVALID_MIME', error: 'mime must be video/mp4, audio/mpeg or image/gif' },
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

  const magicOk = (b: Buffer): boolean =>
    claimedMime === 'video/mp4'
      ? mimeForMagic(b) === 'video/mp4'
      : claimedMime === 'audio/mpeg'
        ? audioMimeForMagic(b) === 'audio/mpeg'
        : gifMimeForMagic(b) === 'image/gif';
  if (!magicOk(watermarked) || !magicOk(clean)) {
    return NextResponse.json(
      { code: 'INVALID_FILE_TYPE', error: `Deliverables must match ${claimedMime}` },
      { status: 400 }
    );
  }

  await db
    .update(videoJobs)
    .set({
      watermarked,
      clean,
      mime: claimedMime,
      status: 'done',
      stage: null,
      updatedAt: new Date(),
    })
    .where(eq(videoJobs.id, id));

  return NextResponse.json({ ok: true, id, status: 'done' });
}
