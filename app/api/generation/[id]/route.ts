export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/src/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/generation/[id]
 * Public-readable for this vertical slice: returns the job, its latest
 * generation version and the output asset URL (when ready). 404 if missing.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
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

  const versionRows = await db
    .select()
    .from(schema.generationVersions)
    .where(eq(schema.generationVersions.jobId, job.id))
    .orderBy(desc(schema.generationVersions.version))
    .limit(1);
  const latestVersion = versionRows[0] ?? null;

  let outputUrl: string | undefined;
  if (job.outputAssetId) {
    const assetRows = await db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.id, job.outputAssetId))
      .limit(1);
    if (assetRows[0]) outputUrl = assetRows[0].url;
  }

  return NextResponse.json({
    id: job.id,
    state: job.state,
    task: job.task,
    prompt: job.prompt,
    aspectRatio: job.aspectRatio,
    quality: job.quality,
    providerId: job.providerId,
    model: job.model,
    customerPrice: job.customerPrice,
    outputUrl,
    errorMessage: job.errorMessage ?? undefined,
    latestVersion: latestVersion
      ? { version: latestVersion.version, pricePaise: latestVersion.pricePaise }
      : null,
    createdAt: job.createdAt,
  });
}
