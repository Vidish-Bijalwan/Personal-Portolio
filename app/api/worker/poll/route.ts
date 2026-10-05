export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { eq, and, asc, desc, inArray, lt } from 'drizzle-orm';
import { getGenerationService } from '@/lib/providers/registry';
import { remakePrice } from '@/lib/pricing/engine';
import { getStorage } from '@/lib/storage';
import { isWorkerEligible, assertTransition } from '@/lib/jobs';
import type {
  AspectRatio,
  GenerationRequest,
  JobState,
  QualityTier,
  TaskType,
} from '@/src/lib/vilish/types';

/* ------------------------------------------------------------------ */
/* auth                                                                */
/* ------------------------------------------------------------------ */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed
  const viaHeader = req.headers.get('x-cron-secret');
  const viaQuery = req.nextUrl.searchParams.get('cron_secret');
  return viaHeader === secret || viaQuery === secret;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

async function touchJob(id: string, from: JobState, to: JobState, patch: Record<string, unknown>) {
  assertTransition(from, to);
  await db
    .update(schema.generationJobs)
    .set({ ...patch, state: to, updatedAt: new Date() })
    .where(eq(schema.generationJobs.id, id));
}

function buildRequest(job: any): GenerationRequest {
  return {
    task: (job.task === 'image_to_image' ? 'image_to_image' : 'text_to_image') as TaskType,
    prompt: job.enhancedPrompt ?? job.prompt ?? '',
    negativePrompt: job.negativePrompt ?? undefined,
    aspectRatio: (job.aspectRatio ?? '1:1') as AspectRatio,
    quality: (job.quality ?? 'studio') as QualityTier,
  };
}

interface JobResult {
  jobId: string;
  from: string;
  to: string;
  note?: string;
}

/** Provider-reported failure (or worker exception): retry<2 -> FAILED_PROVIDER
 *  -> QUEUED (retry), else FAILED_PROVIDER -> REFUND_PENDING + refunds row
 *  for manual review. All hops respect JOB_TRANSITIONS. */
async function handleJobFailure(job: any, from: JobState, message: string): Promise<JobResult> {
  const retries = typeof job.retryCount === 'number' ? job.retryCount : 0;
  const safe = message.slice(0, 500);
  await touchJob(job.id, from, 'FAILED_PROVIDER', {
    retryCount: retries + 1,
    errorMessage: safe,
  });
  if (retries < 2) {
    await touchJob(job.id, 'FAILED_PROVIDER', 'QUEUED', {});
    return { jobId: job.id, from, to: 'QUEUED', note: `retry ${retries + 1}/2` };
  }
  await touchJob(job.id, 'FAILED_PROVIDER', 'REFUND_PENDING', {});
  await db.insert(schema.refunds).values({
    paymentId: null,
    amountPaise: typeof job.customerPrice === 'number' ? job.customerPrice : 0,
    status: 'manual review',
    reason: 'provider_failed',
  });
  return {
    jobId: job.id,
    from,
    to: 'REFUND_PENDING',
    note: 'retries exhausted; refund queued for manual review',
  };
}

/** Download the provider output, persist it, version it, and open remake
 *  eligibility (L1/L2, 48h) before marking READY. */
