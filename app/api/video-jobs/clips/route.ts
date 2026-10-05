export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';

/**
 * GET /api/video-jobs/clips
 * Owner-gated. Lists the user's finished AI-generated video clips
 * (from the generations table) for the TTS clip picker.
 */
export async function GET(_req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const rows = await db
    .select({ id: generations.id, createdAt: generations.createdAt })
    .from(generations)
    .where(
      and(
        eq(generations.userId, user.id),
        eq(generations.mediaType, 'video'),
        eq(generations.status, 'done')
      )
    )
    .orderBy(desc(generations.createdAt))
    .limit(20);

  return NextResponse.json({
    clips: rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    })),
  });
}
