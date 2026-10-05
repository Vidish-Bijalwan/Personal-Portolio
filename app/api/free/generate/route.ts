export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import {
  FREE_DAILY_CAP,
  PROMPT_MAX,
  isValidPrompt,
} from '@/lib/free/policy';
import { countFreeImagesToday } from '@/lib/free/access';

/**
 * POST /api/free/generate
 * Body: { prompt, quality?, aspectRatio?, media_type? }
 * Free-tier IMAGES only — media_type=video is rejected (use /api/video/order).
 * Auth required. Prompt 1..2000 chars. 3 free images / user / IST day
 * (failed rows don't consume cap) → 429 FREE_CAP_REACHED beyond that.
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
        error: `prompt must be ${1}..${PROMPT_MAX} characters`,
      },
      { status: 400 }
    );
  }

  const mediaType = body?.media_type ?? body?.mediaType ?? 'image';
  if (mediaType === 'video') {
    return NextResponse.json(
      {
        code: 'VIDEO_NOT_ALLOWED',
        error: 'Video goes through /api/video/order, not the free tier',
      },
      { status: 400 }
    );
  }
  if (mediaType !== 'image') {
    return NextResponse.json(
      { code: 'INVALID_MEDIA_TYPE', error: 'media_type must be image' },
      { status: 400 }
    );
  }

  const quality =
    typeof body?.quality === 'string' && body.quality.length <= 32
      ? body.quality
      : 'studio';
  const aspectRatio =
    typeof body?.aspectRatio === 'string' && body.aspectRatio.length <= 16
      ? body.aspectRatio
      : '1:1';

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

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt: prompt.trim(),
      quality,
      aspectRatio,
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
    })
    .returning({ id: generations.id });

  return NextResponse.json({ id: row.id }, { status: 201 });
}
