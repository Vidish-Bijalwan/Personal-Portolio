export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { buildAiPackage, extractRevision } from '@/lib/fulfillment/package';
import {
  getFulfillmentJob,
  getTakes,
} from '@/lib/fulfillment/job';
import { latestOrderForJob, loadFulfillmentDetail } from '@/lib/fulfillment/detail';

/** GET /api/admin/fulfillment/[id]/package → { text } — the §7 AI PACKAGE */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  const { id } = await params;

  const detail = await loadFulfillmentDetail(id);
  if (!detail) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
  }
  const order = await latestOrderForJob(id);
  if (!order) {
    return NextResponse.json({ error: 'NO_ORDER' }, { status: 404 });
  }

  const { job, settings, references } = detail;

  let parent:
    | {
        prompt: string;
        revision: string | null;
        previousResultLabel: string | null;
        previousResultUrl: string | null;
      }
    | undefined;
  if ((job.jobKind === 'remake' || job.jobKind === 'edit') && job.parentJobId) {
    const parentJob = await getFulfillmentJob(job.parentJobId);
    if (parentJob) {
      const parentTakes = await getTakes(parentJob.id);
      const latest = parentTakes[parentTakes.length - 1];
      parent = {
        prompt: parentJob.prompt,
        revision: extractRevision(job.operatorNotes),
        previousResultLabel: latest?.takeLabel ?? null,
        previousResultUrl: latest?.assetUrl ?? null,
      };
    }
  }

  const text = buildAiPackage(
    {
      task: job.task,
      jobKind: job.jobKind,
      prompt: job.prompt,
      aspectRatio: job.aspectRatio,
      quality: job.quality,
      style: settings.style,
      genre: settings.genre,
      constraints: settings.constraints,
      durationSeconds: settings.durationSeconds,
    },
    { code: order.code },
    references.map((r) => ({ filename: r.filename ?? r.url })),
    parent
  );

  return NextResponse.json({ text }, { status: 200 });
}
