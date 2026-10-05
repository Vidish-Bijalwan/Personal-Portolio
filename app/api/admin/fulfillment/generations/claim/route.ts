export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { adminAuthFail } from '@/lib/fulfillment/guards';

/**
 * POST /api/admin/fulfillment/generations/claim
 * Admin token auth. Lets the generation watcher (which cannot reach
 * Postgres directly from its sandbox) claim and update generations
 * rows over HTTPS.
 *
 * Body { action: 'claim', limit?: number } — atomically moves the oldest
 * `limit` queued rows to generating and returns them WITHOUT the
 * bytea blobs: [{ id, user_id, prompt, quality, aspect_ratio,
 * media_type, tier, attempts }].
 *
 * Body { action: 'stage', id: string, stage: string } — updates the
 * progress label shown in the waiting room.
 */
export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === 'claim') {
    const limit = Math.min(Math.max(Number(body?.limit) || 2, 1), 5);
    const raw = (await db.execute(sql`
      UPDATE generations AS g
      SET status = 'generating',
          stage = 'Firing up the grill',
          attempts = g.attempts + 1,
          updated_at = now()
      FROM (
        SELECT id FROM generations
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      ) AS q
      WHERE g.id = q.id
      RETURNING g.id, g.user_id, g.prompt, g.quality, g.aspect_ratio,
                g.media_type, g.tier, g.attempts
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
      sql`UPDATE generations SET stage = ${stage}, updated_at = now() WHERE id = ${id}::uuid`
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { code: 'INVALID_REQUEST', error: "action must be 'claim' or 'stage'" },
    { status: 400 }
  );
}
