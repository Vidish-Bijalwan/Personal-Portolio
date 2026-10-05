"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client session context. The session token itself lives in an httpOnly
 * cookie — nothing auth-related is stored in localStorage/sessionStorage.
 * Components must treat useSession() as a UI hint only; every protected
 * API route re-validates the session server-side via requireSession().
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
