/**
 * Etch — shared data-access helpers for the video_jobs table.
 * Owner gating, mirrors src/lib/free/access.ts.
 */
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { videoJobs } from '@/lib/db/schema';

export type VideoJobRow = typeof videoJobs.$inferSelect;

/**
 * Load a video_jobs row gated on ownership.
 * Returns { job } or { error } (a ready-made 404/403 response).
 */
export async function getOwnedVideoJob(
  id: string,
  userId: string
): Promise<
  | { job: VideoJobRow; error?: undefined }
  | { job?: undefined; error: NextResponse }
> {
  const rows = await db
    .select()
    .from(videoJobs)
    .where(eq(videoJobs.id, id))
    .limit(1);
  const job = rows[0];
  if (!job) {
    return {
      error: NextResponse.json(
        { code: 'NOT_FOUND', error: 'Video job not found' },
        { status: 404 }
      ),
    };
  }
  if (job.userId !== userId) {
    return {
      error: NextResponse.json(
        { code: 'FORBIDDEN', error: 'Not your video job' },
        { status: 403 }
      ),
    };
  }
  return { job };
}

/** Convert driver-returned bytea (Buffer | Uint8Array) to a Buffer. */
export function toBuffer(data: unknown): Buffer | null {
  if (data == null) return null;
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  return null;
}
