/**
 * Vidish Studio — DB client.
 *
 * Connects via `pg` Pool + drizzle node-postgres when DATABASE_URL is set,
 * otherwise uses an in-process PGlite (no external DB needed for dev/test).
 *
 * Design notes for serverless (Vercel):
 * - The singleton lives on `globalThis`, NOT in module scope: Next.js
 *   bundles each route/instrumentation entry separately, so module-level
 *   state is NOT shared across chunks in one process. globalThis is.
 * - Migrations run lazily on first DB use. The driver's `query` method is
 *   wrapped to await a shared readiness promise, so NO call site needs to
 *   change and builders (`db.select().from()...`) keep working synchronously
 *   until awaited. Migrations themselves use the RAW client to avoid
 *   deadlocking on the readiness gate.
 * - PGlite must stay out of the webpack bundle (`serverExternalPackages`
 *   in next.config.mjs): bundling mangles its internal file-URL resolution.
 */
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import * as schema from './schema';
import { MIGRATION_SQL } from './migrations-data';

export type VilishDb = ReturnType<typeof drizzleNodePg<typeof schema>>;

interface SharedDb {
  db: VilishDb;
  /** Raw PGlite instance (null on the node-postgres path). */
  pglite: PGlite | null;
  /** Resolves when migrations have completed (or rejects on failure). */
  ready: Promise<void>;
}

async function migratePg(rawQuery: (sql: string) => Promise<unknown>): Promise<void> {
  // Idempotency guard: our schema marker is the `orders` table (Vidish-specific).
  const marker = (await rawQuery(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orders'`,
  )) as { rowCount: number | null };
  if ((marker.rowCount ?? 0) === 0) {
    for (const sql of MIGRATION_SQL) {
      try {
        await rawQuery(sql);
      } catch (err) {
        // Race guard for concurrent cold starts.
        const code = (err as { code?: string }).code;
        if (code !== '42P07' && code !== '42701') throw err;
      }
    }
  }
}

function getShared(): SharedDb {
  const g = globalThis as unknown as { __vilishDb?: SharedDb };
  if (!g.__vilishDb) {
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      let resolveReady!: () => void;
      let rejectReady!: (err: unknown) => void;
      const ready = new Promise<void>((res, rej) => {
        resolveReady = res;
        rejectReady = rej;
      });
      const rawQuery = pool.query.bind(pool);
      // Gate every query on migrations; drizzle resolves pool.query dynamically.
      (pool as any).query = async (...args: any[]) => {
        await ready;
        return rawQuery(...(args as [string]));
      };
      const db = drizzleNodePg(pool, { schema });
      g.__vilishDb = { db, pglite: null, ready };
      migratePg((sql) => rawQuery(sql) as Promise<unknown>).then(resolveReady, rejectReady);
    } else {
      const raw = new PGlite();
      let resolveReady!: () => void;
      let rejectReady!: (err: unknown) => void;
      const ready = new Promise<void>((res, rej) => {
        resolveReady = res;
        rejectReady = rej;
      });
      // Gate the driver's queries on migrations. drizzle-pglite calls
      // client.query(...); the migration itself uses the raw instance.
      const gated = new Proxy(raw, {
        get(t, prop, receiver) {
          const v = Reflect.get(t, prop, receiver);
          if ((prop === 'query' || prop === 'exec') && typeof v === 'function') {
            return async (...args: any[]) => {
              await ready;
              return (v as (...a: any[]) => unknown).apply(t, args);
            };
          }
          return typeof v === 'function' ? (v as (...a: any[]) => unknown).bind(t) : v;
        },
      }) as PGlite;
      const db = drizzlePglite(gated, { schema }) as unknown as VilishDb;
      g.__vilishDb = { db, pglite: raw, ready };
      (async () => {
        try {
          for (const sql of MIGRATION_SQL) await raw.exec(sql);
          resolveReady();
        } catch (err) {
          rejectReady(err);
        }
      })();
    }
  }
  return g.__vilishDb!;
}

/** Drizzle DB handle. First query per process transparently awaits migrations. */
export function getDb(): VilishDb {
  return getShared().db;
}

/** Default alias (same handle). */
export const db = getDb();

/** Raw PGlite instance on the fallback path, else null. */
export function getPgliteInstance(): PGlite | null {
  return getShared().pglite;
}

/**
 * Run migrations explicitly and wait for them (idempotent).
 * Routes don't need this — the first query per process already waits via
 * the readiness gate. Useful for scripts and tests.
 */
export async function runMigrations(): Promise<void> {
  await getShared().ready;
}
