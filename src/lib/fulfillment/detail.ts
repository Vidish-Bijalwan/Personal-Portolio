/**
 * VILISH Studio — fulfillment job detail loader (Phase 2 contract §5).
 * Shared by GET [id], package, and bundle routes.
 */
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assets, auditLogs, generationJobs, orders, users } from '@/lib/db/schema';
import {
  getFulfillmentJob,
  getTakes,
  type FulfillmentJob,
  type FulfillmentTake,
} from './job';

export interface DetailReference {
  id: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  createdAt: Date | null;
  filename: string | null;
}

export interface DetailOrder {
  code: string;
  amountPaise: number;
  status: string;
  utrReference: string | null;
  duplicateFlag: boolean;
  verifiedAt: Date | null;
  verifiedByUserId: string | null;
  verifiedAmountPaise: number | null;
  createdAt: Date | null;
}

export interface FulfillmentDetail {
  job: FulfillmentJob;
  user: { id: string; email: string | null; name: string | null } | null;
  order: DetailOrder | null;
  references: DetailReference[];
  results: FulfillmentTake[];
  clarification: { request: string | null; response: string | null };
  history: {
    id: string;
    action: string;
    actorUserId: string | null;
    target: unknown;
    createdAt: Date | null;
  }[];
  settings: {
    task: string;
    aspectRatio: string | null;
    quality: string | null;
    style: string | null;
    genre: string | null;
    constraints: string | null;
    durationSeconds: number | null;
  };
}

function filenameFromUrl(url: string): string | null {
  try {
    const u = new URL(url, 'http://localhost');
    const base = u.pathname.split('/').filter(Boolean).pop() ?? null;
    return base || null;
  } catch {
    return null;
  }
}

export async function loadFulfillmentDetail(
  jobId: string
): Promise<FulfillmentDetail | null> {
  const job = await getFulfillmentJob(jobId);
  if (!job) return null;

  const [user] = job.userId
    ? await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, job.userId))
        .limit(1)
    : [];

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.jobId, job.id))
    .orderBy(desc(orders.createdAt))
    .limit(1);
  const o = orderRows[0];
  const order: DetailOrder | null = o
    ? {
        code: o.code,
        amountPaise: o.amountPaise,
        status: o.status,
        utrReference: o.utrReference,
        duplicateFlag: o.duplicateFlag,
        verifiedAt: o.verifiedAt,
        verifiedByUserId: o.verifiedByUserId,
        verifiedAmountPaise: o.verifiedAmountPaise,
        createdAt: o.createdAt,
      }
    : null;

  const refRows = job.projectId
    ? await db
        .select()
        .from(assets)
        .where(
          sql`${assets.projectId} = ${job.projectId} and ${assets.kind} = 'reference'`
        )
        .orderBy(assets.createdAt)
    : [];
  const references: DetailReference[] = refRows.map((a) => ({
    id: a.id,
    url: a.url,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width,
    height: a.height,
    createdAt: a.createdAt,
    filename: filenameFromUrl(a.url),
  }));

  const results = await getTakes(job.id);

  const histRows = await db
    .select()
    .from(auditLogs)
    .where(sql`${auditLogs.target}::text like ${`%${job.id}%`}`)
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  const anyJob = job as unknown as Record<string, unknown>;
  return {
    job,
    user: user ?? null,
    order,
    references,
    results,
    clarification: {
      request: job.clarificationRequest,
      response: job.clarificationResponse,
    },
    history: histRows.map((h) => ({
      id: h.id,
      action: h.action,
      actorUserId: h.actorUserId,
      target: h.target,
      createdAt: h.createdAt,
    })),
    settings: {
      task: job.task,
      aspectRatio: job.aspectRatio,
      quality: job.quality,
      style: (anyJob.style as string | null) ?? null,
      genre: (anyJob.genre as string | null) ?? null,
      constraints: (anyJob.constraints as string | null) ?? null,
      durationSeconds:
        anyJob.durationSeconds == null
          ? null
          : Number(anyJob.durationSeconds),
    },
  };
}

/** Latest order for a job (for package/bundle filename + order.json). */
export async function latestOrderForJob(jobId: string) {
  const [o] = await db
    .select()
    .from(orders)
    .where(eq(orders.jobId, jobId))
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return o ?? null;
}
