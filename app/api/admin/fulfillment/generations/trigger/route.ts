export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, gte, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationTriggers } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { TRIGGER_TTL_MINUTES } from '@/lib/fast-gen/trigger';

/**
 * Fast-gen instant trigger endpoint (admin token auth, x-admin-token).
 *
 * The fulfillment worker cannot be reached inbound, so it polls this
 * endpoint on a fast cadence (see worker/trigger-cron-body.md) and starts
 * the claim→generate→deliver pipeline the moment a fresh trigger appears
 * instead of waiting for the next 1-minute claim poll.
 *
 * GET — returns the newest unconsumed, unexpired trigger:
 *   { trigger: { id, generation_id, created_at } | null }
 *   Triggers older than TRIGGER_TTL_MINUTES are treated as absent (their
 *   rows are still picked up by the 1-minute claim poll fallback).
 *
 * POST { action: 'consume', id } — marks a trigger consumed so it is
 *   never reported again. The claim endpoint also consumes triggers for
 *   the rows it claims, so a normal 1-minute run cleans up too.
 */
export async function GET(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  try {
    const cutoff = new Date(Date.now() - TRIGGER_TTL_MINUTES * 60 * 1000);
    const rows = await db
      .select()
      .from(generationTriggers)
      .where(
        and(isNull(generationTriggers.consumedAt), gte(generationTriggers.createdAt, cutoff))
      )
      .orderBy(desc(generationTriggers.createdAt))
      .limit(1);
    const t = rows[0];
    return NextResponse.json({
      trigger: t
        ? {
            id: t.id,
            generation_id: t.generationId,
            created_at:
              t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
          }
        : null,
    });
  } catch (e) {
    console.error('generations/trigger GET unexpected failure', e);
    return NextResponse.json(
      { code: 'INTERNAL', error: 'Could not read the trigger queue' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  try {
    const body = await req.json().catch(() => null);
    if (body?.action !== 'consume' || typeof body?.id !== 'string' || !body.id) {
      return NextResponse.json(
        { code: 'INVALID_REQUEST', error: "action must be 'consume' with an id" },
        { status: 400 }
      );
    }
    await db
      .update(generationTriggers)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(generationTriggers.id, body.id),
          isNull(generationTriggers.consumedAt)
        )
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('generations/trigger POST unexpected failure', e);
    return NextResponse.json(
      { code: 'INTERNAL', error: 'Could not consume the trigger' },
      { status: 500 }
    );
  }
}
