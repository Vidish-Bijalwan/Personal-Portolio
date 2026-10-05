export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/src/lib/db/schema';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';
import { remakePrice } from '@/lib/pricing/engine';
import type { PriceBreakdown } from '@/src/lib/vilish/types';

/**
 * POST /api/generation/[id]/remake
 * Body: { prompt?: string }
 * Auth required. Consumes the lowest-level unused remakeEligibility credit on
 * a READY job, prices it via remakePrice(), and creates a child QUOTED job +
 * quote. Payment for the remake goes through /api/generation/start with the
 * returned quoteId — same flow as a fresh generation.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', error: 'Sign in required' },
      { status: 401 }
    );
  }
  const { id } = await ctx.params;

  const jobRows = await db
    .select()
    .from(schema.generationJobs)
    .where(eq(schema.generationJobs.id, id))
    .limit(1);
  const job = jobRows[0];
  if (!job) {
    return NextResponse.json(
      { code: 'JOB_NOT_FOUND', error: 'Job not found' },
      { status: 404 }
    );
  }
  if (job.state !== 'READY') {
    return NextResponse.json(
      { code: 'NOT_READY', error: `Job is ${job.state}, expected READY` },
      { status: 409 }
    );
  }

  const eligRows = await db
    .select()
    .from(schema.remakeEligibility)
    .where(
      and(
        eq(schema.remakeEligibility.jobId, job.id),
        isNull(schema.remakeEligibility.usedAt)
      )
    )
    .orderBy(asc(schema.remakeEligibility.level))
    .limit(1);
  const eligibility = eligRows[0];
  if (!eligibility || new Date(eligibility.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { code: 'NO_REMAKE_CREDIT', error: 'No unused remake credit' },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  const promptOverride =
    typeof body?.prompt === 'string' && body.prompt.trim()
      ? body.prompt.trim()
      : null;

  const price = remakePrice({
    providerCostPaise: job.estimatedCost ?? 0,
    level: (eligibility.level === 2 ? 2 : 1) as 1 | 2,
  });

  // Minimal PriceBreakdown-shaped record for the quotes table (remake pricing
  // only returns a floor-protected total).
  const breakdown: PriceBreakdown = {
    providerCost: job.estimatedCost ?? 0,
    infraCost: 0,
    paymentFee: 0,
    taxBuffer: 0,
    margin: price.totalPaise - (job.estimatedCost ?? 0),
    total: price.totalPaise,
    currency: 'INR',
  };
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [child] = await db
    .insert(schema.generationJobs)
    .values({
      userId: job.userId,
      state: 'QUOTED',
      task: job.task,
      prompt: promptOverride ?? job.prompt,
      enhancedPrompt: job.enhancedPrompt,
      negativePrompt: job.negativePrompt,
      aspectRatio: job.aspectRatio,
      quality: job.quality,
      providerId: job.providerId,
      model: job.model,
      estimatedCost: job.estimatedCost ?? 0,
      customerPrice: price.totalPaise,
      parentJobId: job.id,
      idempotencyKey: crypto.randomUUID(),
    })
    .returning();

  const [quote] = await db
    .insert(schema.quotes)
    .values({
      jobId: child.id,
      breakdown,
      totalPaise: price.totalPaise,
      expiresAt,
    })
    .returning();

  await db
    .update(schema.remakeEligibility)
    .set({ usedAt: new Date() })
    .where(eq(schema.remakeEligibility.id, eligibility.id));

  return NextResponse.json({
    quoteId: quote.id,
    jobId: child.id,
    totalPaise: price.totalPaise,
  });
}
