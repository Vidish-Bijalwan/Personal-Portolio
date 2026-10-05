/**
 * Next.js instrumentation hook — runs once when the server boots
 * (Node.js runtime; not during `next build`).
 *
 * Ensures the database schema exists before serving traffic:
 * - Preview / dev (no DATABASE_URL): PGlite is a fresh in-memory DB per
 *   serverless instance, so migrations must run on every cold start.
 * - Production (DATABASE_URL): runMigrations() is idempotent via the
 *   `orders`-table marker — already-migrated databases are skipped, and
 *   concurrent cold starts race safely on "already exists" codes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runMigrations } = await import('./src/lib/db/client');
    try {
      await runMigrations();
    } catch (err) {
      console.error('[instrumentation] runMigrations failed:', err);
      throw err;
    }
  }
}
