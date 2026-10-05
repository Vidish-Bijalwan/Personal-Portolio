export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, count, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assets, generationJobs, orders, users } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { asFulfillmentJob } from '@/lib/fulfillment/job';

/**
 * GET /api/admin/fulfillment/queue
 * Admin token auth. Returns { counts, jobs } with contract §5 buckets.
 *
 * References are assets with kind='reference' on the job's project.
 */
const BUCKETS: Record<string, string[]> = {
  new: ['DRAFT', 'QUOTED', 'PAYMENT_PENDING'],
  paid: ['PAID'],
  review: ['AWAITING_OPERATOR_REVIEW'],
  generating: ['APPROVED_FOR_GENERATION', 'GENERATING'],
  qc: ['RESULT_UPLOADED', 'OPERATOR_QC'],
  ready: ['READY'],
  problem: [
    'NEEDS_CLARIFICATION',
    'REJECTED',
    'REFUND_REQUIRED',
    'FAILED_PROVIDER',
    'FAILED_TIMEOUT',
  ],
};

function bucketOf(state: string): string {
  for (const [bucket, states] of Object.entries(BUCKETS)) {
    if (states.includes(state)) return bucket;
  }
  return 'other';
}

const PROMPT_TRUNCATE = 140;

export async function GET(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const rows = await db
    .select({
      job: generationJobs,
      orderCode: orders.code,
      orderAmount: orders.amountPaise,
      orderStatus: orders.status,
      orderCreated: orders.createdAt,
      userEmail: users.email,
    })
    .from(generationJobs)
    .leftJoin(orders, eq(orders.jobId, generationJobs.id))
    .leftJoin(users, eq(users.id, generationJobs.userId));

  const refCounts = await db
    .select({ projectId: assets.projectId, n: count() })
    .from(assets)
    .where(and(eq(assets.kind, 'reference'), isNotNull(assets.projectId)))
    .groupBy(assets.projectId);
  const refCountByProject = new Map<string, number>(
    refCounts
      .filter((r) => r.projectId)
      .map((r) => [r.projectId as string, Number(r.n)])
  );

  // One row per job; keep the most recent order for the row.
  const byJob = new Map<
    string,
    {
      job: ReturnType<typeof asFulfillmentJob>;
      userEmail: string | null;
      orderCode: string | null;
      orderAmount: number | null;
      orderStatus: string | null;
      orderCreated: Date | null;
    }
  >();
  for (const r of rows) {
    const job = asFulfillmentJob(r.job);
    const existing = byJob.get(job.id);
    const oc: Date | null = r.orderCreated ? new Date(r.orderCreated as unknown as string) : null;
    if (
      !existing ||
      (oc && (!existing.orderCreated || oc.getTime() > existing.orderCreated.getTime()))
    ) {
      byJob.set(job.id, {
        job,
        userEmail: r.userEmail ?? null,
        orderCode: r.orderCode ?? null,
        orderAmount: r.orderAmount ?? null,
        orderStatus: r.orderStatus ?? null,
        orderCreated: oc,
      });
    }
  }

  const jobs = [...byJob.values()].map((e) => {
    const prompt = e.job.prompt ?? '';
    return {
      id: e.job.id,
      orderCode: e.orderCode,
      userEmail: e.userEmail,
      amountPaise: e.orderAmount,
      task: e.job.task,
      prompt:
        prompt.length > PROMPT_TRUNCATE
          ? prompt.slice(0, PROMPT_TRUNCATE) + '…'
          : prompt,
      aspectRatio: e.job.aspectRatio,
      quality: e.job.quality,
      state: e.job.state,
      paymentState: e.orderStatus,
      jobKind: e.job.jobKind,
      remakeOf: e.job.parentJobId,
      createdAt: e.job.createdAt,
      refCount: e.job.projectId
        ? (refCountByProject.get(e.job.projectId) ?? 0)
        : 0,
    };
  });

  const counts: Record<string, number> = {
    new: 0,
    paid: 0,
    review: 0,
    generating: 0,
    qc: 0,
    ready: 0,
    problem: 0,
    other: 0,
  };
  for (const j of jobs) counts[bucketOf(j.state)] += 1;

  // Sort: APPROVED_FOR_GENERATION oldest first, then
  // AWAITING_OPERATOR_REVIEW oldest first, then rest by updatedAt desc.
  const rank = (state: string) =>
    state === 'APPROVED_FOR_GENERATION'
      ? 0
      : state === 'AWAITING_OPERATOR_REVIEW'
        ? 1
        : 2;
  const full = [...byJob.values()];
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const sorted = full
    .sort((a, b) => {
      const ra = rank(a.job.state);
      const rb = rank(b.job.state);
      if (ra !== rb) return ra - rb;
      const ta = new Date(a.job.createdAt).getTime();
      const tb = new Date(b.job.createdAt).getTime();
      if (ra < 2) return ta - tb;
      const ua = new Date(a.job.updatedAt).getTime();
      const ub = new Date(b.job.updatedAt).getTime();
      return ub - ua;
    })
    .map((e) => byId.get(e.job.id));

  return NextResponse.json({ counts, jobs: sorted }, { status: 200 });
}
