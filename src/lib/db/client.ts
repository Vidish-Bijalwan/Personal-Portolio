/**
 * Pixaura — DB client.
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
import { MIGRATION_FILES, MIGRATION_SQL } from './migrations-data';

export type VilishDb = ReturnType<typeof drizzleNodePg<typeof schema>>;

interface SharedDb {
  db: VilishDb;
  /** Raw PGlite instance (null on the node-postgres path). */
  pglite: PGlite | null;
  /** Resolves when migrations have completed (or rejects on failure). */
  ready: Promise<void>;
}

/** Run embedded migrations on the node-postgres path with per-file tracking.
 * Exported for tests (and scripts); routes use the readiness gate instead. */
export async function migratePg(rawQuery: (sql: string, params?: unknown[]) => Promise<any>): Promise<void> {
  // Track applied migrations per-file so NEW migrations also run on
  // existing databases. (The old guard — "orders table exists, skip
  // everything" — meant prod never picked up later migrations.)
  await rawQuery(
    `CREATE TABLE IF NOT EXISTS "schema_migrations" ("name" text PRIMARY KEY NOT NULL, "applied_at" timestamp with time zone DEFAULT now() NOT NULL)`,
  );
  const appliedRes = await rawQuery(`SELECT "name" FROM "schema_migrations"`);
  const applied = new Set<string>((appliedRes.rows ?? []).map((r: { name: string }) => r.name));
  for (let i = 0; i < MIGRATION_FILES.length; i++) {
    const name = MIGRATION_FILES[i];
    if (applied.has(name)) continue;
    try {
      await rawQuery(MIGRATION_SQL[i]);
    } catch (err) {
      // Race guard for concurrent cold starts, plus tolerance for objects
      // that predate tracking (legacy DBs): duplicate table / column /
      // constraint are all safe to skip.
      const code = (err as { code?: string }).code;
      if (code !== '42P07' && code !== '42701' && code !== '42710') throw err;
    }
    // Migration names come from our own embedded list; quote-escape anyway.
    await rawQuery(`INSERT INTO "schema_migrations" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`, [name]);
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
      migratePg((sql, params) => rawQuery(sql, params) as Promise<any>).then(resolveReady, rejectReady);
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
          for (const sql of MIGRATION_SQL) {
            try {
              await raw.exec(sql);
            } catch (err) {
              // Same tolerance as migratePg: duplicate table/column/constraint
              // are safe to skip (e.g. legacy duplicate migration files).
              const code = (err as { code?: string }).code;
              if (code !== "42P07" && code !== "42701" && code !== "42710") throw err;
            }
          }
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
