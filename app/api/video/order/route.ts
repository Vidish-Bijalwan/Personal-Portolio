export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { needsReferencePhoto } from '@/lib/person-reference';
import { PROMPT_MAX, isValidPrompt } from '@/lib/free/policy';
import {
  VIDEO_DURATION_MAX_S,
  VIDEO_DURATION_MIN_S,
} from '@/lib/pricing/engine';

/**
 * POST /api/video/order
 * Body: { prompt (1..2000), aspectRatio?, durationSeconds? (5..60, default 5) }
 * Auth required. GENERATE-FIRST: queues a paid video generation
 * (tier='paid', media_type='video') IMMEDIATELY — no order, no payment gate.
 * The queue watcher claims every queued row regardless of tier, so the
 * watermarked preview starts rendering right away and shows on the watch
 * page (/watch/[id]) while the clean mp4 stays locked behind
 * generations.unlocked=false.
 *
 * Payment happens AFTER the preview lands: on the watch room the user
 * clicks "Download clean HD — ₹X", which hits POST /api/gen/[id]/unlock.
 * That endpoint mints the order idempotently at the server-side price
 * videoClipPricePaise(durationSeconds) and the existing payment modal
 * (Cashfree primary) takes it from there. PAYMENT_VERIFIED → runUnlockHooks
 * flips generations.unlocked → the clean download opens.
 *
 * No daily cap (paid tier is uncapped; free-tier daily limits are
 * unaffected). The requested duration is stored on the generation row so
 * the operator fulfills exactly that length — prompt, duration_seconds and
 * aspect_ratio are all carried on the row for the watcher.
 *
 * Returns 201 { id, durationSeconds }.
 *
 * OPERATOR NOTE (delivery size): longer clips must be re-encoded to keep
 * the total deliverable ≤2MB (e.g. 960x540, H.264 crf 32, veryfast) before
 * hitting the deliver endpoint — retry the deliver at a smaller encode
 * on 413; the payment claim stays active.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const prompt = body?.prompt;
  if (!isValidPrompt(prompt)) {
    return NextResponse.json(
      {
        code: 'INVALID_PROMPT',
        error: `prompt must be 1..${PROMPT_MAX} characters`,
      },
      { status: 400 }
    );
  }
  // Pre-generation reference-photo check: video orders take no reference
  // files, so a prompt that asks for a specific person can never be
  // fulfilled — fail fast instead of queueing a doomed row.
  if (needsReferencePhoto(prompt)) {
    return NextResponse.json(
      {
        code: 'MISSING_REFERENCE',
        error:
          'This prompt asks for a specific person, but video clips cannot use a reference photo yet — describe the person instead.',
      },
      { status: 400 }
    );
  }

  const aspectRatio =
    typeof body?.aspectRatio === 'string' && body.aspectRatio.length <= 16
      ? body.aspectRatio
      : '16:9';

  // Clip length: integer seconds, 5..60 (default 5). The eventual unlock
  // price scales with it (videoClipPricePaise at unlock time), so validate
  // BEFORE queueing the row.
  const durationRaw = body?.durationSeconds;
  const durationSeconds =
    durationRaw === undefined || durationRaw === null
      ? VIDEO_DURATION_MIN_S
      : Number(durationRaw);
  if (
    !Number.isInteger(durationSeconds) ||
    durationSeconds < VIDEO_DURATION_MIN_S ||
    durationSeconds > VIDEO_DURATION_MAX_S
  ) {
    return NextResponse.json(
      {
        code: 'INVALID_DURATION',
        error: `durationSeconds must be an integer ${VIDEO_DURATION_MIN_S}..${VIDEO_DURATION_MAX_S}`,
      },
      { status: 400 }
    );
  }

  // Queue immediately — no order is minted here. The unlock order comes
  // later from POST /api/gen/[id]/unlock when the user clicks the CTA.
  const [gen] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt: prompt.trim(),
      quality: 'studio',
      aspectRatio,
      mediaType: 'video',
      tier: 'paid',
      status: 'queued',
      mime: 'video/mp4',
      unlocked: false,
      durationSeconds,
    })
    .returning({ id: generations.id });

  return NextResponse.json(
    { id: gen.id, durationSeconds },
    { status: 201 }
  );
}
