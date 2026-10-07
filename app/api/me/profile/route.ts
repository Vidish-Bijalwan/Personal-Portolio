export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { validateProfilePatch } from '@/lib/me/profile';

/**
 * GET /api/me/profile
 * Owner's own profile: display name, email, avatar, member-since.
 * Session-gated; a user can only ever read their own row.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const [row] = await db
    .select({
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Profile not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    displayName: row.name ?? null,
    email: row.email ?? null,
    avatarUrl: row.image ?? null,
    memberSince: row.createdAt ? row.createdAt.toISOString() : null,
  });
}

/**
 * PATCH /api/me/profile
 * Update displayName and/or avatarUrl. Only those two fields are ever
 * accepted — email, id and role can never change through this route.
 * Avatar: https URL or small image data-URL (validated server-side).
 */
export async function PATCH(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const validated = validateProfilePatch(body);
  if (!validated.ok) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: validated.error },
      { status: 400 }
    );
  }

  const patch: { name?: string; image?: string | null } = {};
  if (validated.displayName !== undefined) patch.name = validated.displayName;
  if (validated.avatarUrl !== undefined) patch.image = validated.avatarUrl;
  await db.update(users).set(patch).where(eq(users.id, user.id));

  const [row] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return NextResponse.json({
    ok: true,
    displayName: row?.name ?? null,
    avatarUrl: row?.image ?? null,
  });
}
