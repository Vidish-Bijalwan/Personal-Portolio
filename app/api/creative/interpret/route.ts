export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth';
import {
  interpretCreative,
  ModerationBlockedError,
} from '@/lib/creative/interpret';

/**
 * POST /api/creative/interpret
 * Body: { prompt: string, aspectRatio?: string, quality?: string }
 * Returns: CreativeSpec (deterministic rule-based parse).
 * On blocklist match: 400 { code: 'MODERATION_BLOCKED' } + best-effort
 * moderationEvents audit row.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
  const aspectRatio =
    typeof body?.aspectRatio === 'string' ? body.aspectRatio : undefined;
  const quality =
    typeof body?.quality === 'string' ? body.quality : undefined;

  let userId: string | null = null;
  try {
    userId = (await getSessionUser())?.id ?? null;
  } catch {
    userId = null; // auth is optional here; best effort only
  }

  try {
    const spec = interpretCreative({ prompt, aspectRatio, quality });
    return NextResponse.json(spec);
  } catch (err: any) {
    const code = err?.code as string | undefined;
    if (err instanceof ModerationBlockedError || code === 'MODERATION_BLOCKED') {
      // Best-effort audit row; never fail the request on it.
      try {
        await db.insert(schema.moderationEvents).values({
          userId,
          kind: 'prompt_blocked',
          detail: {
            code: 'MODERATION_BLOCKED',
            matched: err?.matched ?? [],
            prompt: prompt.slice(0, 500),
          },
        });
      } catch {
        /* best effort */
      }
      return NextResponse.json(
        {
          code: 'MODERATION_BLOCKED',
          error: 'Prompt blocked by moderation',
          matched: err?.matched ?? [],
        },
        { status: 400 }
      );
    }
    if (code === 'INVALID_PROMPT') {
      return NextResponse.json(
        { code, error: err?.message ?? 'Invalid prompt' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { code: 'INTERPRET_FAILED', error: 'Failed to interpret prompt' },
      { status: 500 }
    );
  }
}
