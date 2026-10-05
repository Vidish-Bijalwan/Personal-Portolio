export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration } from '@/lib/free/access';

/**
 * GET /api/gen/[id]/status
 * Owner-gated (user_id match): 404 when missing, 403 when not the owner.
 * Media-agnostic waiting-room status.
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

  return NextResponse.json({
    media_type: gen.mediaType,
    tier: gen.tier,
    status: gen.status,
    stage: gen.stage,
    unlocked: gen.unlocked,
    ...(gen.error ? { error: gen.error } : {}),
  });
}
