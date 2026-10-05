export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { adminAuthFail } from '@/lib/fulfillment/guards';

const REAP_MINUTES = 45;
const MAX_ATTEMPTS = 3;

/**
 * POST /api/admin/video-jobs/claim
 * Admin token auth (x-admin-token). Lets the Video Studio watcher
 * (which cannot reach Postgres directly from its sandbox) operate on
 * the video_jobs queue over HTTPS. Mirrors
 * /api/admin/fulfillment/generations/claim.
 *
 * { action: 'claim', limit?: number } — first reaps rows stuck in
 *   'processing' for >45 min (back to queued, or failed after 3
 *   attempts), then atomically moves the oldest `limit` queued rows to
 *   processing (FOR UPDATE SKIP LOCKED) and returns them WITHOUT the
 *   bytea blobs (tool, params, input_mime included; the input video is
 *   fetched via GET /api/admin/video-jobs/[id]/input).
 * { action: 'stage', id, stage } — updates the waiting-room progress label.
 * { action: 'fail', id, error? } — marks a row failed (user-safe message).
 */
export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === 'claim') {
    const limit = Math.min(Math.max(Number(body?.limit) || 2, 1), 5);
    await db.execute(sql`
      UPDATE video_jobs
      SET status = CASE WHEN attempts >= ${MAX_ATTEMPTS} THEN 'failed' ELSE 'queued' END,
          stage = CASE WHEN attempts >= ${MAX_ATTEMPTS} THEN 'recovered: too many attempts' ELSE NULL END,
          error = CASE WHEN attempts >= ${MAX_ATTEMPTS}
                       THEN 'The studio could not finish this video — try again with a fresh upload.'
                       ELSE NULL END,
          updated_at = now()
      WHERE status = 'processing'
        AND updated_at < now() - (${REAP_MINUTES} || ' minutes')::interval`);
    const raw = (await db.execute(sql`
      UPDATE video_jobs AS v
      SET status = 'processing',
          stage = 'Rolling the projector',
          attempts = v.attempts + 1,
          updated_at = now()
      FROM (
        SELECT id FROM video_jobs
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      ) AS q
      WHERE v.id = q.id
      RETURNING v.id, v.user_id, v.tool, v.params, v.input_mime, v.attempts
    `)) as unknown as { rows?: unknown[] } | unknown[];
    const claimed = Array.isArray(raw) ? raw : raw.rows ?? [];
    return NextResponse.json({ claimed });
  }

  if (action === 'stage') {
    const id = body?.id;
    const stage = body?.stage;
    if (typeof id !== 'string' || !id || typeof stage !== 'string' || !stage) {
      return NextResponse.json(
        { code: 'INVALID_REQUEST', error: 'id and stage are required' },
        { status: 400 }
      );
    }
    await db.execute(
      sql`UPDATE video_jobs SET stage = ${stage}, updated_at = now() WHERE id = ${id}::uuid`
    );
    return NextResponse.json({ ok: true });
  }

  if (action === 'fail') {
    const id = body?.id;
    const error =
      typeof body?.error === 'string' && body.error
        ? body.error.slice(0, 300)
        : 'The studio could not finish this video — try again.';
    if (typeof id !== 'string' || !id) {
      return NextResponse.json(
        { code: 'INVALID_REQUEST', error: 'id is required' },
        { status: 400 }
      );
    }
    await db.execute(sql`
      UPDATE video_jobs SET status = 'failed', error = ${error}, updated_at = now()
      WHERE id = ${id}::uuid AND status IN ('queued', 'processing')`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { code: 'INVALID_REQUEST', error: "action must be 'claim', 'stage' or 'fail'" },
    { status: 400 }
  );
}
