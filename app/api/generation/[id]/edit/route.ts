export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { generationJobs } from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth';
import { auditAdmin } from '@/lib/fulfillment/guards';
import { getFulfillmentConfig } from '@/lib/fulfillment/config';
import { asFulfillmentJob, getFulfillmentJob } from '@/lib/fulfillment/job';
import { REVISION_MARKER } from '@/lib/fulfillment/package';

/**
 * POST /api/generation/[id]/edit {revision?}
 * CUSTOMER route (session auth, own job only): creates a child job
 * (jobKind='edit', parentJobId=original) copying prompt/settings and
 * operatorNotes. The child flows through quote/start normally.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const { id } = await params;
  const job = await getFulfillmentJob(id);
  // 404 for missing OR not-owned (no ownership enumeration).
  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const revision =
    typeof body?.revision === 'string' && body.revision.trim()
      ? body.revision.trim()
      : null;

  const cfg = await getFulfillmentConfig();

  // Child copies prompt/settings/operatorNotes from the original.
  const notesBase = job.operatorNotes ?? '';
  const operatorNotes = revision
    ? `${notesBase}${notesBase ? '\n' : ''}${REVISION_MARKER} ${revision}`
    : notesBase || null;

  const [inserted] = await db
    .insert(generationJobs)
    .values({
      userId: job.userId,
      projectId: job.projectId,
      state: 'DRAFT',
      task: job.task,
      prompt: job.prompt,
      enhancedPrompt: job.enhancedPrompt,
      negativePrompt: job.negativePrompt,
      aspectRatio: job.aspectRatio,
      quality: job.quality,
      providerId: job.providerId,
      model: job.model,
      parentJobId: job.id,
      // Phase-2 columns (contract §4; cast keeps this compiling until the
      // migration's schema types land).
      jobKind: 'edit',
      fulfillmentMode: cfg.FULFILLMENT_MODE,
      operatorNotes,
    } as never)
    .returning();
  const child = asFulfillmentJob(inserted);

  await auditAdmin(
    'fulfillment.edit_created',
    { childJobId: child.id, parentJobId: job.id, revision },
    user.id
  );

  return NextResponse.json(
    { ok: true, childJobId: child.id, parentJobId: job.id },
    { status: 200 }
  );
}
