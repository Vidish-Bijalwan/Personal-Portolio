/**
 * Auth.js request handlers, wrapped with:
 * 1. assertProdSafe() — DEV_AUTH=true can never serve in production.
 * 2. Per-IP rate limiting on the credentials callback (login attempts).
 *
 * The rate-limited response keeps the { url } shape the next-auth/react
 * signIn() client parses (it does `new URL(data.url)` unconditionally),
 * while still returning HTTP 429 + Retry-After for direct API consumers.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { handlers, assertProdSafe } from '@/lib/auth';
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

function guard(req: NextRequest): NextResponse | null {
  assertProdSafe();
  const url = new URL(req.url);
  const isCredentialsCallback =
    req.method === 'POST' && url.pathname.endsWith('/callback/credentials');
  if (!isCredentialsCallback) return null;

  const { allowed, retryAfterSec } = checkRateLimit(
    getClientIp(req),
    'login',
  );
  if (allowed) return null;
  return NextResponse.json(
    {
      // Shape the signIn() client can parse: it reads data.url unconditionally.
      url: new URL('/api/auth/error?error=RateLimited', req.url).toString(),
      code: 'RATE_LIMITED',
      error: `Too many attempts. Try again in ${retryAfterSec}s.`,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSec) },
    },
  );
}

export async function GET(req: NextRequest) {
  const blocked = guard(req);
  if (blocked) return blocked;
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const blocked = guard(req);
  if (blocked) return blocked;
  return handlers.POST(req);
}
