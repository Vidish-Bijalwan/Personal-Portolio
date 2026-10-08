/**
 * Etch fast-gen — instant-trigger primitives (site side).
 *
 * When a generation order is created, the order-creation route inserts a
 * `generation_triggers` row. The fulfillment worker polls
 * GET /api/admin/fulfillment/generations/trigger (x-admin-token) on a fast
 * cadence and starts the claim→generate→deliver pipeline the moment a
 * fresh trigger appears, instead of waiting for the next 1-minute poll.
 * The 1-minute poll stays as the fallback.
 */
import { db } from '@/lib/db/client';
import { generationTriggers } from '@/lib/db/schema';

/** Triggers older than this are ignored by the fast watcher (the 1-minute
 *  poll still picks up their rows via the normal claim path). */
export const TRIGGER_TTL_MINUTES = 15;

/** Write a wake-up record for a freshly queued generations row.
 *  Best-effort: a trigger failure must never fail order creation. */
export async function queueGenerationTrigger(generationId: string): Promise<void> {
  try {
    await db.insert(generationTriggers).values({ generationId });
  } catch (e) {
    // Fail open: the 1-minute poll remains the fallback.
    console.error('queueGenerationTrigger failed (fallback: 1m poll)', e);
  }
}
