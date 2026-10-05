export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { freeRemaining } from '@/lib/free/access';

/**
 * GET /api/free/remaining
 * Auth required. { left, cap } for the composer's free-tier toggle.
 * Counts free-tier images created today IST with status != 'failed'.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;
  return NextResponse.json(await freeRemaining(user.id));
}
