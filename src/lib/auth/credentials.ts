/**
 * Email+password (credentials) auth logic.
 *
 * - Passwords are stored ONLY as bcrypt hashes (cost 12), never plaintext.
 * - verifyPasswordCredentials returns null on ANY failure with no distinction
 *   between "unknown email" and "wrong password" (no user enumeration).
 * - A dummy bcrypt compare runs on the invalid-input path so that path is
 *   not measurably faster than a real wrong-password check.
 */
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
const BCRYPT_COST = 12;

/** Generic message surfaced on login failure — identical for every cause. */
export const GENERIC_AUTH_ERROR = 'Invalid email or password.';

/**
 * Precomputed dummy hash so the "no such user / bad input" path still pays
 * for a bcrypt compare. Generated once at module load.
 */
const DUMMY_HASH: string = bcrypt.hashSync(
  `vilish-dummy-${Math.random().toString(36).slice(2)}`,
  10,
);

/** Lowercase + basic shape check. Returns null when invalid. */
export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const e = email.trim().toLowerCase();
  if (e.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}

/** Returns an error message, or null when the password is acceptable. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export type SignupResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      code: 'INVALID_EMAIL' | 'WEAK_PASSWORD' | 'EMAIL_TAKEN';
      message: string;
    };

export async function signupWithPassword(input: {
  email: unknown;
  password: unknown;
  name?: unknown;
}): Promise<SignupResult> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return {
      ok: false,
      code: 'INVALID_EMAIL',
      message: 'Enter a valid email address.',
    };
  }
  const pwError = validatePassword(input.password);
  if (pwError) {
    return { ok: false, code: 'WEAK_PASSWORD', message: pwError };
  }
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return {
      ok: false,
      code: 'EMAIL_TAKEN',
      message: 'An account with this email already exists. Please sign in.',
    };
  }
  const passwordHash = await hashPassword(input.password as string);
  const rawName = typeof input.name === 'string' ? input.name.trim() : '';
  const name = rawName.slice(0, 120) || email.split('@')[0] || 'creator';
  const [created] = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({ id: users.id });
  return { ok: true, userId: created.id };
}

export interface VerifiedUser {
  id: string;
  email: string | null;
  name: string | null;
}

/**
 * Returns the user on success, null on ANY failure (unknown email, missing
 * hash, wrong password, malformed input) — callers must surface only
 * GENERIC_AUTH_ERROR.
 */
export async function verifyPasswordCredentials(
  email: unknown,
  password: unknown,
): Promise<VerifiedUser | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || typeof password !== 'string' || password.length === 0) {
    await bcrypt.compare('invalid-input', DUMMY_HASH);
    return null;
  }
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  // Always compare (against the dummy when there is no user/hash) so the
  // timing profile does not reveal whether the email exists.
  const matches = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
  if (!matches || !row) return null;
  return { id: row.id, email: row.email, name: row.name };
}
