/**
 * Credentials auth tests — real PGlite roundtrip, no external services.
 * Covers: signup validation, bcrypt hashing (never plaintext), login success,
 * generic failure (no enumeration), email normalization.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { eq } from 'drizzle-orm';

let credentials: typeof import('../credentials');
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(
  async () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = 'test-secret-for-auth-unit-tests-only';
    credentials = await import('../credentials');
    schema = await import('@/lib/db/schema');
    client = await import('@/lib/db/client');
    await client.runMigrations();
  },
  120_000,
);

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(credentials.normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });
  it('rejects malformed input', () => {
    expect(credentials.normalizeEmail('not-an-email')).toBeNull();
    expect(credentials.normalizeEmail('a@b')).toBeNull();
    expect(credentials.normalizeEmail('')).toBeNull();
    expect(credentials.normalizeEmail(null)).toBeNull();
    expect(credentials.normalizeEmail(123)).toBeNull();
  });
});

describe('validatePassword', () => {
  it('rejects short passwords', () => {
    expect(credentials.validatePassword('1234567')).toMatch(/at least 8/);
  });
  it('rejects overlong passwords', () => {
    expect(credentials.validatePassword('x'.repeat(129))).toMatch(/at most 128/);
  });
  it('accepts a normal password', () => {
    expect(credentials.validatePassword('correct-horse-1')).toBeNull();
  });
});

describe('signupWithPassword', { timeout: 60_000 }, () => {
  it('creates a user with a bcrypt hash, never plaintext', async () => {
    const email = `signup-${Date.now()}@example.com`;
    const res = await credentials.signupWithPassword({
      email,
      password: 's3cure-password',
      name: 'Test Creator',
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const db = client.getDb();
    const [row] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, res.userId))
      .limit(1);
    expect(row.email).toBe(email);
    expect(row.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    expect(row.passwordHash).not.toContain('s3cure-password');
  });

  it('rejects duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    const first = await credentials.signupWithPassword({ email, password: 's3cure-password' });
    expect(first.ok).toBe(true);
    const second = await credentials.signupWithPassword({ email, password: 'other-password-1' });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe('EMAIL_TAKEN');
  });

  it('rejects invalid email and weak password', async () => {
    const badEmail = await credentials.signupWithPassword({ email: 'nope', password: 's3cure-password' });
    expect(badEmail.ok).toBe(false);
    const weak = await credentials.signupWithPassword({ email: 'x@y.zz', password: 'short' });
    expect(weak.ok).toBe(false);
    if (!weak.ok) expect(weak.code).toBe('WEAK_PASSWORD');
  });
});

describe('verifyPasswordCredentials', { timeout: 60_000 }, () => {
  const email = `login-${Date.now()}@example.com`;
  const password = 'my-secret-pw-9';

  beforeAll(async () => {
    const res = await credentials.signupWithPassword({ email, password });
    expect(res.ok).toBe(true);
  });

  it('returns the user for correct credentials (case-insensitive email)', async () => {
    const user = await credentials.verifyPasswordCredentials(email.toUpperCase(), password);
    expect(user?.email).toBe(email);
    expect(user?.id).toBeTruthy();
  });

  it('returns null for wrong password — indistinguishable from unknown email', async () => {
    const wrongPw = await credentials.verifyPasswordCredentials(email, 'wrong-password-1');
    const unknown = await credentials.verifyPasswordCredentials('nobody-here@example.com', 'wrong-password-1');
    expect(wrongPw).toBeNull();
    expect(unknown).toBeNull();
  });

  it('returns null for malformed input', async () => {
    expect(await credentials.verifyPasswordCredentials('bad', password)).toBeNull();
    expect(await credentials.verifyPasswordCredentials(email, '')).toBeNull();
    expect(await credentials.verifyPasswordCredentials(null, null)).toBeNull();
  });

  it('rejects OAuth/dev-only accounts that have no password hash', async () => {
    const db = client.getDb();
    const oauthEmail = `oauth-${Date.now()}@example.com`;
    await db.insert(schema.users).values({ email: oauthEmail, name: 'OAuth User' });
    expect(await credentials.verifyPasswordCredentials(oauthEmail, 'anything-123')).toBeNull();
  });
});
