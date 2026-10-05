export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration } from '@/lib/free/access';
import {
  isGenerationErrorCode,
  isStuck,
  suggestSaferPrompt,
} from '@/lib/free/policy';

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

  return NextResponse.json({
    media_type: gen.mediaType,
    tier: gen.tier,
    status: gen.status,
    stage: gen.stage,
    unlocked: gen.unlocked,
    ...(isGenerationErrorCode(gen.errorCode)
      ? { error_code: gen.errorCode }
      : {}),
    ...(gen.error ? { error: gen.error } : {}),
    ...(isStuck(gen.status, gen.updatedAt) ? { stuck: true } : {}),
    ...(safer ? { suggested_prompt: safer } : {}),
  });
}
