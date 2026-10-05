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
 * Apply every `drizzle/*.sql` migration in filename order.
 * Uses raw SQL through PGlite's exec, or the node-postgres pool.
 */
export async function runMigrations(): Promise<void> {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = path.resolve(process.cwd(), 'drizzle');
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (process.env.DATABASE_URL) {
    const { Pool: PgPool } = await import('pg');
    const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
    try {
      for (const f of files) {
        const sql = fs.readFileSync(path.join(dir, f), 'utf8');
        await pool.query(sql);
      }
    } finally {
      await pool.end();
    }
    return;
  }

  // PGlite path: share the instance the drizzle handle wraps.
  getDb();
  const client = pgliteInstance!;
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await client.exec(sql);
  }
}
