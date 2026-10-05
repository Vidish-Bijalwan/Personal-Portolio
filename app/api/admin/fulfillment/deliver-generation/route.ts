export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import {
  canTransition,
  maxBytesForMime,
  mimeForMagic,
  type DeliverableMime,
} from '@/lib/free/policy';

const ALLOWED_MIMES: readonly string[] = ['image/jpeg', 'image/png', 'video/mp4'];

/** Strict base64 decode: rejects strings that don't round-trip. */
function decodeB64Strict(label: string, value: unknown): Buffer {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label}: missing`);
  }
  const compact = value.replace(/\s+/g, '');
  let buf: Buffer;
  try {
    buf = Buffer.from(compact, 'base64');
  } catch {
    throw new Error(`${label}: invalid base64`);
  }
  if (buf.toString('base64') !== compact) {
    throw new Error(`${label}: invalid base64`);
  }
  return buf;
}

/**
 * POST /api/admin/fulfillment/deliver-generation
 * Admin token auth. Body: { id, watermarked_b64, clean_b64, mime }.
 * Stores the operator/watcher deliverables on a generations row and marks
 * it done. Accepts image/jpeg|image/png (each ≤8MB) or video/mp4
 * (each ≤32MB); both files are magic-byte validated and must be the same
 * kind. Does NOT touch `unlocked` — that flips only via the payment
 * verify hook (purpose='unlock' | 'video').
 */
export async function POST(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  // Unexpected failures (DB outages, driver errors) must never leak
  // raw internals to the caller — generic 500, details stay server-side.
  try {
    return await handleDeliver(req);
  } catch (e) {
    console.error('deliver-generation unexpected failure', e);
    return NextResponse.json(
      { code: 'INTERNAL', error: 'Could not store the deliverables' },
      { status: 500 }
    );
  }
}

async function handleDeliver(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== 'string' || !id) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'id is required' },
      { status: 400 }
    );
  }

  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.id, id))
    .limit(1);
  const gen = rows[0];
  if (!gen) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Generation not found' },
      { status: 404 }
    );
  }

  // Walk the state machine to 'done' through legal hops
  // (queued → generating → done), so the policy matrix stays authoritative.
  const hops = gen.status === 'queued' ? ['generating', 'done'] : ['done'];
  let from = gen.status;
  for (const to of hops) {
    if (!canTransition(from, to)) {
      return NextResponse.json(
        {
          code: 'INVALID_STATE',
          error: `Cannot deliver: status is ${gen.status}`,
        },
        { status: 409 }
      );
    }
    from = to;
  }

  const claimedMime: string | undefined =
    typeof body?.mime === 'string' ? body.mime : undefined;
  if (claimedMime !== undefined && !ALLOWED_MIMES.includes(claimedMime)) {
    return NextResponse.json(
      { code: 'INVALID_MIME', error: 'mime must be image/jpeg, image/png or video/mp4' },
      { status: 400 }
    );
  }

  let watermarked: Buffer;
  let clean: Buffer;
  try {
    watermarked = decodeB64Strict('watermarked_b64', body?.watermarked_b64);
    clean = decodeB64Strict('clean_b64', body?.clean_b64);
  } catch (e) {
    return NextResponse.json(
      { code: 'INVALID_BASE64', error: (e as Error).message },
      { status: 400 }
    );
  }

  const wmMime: DeliverableMime | null = mimeForMagic(watermarked);
  const cleanMime: DeliverableMime | null = mimeForMagic(clean);
  if (!wmMime || !cleanMime) {
    return NextResponse.json(
      {
        code: 'NOT_AN_IMAGE_OR_VIDEO',
        error: 'Deliverable bytes are not a recognized JPEG, PNG or MP4',
      },
      { status: 400 }
    );
  }
  if (wmMime !== cleanMime) {
    return NextResponse.json(
      {
        code: 'MIME_MISMATCH',
        error: 'watermarked and clean deliverables must be the same kind',
      },
      { status: 400 }
    );
  }
  if (claimedMime !== undefined && claimedMime !== wmMime) {
    return NextResponse.json(
      { code: 'MIME_MISMATCH', error: 'claimed mime does not match file bytes' },
      { status: 400 }
    );
  }
  const cap = maxBytesForMime(wmMime);
  if (watermarked.byteLength > cap || clean.byteLength > cap) {
    return NextResponse.json(
      {
        code: 'FILE_TOO_LARGE',
        error: `Each file must be ≤ ${Math.round(cap / 1024 / 1024)}MB`,
      },
      { status: 413 }
    );
  }

  await db
    .update(generations)
    .set({
      watermarked,
      clean,
      mime: wmMime,
      status: 'done',
      attempts: gen.attempts + 1,
      deliveredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generations.id, gen.id));

  return NextResponse.json({ ok: true, id: gen.id });
}
