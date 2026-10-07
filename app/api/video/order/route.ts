export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { PROMPT_MAX, isValidPrompt } from '@/lib/free/policy';
import {
  VIDEO_DURATION_MAX_S,
  VIDEO_DURATION_MIN_S,
  videoClipPricePaise,
} from '@/lib/pricing/engine';
import { createGenerationOrder } from '@/lib/free/orders';
import { verifyOrderAdminBypass } from '@/lib/payments/manual-upi';

/**
 * POST /api/video/order
 * Body: { prompt (1..2000), aspectRatio?, durationSeconds? (5..60, default 5) }
 * Auth required. Creates a paid video generation (tier='paid',
 * media_type='video') + a manual-UPI order linked with purpose='video'.
 * No daily cap. Price scales with the requested duration:
 *   price = ceil(durationSeconds / 5) × ₹45 (the clip-5s catalog price)
 * e.g. 5s → ₹45, 60s → ₹540 — see videoClipPricePaise() in the pricing
 * engine. The requested duration is stored on the generation row so the
 * operator fulfills exactly that length. The watcher generates the clip
 * immediately on order (before payment); the watermarked preview shows
 * while payment is pending and the clean mp4 unlocks on owner verify.
 * Returns { id, durationSeconds, payment } where payment matches the
 * payment modal shape.
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
  const aspectRatio =
    typeof body?.aspectRatio === 'string' && body.aspectRatio.length <= 16
      ? body.aspectRatio
      : '16:9';

  // Clip length: integer seconds, 5..60 (default 5). The price scales with
  // it, so validate BEFORE minting the generation/order rows.
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
  const amountPaise = videoClipPricePaise(durationSeconds);

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

  let order;
  try {
    order = await createGenerationOrder({
      generationId: gen.id,
      userId: user.id,
      amountPaise,
      purpose: 'video',
      stubPrompt: `Paid ${durationSeconds}s video order for generation ${gen.id}`,
      aspectRatio,
      quality: 'studio',
    });
  } catch {
    // Order creation failed: remove the queued generation row so the
    // watcher doesn't produce a video the user can never unlock.
    await db
      .delete(generations)
      .where(eq(generations.id, gen.id))
      .catch(() => {});
    return NextResponse.json(
      { code: 'PAYMENT_ORDER_FAILED', error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  // Owner/admin testing bypass: no payment needed — verify immediately so
  // the clean mp4 unlocks. Fully audit-logged as payment.admin_bypass.
  if (isAdminEmail(user.email)) {
    await verifyOrderAdminBypass({
      code: order.payment.code,
      adminUserId: user.id,
    });
    return NextResponse.json(
      { id: gen.id, durationSeconds, unlocked: true, adminBypass: true },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { id: gen.id, durationSeconds, payment: order.payment },
    { status: 201 }
  );
}
