/**
 * Shared admin-token helpers for the fulfillment section.
 * Token lives in sessionStorage (this tab only) so the operator is not
 * re-prompted when moving between the queue and job detail pages.
 */

export const ADMIN_TOKEN_KEY = "vilish-admin-token";

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* storage unavailable — caller still works for this render */
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Fetch wrapper that injects the admin token header. */
export async function adminFetch(
  token: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { ...(init?.headers ?? {}), "x-admin-token": token },
  });
}
