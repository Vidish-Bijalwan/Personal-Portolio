export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { isValidPrompt } from '@/lib/free/policy';
import { MISSING_REFERENCE_MESSAGE, needsReferencePhoto } from '@/lib/person-reference';
import {
  SPEC_TTL_MS,
  specHashMatches,
  specIsExpired,
  speculativeHash,
} from '@/lib/fast-gen/spec';
import { queueGenerationTrigger } from '@/lib/fast-gen/trigger';

/**
 * POST /api/gen/speculative
 * Fast-gen (c): speculative pre-generation. While the user types on
 * /create (free image flow), the composer debounces ~3s of idle and POSTs
 * the current prompt+options here. The server starts a NON-CHARGING
 * speculative render in the background (tier='speculative'); when the user
 * clicks Generate with a matching specHash, /api/free/generate converts
 * the ready (or in-flight) row into a real free-tier row instead of
 * queueing a fresh one.
 *
 * Body (JSON): { prompt, quality?, aspectRatio?, specHash }
 * - prompt: 1..2000 chars (isValidPrompt). Prompts needing a reference
 *   photo are rejected — speculative rows carry no attachments, so the
 *   worker would fail them with missing_reference.
 * - specHash: the client-computed hash; the server recomputes it from the
 *   real inputs and 400s on mismatch (SPEC_HASH_MISMATCH).
 * - Idempotent per (user, specHash): an unexpired matching row is returned
 *   as-is — no duplicate jobs.
 *
 * NEVER charges: tier='speculative' rows are excluded from the free daily
 * cap (countFreeImagesToday counts only tier='free'), are invisible in
 * /api/me/generations, and are rejected by the unlock route. Expired
 * still-queued rows are reaped by the claim endpoint.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const prompt = body?.prompt;
  const quality =
    typeof body?.quality === 'string' && body.quality.length <= 32
      ? body.quality
      : 'studio';
  const aspectRatio =
    typeof body?.aspectRatio === 'string' && body.aspectRatio.length <= 16
      ? body.aspectRatio
      : '1:1';
  const clientHash = body?.specHash;

  if (!isValidPrompt(prompt)) {
    return NextResponse.json(
      { code: 'INVALID_PROMPT', error: 'prompt must be 1..2000 characters' },
      { status: 400 }
    );
  }
  const input = { prompt: prompt.trim(), quality, aspectRatio, mediaType: 'image' };
  if (!specHashMatches(clientHash, input)) {
    return NextResponse.json(
      {
        code: 'SPEC_HASH_MISMATCH',
        error: 'specHash does not match the prompt and options',
      },
      { status: 400 }
    );
  }

  // Speculative rows carry no reference attachments — a person prompt would
  // be failed by the worker with missing_reference, wasting a render.
  if (needsReferencePhoto(prompt)) {
    return NextResponse.json(
      { code: 'MISSING_REFERENCE', error: MISSING_REFERENCE_MESSAGE },
      { status: 400 }
    );
  }

  // Idempotent: return the live row for this exact spec instead of
  // queueing a duplicate.
  const existing = await db
    .select()
    .from(generations)
    .where(
      and(
        eq(generations.userId, user.id),
        eq(generations.tier, 'speculative'),
        eq(generations.specHash, clientHash),
        inArray(generations.status, ['queued', 'generating', 'done'])
      )
    )
    .orderBy(desc(generations.createdAt))
    .limit(1);
  const live = existing[0];
  if (live && !specIsExpired(live.specExpiresAt)) {
    return NextResponse.json({
      id: live.id,
      status: live.status,
      specHash: clientHash,
      deduped: true,
    });
  }

  // One live speculative render per user at a time: drop the user's other
  // still-queued speculative rows so abandoned typing never stacks up
  // worker jobs behind the current prompt.
  await db
    .delete(generations)
    .where(
      and(
        eq(generations.userId, user.id),
        eq(generations.tier, 'speculative'),
        eq(generations.status, 'queued'),
        ne(generations.specHash, clientHash)
      )
    );

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt: prompt.trim(),
      quality,
      aspectRatio,
      mediaType: 'image',
      tier: 'speculative',
      status: 'queued',
      specHash: clientHash,
      specExpiresAt: new Date(Date.now() + SPEC_TTL_MS),
      unlocked: false,
    })
    .returning({ id: generations.id });

  // Wake the worker immediately — same fast path as real orders.
  await queueGenerationTrigger(row.id);

  return NextResponse.json(
    { id: row.id, status: 'queued', specHash: clientHash, deduped: false },
    { status: 201 }
  );
}
