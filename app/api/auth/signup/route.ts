/**
 * POST /api/auth/signup { email, password, name? }
 * Creates an email+password account (bcrypt hash, never plaintext).
 * Rate-limited per IP. Does NOT create a session — the client signs in
 * via the credentials provider afterwards.
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { signupWithPassword } from '@/lib/auth/credentials';
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/auth/rate-limit';

export async function POST(req: Request) {
  const { allowed, retryAfterSec } = checkRateLimit(getClientIp(req), 'signup');
  if (!allowed) {
    return NextResponse.json(
      {
        code: 'RATE_LIMITED',
        error: `Too many attempts. Try again in ${retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      },
    );
  }

  const body = await req.json().catch(() => null);
  const result = await signupWithPassword({
    email: body?.email,
    password: body?.password,
    name: body?.name,
  });

  if (!result.ok) {
    const status = result.code === 'EMAIL_TAKEN' ? 409 : 400;
    return NextResponse.json(
      { code: result.code, error: result.message },
      { status },
    );
  }
  return NextResponse.json({ ok: true, userId: result.userId }, { status: 201 });
}
