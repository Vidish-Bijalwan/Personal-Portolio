/**
 * Pixaura — shared data-access helpers for the generations table.
 * Owner gating + free-cap counting, used by the /api/free, /api/video
 * and /api/gen routes.
 */
import { NextResponse } from 'next/server';
import { and, eq, gte, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { FREE_DAILY_CAP, istDayStart } from './policy';

export type GenerationRow = typeof generations.$inferSelect;

/**
 * Load a generation row gated on ownership.
 * Returns { gen } or { error } (a ready-made 404/403 response).
 */
export async function getOwnedGeneration(
  id: string,
  userId: string
): Promise<{ gen: GenerationRow; error?: undefined } | { gen?: undefined; error: NextResponse }> {
  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.id, id))
    .limit(1);
  const gen = rows[0];
  if (!gen) {
    return {
      error: NextResponse.json(
        { code: 'NOT_FOUND', error: 'Generation not found' },
        { status: 404 }
      ),
    };
  }
  if (gen.userId !== userId) {
    return {
      error: NextResponse.json(
        { code: 'FORBIDDEN', error: 'Not your generation' },
        { status: 403 }
      ),
    };
  }
  return { gen };
}

/**
 * Count the user's free-tier images created today (IST) with
 * status != 'failed'. Failed rows never consume cap; paid rows and
 * videos never count.
 */
export async function countFreeImagesToday(userId: string): Promise<number> {
  const dayStart = istDayStart(new Date());
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(generations)
    .where(
      and(
        eq(generations.userId, userId),
        eq(generations.tier, 'free'),
        eq(generations.mediaType, 'image'),
        ne(generations.status, 'failed'),
        gte(generations.createdAt, dayStart)
      )
    );
  return rows[0]?.n ?? 0;
}

export async function freeRemaining(userId: string): Promise<{ left: number; cap: number }> {
  const used = await countFreeImagesToday(userId);
  return { left: Math.max(0, FREE_DAILY_CAP - used), cap: FREE_DAILY_CAP };
}

/** Convert driver-returned bytea (Buffer | Uint8Array) to a Buffer. */
export function toBuffer(data: unknown): Buffer | null {
  if (data == null) return null;
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  return null;
}
