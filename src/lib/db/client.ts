/**
 * Vidish Studio — DB client.
 *
 * Connects via `pg` Pool + drizzle node-postgres when DATABASE_URL is set,
 * otherwise uses an in-process PGlite (no external DB needed for dev/test).
 * The pg connection lazily materialises on first use so the PGlite path is
 * the one exercised in tests.
 */
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import * as schema from './schema';

export type VilishDb = ReturnType<typeof drizzleNodePg<typeof schema>>;

let nodePgDb: VilishDb | null = null;
let nodePgPool: Pool | null = null;
let pgliteDb: ReturnType<typeof drizzlePglite<typeof schema>> | null = null;
let pgliteInstance: PGlite | null = null;

/**
 * Return the drizzle DB handle. If DATABASE_URL is set, uses a `pg` Pool;
 * otherwise falls back to in-process PGlite.
 */
export function getDb(): VilishDb {
  if (process.env.DATABASE_URL) {
    if (!nodePgDb) {
      nodePgPool = new Pool({ connectionString: process.env.DATABASE_URL });
      nodePgDb = drizzleNodePg(nodePgPool, { schema });
    }
    return nodePgDb;
  }
  if (!pgliteDb) {
    pgliteInstance = new PGlite();
    pgliteDb = drizzlePglite(pgliteInstance, { schema });
  }
  return pgliteDb as unknown as VilishDb;
}

/** Default export alias. */
export const db = getDb();

/** Return the raw PGlite instance when running in the PGlite fallback path, else null. */
export function getPgliteInstance(): PGlite | null {
  return process.env.DATABASE_URL ? null : pgliteInstance;
}

/**
 * Apply every embedded migration in filename order.
 * The SQL is bundled at build time (see migrations-data.ts) — no runtime
 * filesystem access, which Vercel serverless functions do not reliably
 * provide for the drizzle/ directory.
 */
export async function runMigrations(): Promise<void> {
  const { MIGRATION_FILES, MIGRATION_SQL } = await import('./migrations-data');

  if (process.env.DATABASE_URL) {
    const { Pool: PgPool } = await import('pg');
    const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
    try {
      // Idempotency guard: our schema marker is the `orders` table (Vidish-specific).
      // Fresh DB -> run all migrations. Already-migrated DB -> skip entirely.
      // (A foreign `users` table without `orders` fails loudly below instead of
      // silently writing into the wrong table.)
      const marker = await pool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orders'`,
      );
      if ((marker.rowCount ?? 0) === 0) {
        for (let i = 0; i < MIGRATION_FILES.length; i++) {
          const sql = MIGRATION_SQL[i];
          try {
            await pool.query(sql);
          } catch (err) {
            // Race guard: two concurrent cold starts may both attempt the
            // migration; the loser sees "already exists" and moves on.
            const code = (err as { code?: string }).code;
            if (code !== '42P07' && code !== '42701') throw err;
          }
        }
      }
    } finally {
      await pool.end();
    }
    return;
  }

  // PGlite path: share the instance the drizzle handle wraps.
  // Fresh in-memory DB per serverless instance -> always migrate.
  getDb();
  const client = pgliteInstance!;
  for (const sql of MIGRATION_SQL) {
    await client.exec(sql);
  }
}
