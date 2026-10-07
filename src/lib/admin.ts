/**
 * Etch — owner/admin bypass.
 *
 * Server-only. ADMIN_EMAILS is a comma-separated allowlist set as an env var.
 * The email being checked always comes from the verified Auth.js session
 * (never from client input), so it cannot be spoofed by the caller.
 *
 * Admin powers: skip free-generation daily caps, and auto-verify payment
 * orders (no UPI transfer) for testing. Safety/moderation filters are NOT
 * bypassed. Every bypassed payment is audit-logged as payment.admin_bypass.
 */

/** Normalized allowlist from the environment. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True when the signed-in user's email is on the admin allowlist. */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
