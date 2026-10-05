export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedVideoJob } from '@/lib/video/access';

/**
 * GET /api/video-jobs/[id]/status
 * Owner-gated (user_id match): 404 when missing, 403 when not the owner.
 * Waiting-room status for a Video Studio job.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { job, error } = await getOwnedVideoJob(id, user.id);
  if (error) return error;

  return NextResponse.json({
    tool: job.tool,
    status: job.status,
    stage: job.stage,
    unlocked: job.unlocked,
    pricePaise: job.priceCents,
    ...(job.error ? { error: job.error } : {}),
  });
}
