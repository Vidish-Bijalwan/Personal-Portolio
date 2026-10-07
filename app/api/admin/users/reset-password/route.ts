export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';

/**
 * POST /api/admin/users/reset-password
 * ONE-TIME owner tool: reset a user's password by email.
 * Fail-closed x-admin-token gate (same as all /api/admin/* routes).
 * Body: { email, newPassword (min 8 chars) }.
 * This endpoint is temporary — it is removed after the owner's reset.
 */
export async function POST(req: NextRequest) {
  const denied = adminAuthFail(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();
  const newPassword = String(body?.newPassword ?? '');
  if (!email || newPassword.length < 8) {
    return NextResponse.json(
      { error: 'email and newPassword (min 8 chars) required' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, email))
    .returning({ id: users.id });

  if (!updated[0]) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
