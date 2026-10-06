export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { PROMPT_MAX, VIDEO_PRICE_PAISE, isValidPrompt } from '@/lib/free/policy';
import { createGenerationOrder } from '@/lib/free/orders';

/**
 * POST /api/video/order
 * Body: { prompt (1..2000), aspectRatio? }
 * Auth required. Creates a paid video generation (tier='paid',
 * media_type='video', ₹89 = 8900 paise) + a manual-UPI order linked with
 * purpose='video'. No daily cap. The watcher generates the clip
 * immediately on order (before payment); the watermarked preview shows
 * while payment is pending and the clean mp4 unlocks on owner verify.
 * Returns { id, payment } where payment matches the payment modal shape.
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
    })
    .returning({ id: generations.id });

  let order;
  try {
    order = await createGenerationOrder({
      generationId: gen.id,
      userId: user.id,
      amountPaise: VIDEO_PRICE_PAISE,
      purpose: 'video',
      stubPrompt: `Paid video order for generation ${gen.id}`,
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

  return NextResponse.json(
    { id: gen.id, payment: order.payment },
    { status: 201 }
  );
}