async function handleJobReady(job: any, from: JobState, outputUrl: string): Promise<JobResult> {
  // Normalize to GENERATING first: SUBMITTED -> POST_PROCESSING is not a
  // legal hop; SUBMITTED -> GENERATING -> POST_PROCESSING is.
  let state = from;
  if (state === 'SUBMITTED') {
    await touchJob(job.id, state, 'GENERATING', {});
    state = 'GENERATING';
  }
  await touchJob(job.id, state, 'POST_PROCESSING', { errorMessage: null });
  state = 'POST_PROCESSING';

  try {
    const res = await fetch(outputUrl, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      throw new Error(`output download failed: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType =
      res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/png';

    const { url } = await getStorage().put(
      `outputs/${job.id}.png`,
      buf,
      contentType
    );

    const [asset] = await db
      .insert(schema.assets)
      .values({
        userId: job.userId ?? null,
        kind: 'output',
        url,
        mimeType: contentType,
        sizeBytes: buf.length,
      })
      .returning();

    const existing = await db
      .select({ version: schema.generationVersions.version })
      .from(schema.generationVersions)
      .where(eq(schema.generationVersions.jobId, job.id))
      .orderBy(desc(schema.generationVersions.version))
      .limit(1);
    const version = (existing[0]?.version ?? 0) + 1;

    await db.insert(schema.generationVersions).values({
      jobId: job.id,
      version,
      assetId: asset.id,
      pricePaise: typeof job.customerPrice === 'number' ? job.customerPrice : 0,
    });

    const eligibleUntil = new Date(Date.now() + 48 * 3600 * 1000);
    for (const level of [1, 2] as const) {
      const price = remakePrice({
        providerCostPaise:
          typeof job.estimatedCost === 'number' ? job.estimatedCost : 0,
        level,
      });
      await db.insert(schema.remakeEligibility).values({
        jobId: job.id,
        userId: job.userId ?? null,
        level,
        pricePaise: price.totalPaise,
        expiresAt: eligibleUntil,
      });
    }

    await touchJob(job.id, 'POST_PROCESSING', 'READY', {
      outputAssetId: asset.id,
    });
    return { jobId: job.id, from, to: 'READY' };
  } catch (err: any) {
    // Park in FAILED_PROVIDER (legal hop from POST_PROCESSING) so the job
    // never stalls in POST_PROCESSING; the outer catch then applies the
    // standard retry accounting.
    await touchJob(job.id, state, 'FAILED_PROVIDER', {
      errorMessage: (err?.message ?? 'post-processing failed').slice(0, 500),
    });
    throw err;
  }
}

async function processJob(job: any): Promise<JobResult> {
  const from = job.state as JobState;
  const service = getGenerationService();
  let state = from;

  if (state === 'QUEUED') {
    const { providerJobId } = await service.start(buildRequest(job));
    job.providerJobId = providerJobId;
    await touchJob(job.id, state, 'SUBMITTED', {
      providerJobId,
      errorMessage: null,
    });
    state = 'SUBMITTED';
  }

  if (state === 'SUBMITTED' || state === 'GENERATING') {
    if (!job.providerJobId) {
      throw new Error('missing providerJobId');
    }
    const s = await service.poll(job.providerJobId);
    if (s.state === 'ready') {
      if (!s.outputUrl) {
        throw new Error('provider reported ready without outputUrl');
      }
      return await handleJobReady(job, state, s.outputUrl);
    }
    if (s.state === 'failed') {
      throw new Error(s.error ?? 'provider reported failure');
    }
    if (state === 'SUBMITTED' && (s.state === 'generating' || s.state === 'queued')) {
      await touchJob(job.id, state, 'GENERATING', {});
      state = 'GENERATING';
    }
  }

  return { jobId: job.id, from, to: state };
}

/* ------------------------------------------------------------------ */
/* handler                                                             */
/* ------------------------------------------------------------------ */

/**
 * POST /api/worker/poll
 * Cron entrypoint (x-cron-secret header or ?cron_secret=).
 *
 * Phase A — expiry sweep: orders stuck in PAYMENT_PENDING past expiresAt
 *   move to PAYMENT_EXPIRED. Jobs are NOT touched here.
 * Phase B — generation: up to 5 oldest jobs in QUEUED / SUBMITTED /
 *   GENERATING advance through the provider pipeline. HARD RULE: jobs in
 *   PAYMENT_PENDING (unverified payments) are never touched — enforced by
 *   the pure isWorkerEligible() gate (unit-tested).
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', error: 'Invalid cron secret' },
      { status: 401 }
    );
  }

  const now = new Date();

  // Phase A: expire unpaid orders.
  const expiredRows = await db
    .update(schema.orders)
    .set({ status: 'PAYMENT_EXPIRED', updatedAt: now })
    .where(
      and(
        eq(schema.orders.status, 'PAYMENT_PENDING'),
        lt(schema.orders.expiresAt, now)
      )
    )
    .returning({ id: schema.orders.id });

  // Phase B: advance generation jobs. Defense in depth: the query names the
  // eligible states, and every row is re-checked through isWorkerEligible().
  const candidates = await db
    .select()
    .from(schema.generationJobs)
    .where(
      inArray(schema.generationJobs.state, ['QUEUED', 'SUBMITTED', 'GENERATING'])
    )
    .orderBy(asc(schema.generationJobs.createdAt))
    .limit(5);
  const jobs = candidates.filter((j: any) =>
    isWorkerEligible(j.state as JobState)
  );

  const results: JobResult[] = [];
  for (const job of jobs) {
    const from = job.state as JobState;
    try {
      results.push(await processJob(job));
    } catch (err: any) {
      try {
        results.push(
          await handleJobFailure(job, from, err?.message ?? 'worker error')
        );
      } catch (inner: any) {
        results.push({
          jobId: job.id,
          from,
          to: from,
          note: `unrecoverable: ${(inner?.message ?? 'unknown').slice(0, 200)}`,
        });
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    expired: expiredRows.length,
    results,
  });
}
