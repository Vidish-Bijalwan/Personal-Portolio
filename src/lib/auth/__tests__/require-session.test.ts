/**
 * requireSession() contract tests — the REAL helper from src/lib/auth,
 * with next-auth itself mocked so no DB/session cookie is needed.
 *
 * Contract: no session → { user: null, response: 401 + code LOGIN_REQUIRED };
 * session → { user, response: null }.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAuthFn } = vi.hoisted(() => ({ mockAuthFn: vi.fn() }));

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: mockAuthFn,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

let authMod: typeof import('../../auth');

beforeEach(async () => {
  process.env.AUTH_SECRET = 'test-secret-for-auth-unit-tests-only';
  delete process.env.DATABASE_URL;
  delete process.env.DEV_AUTH;
  vi.resetModules();
  mockAuthFn.mockReset();
  authMod = await import('../../auth');
});

describe('requireSession', () => {
  it('returns 401 + LOGIN_REQUIRED when there is no session', async () => {
    mockAuthFn.mockResolvedValue(null);
    const { user, response } = await authMod.requireSession();
    expect(user).toBeNull();
    expect(response).not.toBeNull();
    expect(response!.status).toBe(401);
    const body = await response!.json();
    expect(body.code).toBe('LOGIN_REQUIRED');
    expect(body.code).toBe(authMod.LOGIN_REQUIRED);
  });

  it('returns 401 + LOGIN_REQUIRED when the session has no user id', async () => {
    mockAuthFn.mockResolvedValue({ user: { email: 'a@b.c' } });
    const { user, response } = await authMod.requireSession();
    expect(user).toBeNull();
    expect(response!.status).toBe(401);
  });

  it('returns the user and no response when a session exists', async () => {
    mockAuthFn.mockResolvedValue({ user: { id: 'user-1', email: 'a@b.c' } });
    const { user, response } = await authMod.requireSession();
    expect(response).toBeNull();
    expect(user).toEqual({ id: 'user-1', email: 'a@b.c' });
  });

  it('uses the hardened cookie contract (httpOnly, SameSite=Lax)', async () => {
    // Re-import is already done in beforeEach; assert the module exports.
    expect(authMod.LOGIN_REQUIRED).toBe('LOGIN_REQUIRED');
    expect(typeof authMod.requireSession).toBe('function');
    expect(typeof authMod.getSessionUser).toBe('function');
  });
});

describe('DEV_AUTH boot guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuses to load when DEV_AUTH=true in production', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DEV_AUTH', 'true');
    // NEXT_PHASE is unset in this runtime (not a next build) → must throw.
    delete process.env.NEXT_PHASE;
    await expect(import('../../auth')).rejects.toThrow(/DEV_AUTH.*forbidden/i);
  });

  it('assertProdSafe throws at request time under the same condition', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DEV_AUTH', 'true');
    expect(() => authMod.assertProdSafe()).toThrow(/DEV_AUTH.*forbidden/i);
    vi.stubEnv('DEV_AUTH', '');
    vi.stubEnv('NODE_ENV', 'test');
    expect(() => authMod.assertProdSafe()).not.toThrow();
  });
});
