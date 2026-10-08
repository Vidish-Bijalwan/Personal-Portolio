export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, gte, inArray, lt, ne } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generationJobs, generations } from '@/lib/db/schema';
import {
  RETENTION_DAYS,
  promptPreview,
  retentionCutoff,
  unlockEndpointForGeneration,
  unlockPricePaiseForGeneration,
} from '@/lib/me/profile';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

export interface MyGenerationItem {
  id: string;
  prompt: string;
  mediaType: string;
  tier: string;
  status: string;
  unlocked: boolean;
  /** server-side unlock price in paise; null when not unlockable */
  pricePaise: number | null;
  createdAt: string;
  /** watermarked preview (owner-gated); usable once status=done */
  thumbnailUrl: string;
  /** clean download (owner-gated); only when unlocked */
  downloadUrl: string | null;
  /** where to POST to mint the unlock order; null when not unlockable */
  unlock: { url: string; method: 'POST'; body: Record<string, string> } | null;
}

/**
 * GET /api/me/generations?limit=&cursor=
 * The signed-in user's own creations from the last RETENTION_DAYS days.
 * Cursor pagination: pass `cursor` = createdAt of the last seen item.
 * Strictly owner-scoped — userId is always the session user.
 */
export async function GET(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const params = req.nextUrl.searchParams;
  const limitRaw = Number.parseInt(params.get('limit') ?? '', 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const cursorRaw = params.get('cursor');
  const cursor = cursorRaw ? new Date(cursorRaw) : null;
  const cursorValid = cursor && !Number.isNaN(cursor.getTime()) ? cursor : null;

  const cutoff = retentionCutoff();
  const conditions = [
    eq(generations.userId, user.id),
    gte(generations.createdAt, cutoff),
    // Fast-gen (c): speculative pre-generations are non-charging scratch
    // rows — never shown in the user's gallery.
    ne(generations.tier, 'speculative'),
    ...(cursorValid ? [lt(generations.createdAt, cursorValid)] : []),
  ];

  const rows = await db
    .select()
    .from(generations)
    .where(and(...conditions))
    .orderBy(desc(generations.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Batch-load pricing jobs for paid-image price quotes (server-side only).
  const jobIds = [...new Set(page.map((g) => g.jobId).filter(Boolean))] as string[];
  const jobMap = new Map<string, { customerPrice: number | null }>();
  if (jobIds.length > 0) {
    const jobs = await db
      .select({ id: generationJobs.id, customerPrice: generationJobs.customerPrice })
      .from(generationJobs)
      .where(inArray(generationJobs.id, jobIds));
    for (const j of jobs) jobMap.set(j.id, { customerPrice: j.customerPrice });
  }

  const items: MyGenerationItem[] = page.map((g) => {
    const job = g.jobId ? jobMap.get(g.jobId) : undefined;
    const pricePaise = unlockPricePaiseForGeneration({
      tier: g.tier,
      mediaType: g.mediaType,
      status: g.status,
      unlocked: g.unlocked,
      durationSeconds: g.durationSeconds,
      jobCustomerPrice: job?.customerPrice ?? null,
    });
    const unlock =
      pricePaise !== null
        ? unlockEndpointForGeneration({
            id: g.id,
            tier: g.tier,
            mediaType: g.mediaType,
            status: g.status,
            unlocked: g.unlocked,
          })
        : null;
    return {
      id: g.id,
      prompt: promptPreview(g.prompt),
      mediaType: g.mediaType,
      tier: g.tier,
      status: g.status,
      unlocked: g.unlocked,
      pricePaise,
      createdAt: g.createdAt.toISOString(),
      thumbnailUrl: `/api/gen/${g.id}/preview`,
      downloadUrl: g.unlocked ? `/api/gen/${g.id}/clean` : null,
      unlock,
    };
  });

  return NextResponse.json({
    items,
    nextCursor: hasMore ? page[page.length - 1].createdAt : null,
    retentionDays: RETENTION_DAYS,
  });
}
