// Status: IMPLEMENTED (Google: READY_FOR_CREDENTIAL; dev credentials: dev-only)
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
// WARNING: dev credentials login. This provider must be IMPOSSIBLE in
// production. It is (1) excluded from the provider list entirely unless
// DEV_AUTH === 'true', and (2) its authorize() independently refuses when
// DEV_AUTH !== 'true'. Never set DEV_AUTH=true in any production/staging
// environment — doing so would let anyone self-provision an account by email.
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
        const email = String(creds?.email ?? '').trim().toLowerCase();
        if (!email.includes('@')) return null;

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Database sessions via Drizzle (sessions table in schema.ts).
  // Requires AUTH_SECRET to be set in every environment.
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: 'database' },
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
