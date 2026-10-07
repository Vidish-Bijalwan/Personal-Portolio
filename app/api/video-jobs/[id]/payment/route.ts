export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getOwnedVideoJob } from '@/lib/video/access';
import { findPendingVideoJobOrderLink } from '@/lib/video/orders';

/**
 * POST /api/video-jobs/[id]/payment
 * Owner-gated. Resumes the pending per-tool manual-UPI order for this video
 * job (created at job-start time) and returns it in the payment-modal
 * shape. 409 when already unlocked, 404 when no pending order exists
 * (expired or already verified — the watch room then points at status).
 * The pay-ping flow runs unchanged: "I've paid" → owner ping → verify
 * hook flips video_jobs.unlocked.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { job, error } = await getOwnedVideoJob(id, user.id);
  if (error) return error;

  if (job.unlocked) {
    return NextResponse.json(
      { code: 'ALREADY_UNLOCKED', error: 'Already unlocked' },
      { status: 409 }
    );
  }

  const resumed = await findPendingVideoJobOrderLink(job.id);
  if (!resumed) {
    return NextResponse.json(
      {
        code: 'NO_PENDING_ORDER',
        error: 'No pending payment for this job — it may have expired',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ id: job.id, payment: resumed.payment });
}
