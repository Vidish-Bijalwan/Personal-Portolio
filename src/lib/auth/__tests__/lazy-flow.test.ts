/**
 * Lazy-auth flow tests (no external services):
 * - Anonymous quote endpoint stays public (no session required).
 * - POST /api/generation/start without a session → 401 + machine-readable
 *   code LOGIN_REQUIRED (the UI keys its login modal off this).
 * - Signup route: 201 → 409 on duplicate → 400 on weak input → 429 when
 *   the per-IP rate limit trips.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// --- mock the auth module BEFORE the route under test imports it ---
vi.mock('@/lib/auth', () => ({
  requireSession: vi.fn(async () => ({
    user: null,
    response: NextResponse.json(
      { code: 'LOGIN_REQUIRED', error: 'Sign in required' },
      { status: 401 },
    ),
  })),
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
}));

let startRoute: typeof import('../../../../app/api/generation/start/route');
let signupRoute: typeof import('../../../../app/api/auth/signup/route');
let rateLimit: typeof import('../rate-limit');
let client: typeof import('@/lib/db/client');

beforeAll(
  async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = 'test-secret-for-auth-unit-tests-only';
    client = await import('@/lib/db/client');
    await client.runMigrations();
    startRoute = await import('../../../../app/api/generation/start/route');
    signupRoute = await import('../../../../app/api/auth/signup/route');
    rateLimit = await import('../rate-limit');
  },
  120_000,
);

beforeEach(() => {
  rateLimit.__resetRateLimits();
});

function postJson(path: string, body: unknown, ip = '203.0.113.10'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

describe('lazy auth: submit requires login, quote stays anonymous', () => {
  it('generation/start without session → 401 + LOGIN_REQUIRED', async () => {
    const res = await startRoute.POST(
      postJson('/api/generation/start', { quoteId: 'q-does-not-matter' }),
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('LOGIN_REQUIRED');
  });

  it('quote route module does not import the session gate', async () => {
    // Static guarantee: quoting never requires auth (lazy by design).
    const fs = await import('node:fs');
    const src = fs.readFileSync(
      new URL('../../../../app/api/generation/quote/route.ts', import.meta.url),
      'utf8',
    );
    expect(src).not.toMatch(/requireSession|getSessionUser/);
  });
});

describe('signup route', () => {
  it('201 on valid signup', async () => {
    const res = await signupRoute.POST(
      postJson('/api/auth/signup', {
        email: `route-${Date.now()}@example.com`,
        password: 'route-test-pw-1',
      }),
    );
    expect(res.status).toBe(201);
    expect((await res.json()).ok).toBe(true);
  });

  it('409 on duplicate email', async () => {
    const email = `dup-route-${Date.now()}@example.com`;
    const first = await signupRoute.POST(
      postJson('/api/auth/signup', { email, password: 'route-test-pw-1' }),
    );
    expect(first.status).toBe(201);
    const second = await signupRoute.POST(
      postJson('/api/auth/signup', { email, password: 'route-test-pw-1' }),
    );
    expect(second.status).toBe(409);
    expect((await second.json()).code).toBe('EMAIL_TAKEN');
  });

  it('400 on invalid email / weak password', async () => {
    const badEmail = await signupRoute.POST(
      postJson('/api/auth/signup', { email: 'nope', password: 'route-test-pw-1' }),
    );
    expect(badEmail.status).toBe(400);
    const weak = await signupRoute.POST(
      postJson('/api/auth/signup', { email: 'weak-x@y.zz', password: 'short' }),
    );
    expect(weak.status).toBe(400);
    expect((await weak.json()).code).toBe('WEAK_PASSWORD');
  });

  it(
    '429 after 5 attempts from the same IP',
    async () => {
    const ip = '198.51.100.77';
    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await signupRoute.POST(
        postJson(
          '/api/auth/signup',
          { email: `rl-${Date.now()}-${i}@example.com`, password: 'route-test-pw-1' },
          ip,
        ),
      );
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
    const retry = await signupRoute.POST(
      postJson('/api/auth/signup', { email: 'rl-final@example.com', password: 'route-test-pw-1' }, ip),
    );
    expect(retry.status).toBe(429);
    expect(retry.headers.get('Retry-After')).toBeTruthy();
    expect((await retry.json()).code).toBe('RATE_LIMITED');
    },
    30_000,
  );
});
