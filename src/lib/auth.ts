// Status: IMPLEMENTED (Google: READY_FOR_CREDENTIAL; credentials: IMPLEMENTED; dev: dev-only)
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from '@/lib/db/schema';
import {
  verifyPasswordCredentials,
  normalizeEmail,
} from './auth/credentials';

// ---------------------------------------------------------------------------
// BOOT GUARD: DEV_AUTH must be IMPOSSIBLE in production. This throws at
// import time (the app cannot boot), except during `next build` data
// collection (NEXT_PHASE=phase-production-build) where env is not the
// runtime env. A request-time assertProdSafe() below is belt-and-braces.
// ---------------------------------------------------------------------------
if (
  process.env.NODE_ENV === 'production' &&
  process.env.DEV_AUTH === 'true' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  throw new Error(
    'FATAL: DEV_AUTH=true is forbidden when NODE_ENV=production. Refusing to boot.',
  );
}

/** Request-time version of the boot guard (env can differ from import time). */
export function assertProdSafe(): void {
  if (process.env.NODE_ENV === 'production' && process.env.DEV_AUTH === 'true') {
    throw new Error(
      'FATAL: DEV_AUTH=true is forbidden when NODE_ENV=production.',
    );
  }
}

const providerList: Provider[] = [];

// Google OAuth is wired but INERT until credentials are provisioned.
// Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (Secure Vault) to enable.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providerList.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// ---------------------------------------------------------------------------
// Email + password login. Self-contained: no external keys needed.
// Passwords are stored ONLY as bcrypt hashes (see ./auth/credentials).
// authorize() returns null on ANY failure — the client maps every failure
// to one generic message (no user enumeration).
// ---------------------------------------------------------------------------
providerList.push(
  Credentials({
    id: 'credentials',
    name: 'Email',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (creds) => {
      const user = await verifyPasswordCredentials(
        creds?.email,
        creds?.password,
      );
      if (!user) return null;
      return {
        id: user.id,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      };
    },
  })
);

// ---------------------------------------------------------------------------
// WARNING: dev credentials login. This provider must be IMPOSSIBLE in
// production. It is (1) excluded from the provider list entirely unless
// DEV_AUTH === 'true', (2) its authorize() independently refuses when
// DEV_AUTH !== 'true', and (3) the module boot guard above throws if
// DEV_AUTH=true ever reaches a production runtime. Never set DEV_AUTH=true
// in any production/staging environment.
// ---------------------------------------------------------------------------
if (process.env.DEV_AUTH === 'true') {
  providerList.push(
    Credentials({
      id: 'dev',
      name: 'Dev login',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      authorize: async (creds) => {
        // Belt-and-braces: impossible without the explicit dev flag.
        if (process.env.DEV_AUTH !== 'true') return null;
        const email = normalizeEmail(creds?.email);
        if (!email) return null;

        const [existing] = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (existing) {
          return {
            id: existing.id,
            email: existing.email ?? undefined,
            name: existing.name ?? undefined,
          };
        }

        const name = email.split('@')[0] || 'dev';
        const [created] = await db
          .insert(users)
          .values({ email, name })
          .returning({ id: users.id });
        return { id: created.id, email, name };
      },
    })
  );
}

const isProd = process.env.NODE_ENV === 'production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Database sessions via Drizzle (sessions table in schema.ts).
  // Requires AUTH_SECRET to be set in every environment.
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'database',
    // 30-day sessions, sliding: the session is extended when the user is
    // active and the session is older than updateAge.
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  // Explicit cookie contract: httpOnly always (no JS access), SameSite=Lax
  // (CSRF-resistant top-level POSTs still work), Secure in production.
  // No auth state is ever kept in localStorage/sessionStorage — the client
  // never decides auth; every protected route re-validates server-side.
  cookies: {
    sessionToken: {
      name: `${isProd ? '__Secure-' : ''}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  providers: providerList,
});

/**
 * Server-side session helper. API routes import this exact name.
 * Returns null when there is no session (never throws).
 */
export async function getSessionUser(): Promise<{
  id: string;
  email?: string;
} | null> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return null;
  return { id: user.id, email: user.email };
}

/**
 * Machine-readable code returned by protected routes when the caller is not
 * signed in. The client lazy-auth modal keys off this exact string.
 */
export const LOGIN_REQUIRED = 'LOGIN_REQUIRED' as const;

export interface SessionUser {
  id: string;
  email?: string;
}

/**
 * requireSession() — every protected API route calls this FIRST and returns
 * `response` immediately when non-null. The client never decides auth.
 *
 *   const { user, response } = await requireSession();
 *   if (!user) return response;
 */
export async function requireSession(): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { code: LOGIN_REQUIRED, error: 'Sign in required' },
        { status: 401 },
      ),
    };
  }
  return { user, response: null };
}
