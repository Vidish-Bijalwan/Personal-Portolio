export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import {
  failureMessageFor,
  isGenerationErrorCode,
  type GenerationErrorCode,
} from '@/lib/free/policy';

const REAP_MINUTES = 45;
const MAX_ATTEMPTS = 3;

/**
 * POST /api/admin/fulfillment/generations/claim
 * Admin token auth (x-admin-token). Lets the generation watcher (which
 * cannot reach Postgres directly from its sandbox) operate on the
 * generations queue over HTTPS.
 *
 * { action: 'claim', limit?: number } — first reaps rows stuck in
 *   'generating' for >45 min (back to queued, or failed after 3 attempts),
 *   then atomically moves the oldest `limit` queued rows to generating
 *   (FOR UPDATE SKIP LOCKED) and returns them WITHOUT the bytea blobs.
 * { action: 'stage', id, stage } — updates the waiting-room progress label.
 * { action: 'fail', id, error_code? } — marks a row failed. error_code
 *   must be 'content_refused' (safety-filter refusal) or 'technical'
 *   (default); the stored user message is the fixed copy for that class —
 *   raw watcher/provider text is never stored or echoed back.
 */
export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  // Unexpected failures must never leak raw internals to the caller —
  // generic 500, details stay server-side.
  try {
    return await handleClaim(req);
  } catch (e) {
    console.error('generations/claim unexpected failure', e);
    return NextResponse.json(
      { code: 'INTERNAL', error: 'Could not process the queue action' },
      { status: 500 }
    );
  }
}

async function handleClaim(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === 'claim') {
    const limit = Math.min(Math.max(Number(body?.limit) || 2, 1), 5);
    await db.execute(sql`
      UPDATE generations
      SET status = CASE WHEN attempts >= ${MAX_ATTEMPTS} THEN 'failed' ELSE 'queued' END,
          stage = CASE WHEN attempts >= ${MAX_ATTEMPTS} THEN 'recovered: too many attempts' ELSE NULL END,
          error = CASE WHEN attempts >= ${MAX_ATTEMPTS}
                       THEN 'The grill flared up too many times — try a fresh request.'
                       ELSE NULL END,
          error_code = CASE WHEN attempts >= ${MAX_ATTEMPTS} THEN 'technical' ELSE NULL END,
          updated_at = now()
      WHERE status = 'generating'
        AND updated_at < now() - (${REAP_MINUTES} || ' minutes')::interval`);
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

  if (action === 'fail') {
    const id = body?.id;
    if (typeof id !== 'string' || !id) {
      return NextResponse.json(
        { code: 'INVALID_REQUEST', error: 'id is required' },
        { status: 400 }
      );
    }
    // Failure class drives the user-visible message. Raw watcher/provider
    // text is NEVER stored or echoed — only the fixed user-safe copy per
    // failure class, so tracebacks and provider internals can't reach the
    // watch room. (body.error is accepted for backward compat and ignored.)
    const errorCode: GenerationErrorCode = isGenerationErrorCode(
      body?.error_code
    )
      ? body.error_code
      : 'technical';
    const message = failureMessageFor(errorCode);
    await db.execute(sql`
      UPDATE generations
      SET status = 'failed', error_code = ${errorCode}, error = ${message},
          updated_at = now()
      WHERE id = ${id}::uuid AND status IN ('queued', 'generating')`);
    return NextResponse.json({ ok: true, error_code: errorCode });
  }

  return NextResponse.json(
    { code: 'INVALID_REQUEST', error: "action must be 'claim', 'stage' or 'fail'" },
    { status: 400 }
  );
}
