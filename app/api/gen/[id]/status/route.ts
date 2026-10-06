export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, eq, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration } from '@/lib/free/access';
import {
  isGenerationErrorCode,
  isStuck,
  suggestSaferPrompt,
} from '@/lib/free/policy';
import { promptInsight } from '@/lib/vilish/prompt-insight';

/**
 * GET /api/gen/[id]/status
 * Owner-gated (user_id match): 404 when missing, 403 when not the owner.
 * Media-agnostic waiting-room status.
 *
 * When the row failed with error_code='content_refused', the response
 * also carries a suggested safer rephrase of the original prompt (null
 * when the heuristic has nothing to offer), so the watch room can show
 * a one-tap "Try a safer rephrase" recovery. `stuck: true` flags
 * queued/generating rows with no progress for 15+ minutes.
 *
 * Waiting-room transparency fields (all derived, no migration):
 * - created_at: the row's creation timestamp (ISO) — drives the elapsed timer.
 * - queue_position: when queued, 1 + the number of queued generations
 *   created earlier (1 = next up); null otherwise.
 * - prompt_insight: honest keyword read of the prompt { subject, styles, mood }.
 * - prompt: the owner's own prompt (needed for the remix buttons).
 * - aspect_ratio: the requested aspect ratio (e.g. "1:1").
 * - finished_at: last row update (ISO) — the deliver step stamps it, so the
 *   result page can honestly show when the preview landed.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { gen, error } = await getOwnedGeneration(id, user.id);
  if (error) return error;

  const refused = gen.errorCode === 'content_refused';
  const safer = refused ? suggestSaferPrompt(gen.prompt) : null;

  const createdAt =
    gen.createdAt instanceof Date
      ? gen.createdAt.toISOString()
      : new Date(gen.createdAt).toISOString();
  // Last write wins as "finished" — the deliver step stamps updated_at when
  // the preview lands. Honest metadata for the result-page details card.
  const finishedAt =
    gen.updatedAt instanceof Date
      ? gen.updatedAt.toISOString()
      : new Date(gen.updatedAt).toISOString();

  let queuePosition: number | null = null;
  if (gen.status === 'queued') {
    const rows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(generations)
      .where(
        and(
          eq(generations.status, 'queued'),
          lt(generations.createdAt, gen.createdAt)
        )
      );
    queuePosition = (rows[0]?.n ?? 0) + 1;
  }

  return NextResponse.json({
    media_type: gen.mediaType,
    tier: gen.tier,
    status: gen.status,
    stage: gen.stage,
    unlocked: gen.unlocked,
    created_at: createdAt,
    queue_position: queuePosition,
    prompt_insight: promptInsight(gen.prompt),
    prompt: gen.prompt,
    aspect_ratio: gen.aspectRatio,
    finished_at: finishedAt,
    ...(isGenerationErrorCode(gen.errorCode)
      ? { error_code: gen.errorCode }
      : {}),
    ...(gen.error ? { error: gen.error } : {}),
    ...(isStuck(gen.status, gen.updatedAt) ? { stuck: true } : {}),
    ...(safer ? { suggested_prompt: safer } : {}),
  });
}
