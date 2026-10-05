export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  assertTransition,
  auditAdmin,
  transitionErrorResponse,
} from '@/lib/fulfillment/guards';
import { getFulfillmentJob, patchJob } from '@/lib/fulfillment/job';

/**
 * POST /api/fulfillment/[id]/respond {message}
 * CUSTOMER route (session auth, own job only):
 * NEEDS_CLARIFICATION → AWAITING_OPERATOR_REVIEW, sets clarificationResponse.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;
  const { id } = await params;
  const job = await getFulfillmentJob(id);
  // 404 for missing OR not-owned (no ownership enumeration).
  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'MESSAGE_REQUIRED' }, { status: 400 });
  }

  try {
    assertTransition(job.state, 'AWAITING_OPERATOR_REVIEW');
  } catch (e) {
    const t = transitionErrorResponse(e);
    if (t) return t;
    throw e;
  }
  await patchJob(job.id, {
    state: 'AWAITING_OPERATOR_REVIEW',
    clarificationResponse: message,
  });
  await auditAdmin(
    'fulfillment.clarification_response',
    { jobId: job.id, message },
    user.id
  );

  return NextResponse.json(
    { ok: true, jobId: job.id, state: 'AWAITING_OPERATOR_REVIEW' },
    { status: 200 }
  );
}
