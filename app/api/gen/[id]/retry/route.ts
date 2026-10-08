export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { freeGenerationAttachments, generations } from '@/lib/db/schema';
import { MISSING_REFERENCE_MESSAGE, needsReferencePhoto } from '@/lib/person-reference';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration, countFreeImagesToday } from '@/lib/free/access';
import {
  FREE_DAILY_CAP,
  canRetryFromStatus,
  isValidPrompt,
} from '@/lib/free/policy';

/**
 * POST /api/gen/[id]/retry
 * Owner-gated. Launches a NEW attempt for a failed or stuck generation:
 * same prompt (or an explicit rephrase supplied in the body), same media /
 * tier, fresh queued row; the client navigates to the new watch room.
 *
 * The source row is marked failed first when it was still open, so a
 * stalled watcher claim can't double-process it. The state machine is
 * terminal on 'failed', so retries always mint a new row rather than
 * rewinding history.
 *
 * Free-tier images respect the daily cap: failures never consumed it, and
 * the new attempt counts as one. Optional body: { prompt } — a rephrase
 * the user picked (e.g. the watch room's safer suggestion), 1..2000 chars.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { gen, error } = await getOwnedGeneration(id, user.id);
  if (error) return error;

  if (!canRetryFromStatus(gen.status)) {
    return NextResponse.json(
      {
        code: 'NOT_RETRYABLE',
        error: 'This generation already finished — no need to retry.',
      },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  let prompt = gen.prompt;
  if (body?.prompt !== undefined) {
    if (!isValidPrompt(body.prompt)) {
      return NextResponse.json(
        {
          code: 'INVALID_PROMPT',
          error: 'prompt must be 1..2000 characters',
        },
        { status: 400 }
      );
    }
    prompt = body.prompt.trim();
  }

  // Pre-generation reference-photo check: the retry mints a fresh queued
  // row with no new file upload. If the (possibly rephrased) prompt asks
  // for a specific person, the original's reference photo — if any — is
  // carried over; otherwise fail fast instead of queueing a doomed row.
  const originalAttachments = await db
    .select()
    .from(freeGenerationAttachments)
    .where(eq(freeGenerationAttachments.generationId, gen.id));
  if (needsReferencePhoto(prompt) && originalAttachments.length === 0) {
    return NextResponse.json(
      {
        code: 'MISSING_REFERENCE',
        error: MISSING_REFERENCE_MESSAGE,
      },
      { status: 400 }
    );
  }

  if (gen.tier === 'free' && gen.mediaType === 'image') {
    const used = await countFreeImagesToday(user.id);
    if (used >= FREE_DAILY_CAP) {
      return NextResponse.json(
        {
          code: 'FREE_CAP_REACHED',
          error: `Daily free limit reached (${FREE_DAILY_CAP} images/day). Try again tomorrow.`,
        },
        { status: 429 }
      );
    }
  }

  // Stop a stalled open row before cloning it.
  if (gen.status !== 'failed') {
    await db
      .update(generations)
      .set({
        status: 'failed',
        errorCode: 'technical',
        error: 'Stopped after a stall — replaced by a fresh attempt.',
        updatedAt: new Date(),
      })
      .where(eq(generations.id, gen.id));
  }

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt,
      quality: gen.quality,
      aspectRatio: gen.aspectRatio,
      mediaType: gen.mediaType,
      tier: gen.tier,
      status: 'queued',
      // Preserve the pricing-job link so generate-first paid images stay
      // unlockable after a retry (the unlock order prices from the job).
      jobId: gen.jobId,
    })
    .returning({ id: generations.id });

  // Carry the original's reference photo(s) to the new attempt so a
  // transient failure doesn't lose them (and the guard above stays sound).
  if (originalAttachments.length > 0) {
    await db.insert(freeGenerationAttachments).values(
      originalAttachments.map((a) => ({
        generationId: row.id,
        filename: a.filename,
        mimeType: a.mimeType,
        byteSize: a.byteSize,
        data: a.data,
      }))
    );
  }

  return NextResponse.json({ id: row.id }, { status: 201 });
}
