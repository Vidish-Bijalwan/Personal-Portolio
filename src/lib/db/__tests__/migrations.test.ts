import { describe, expect, it, vi } from 'vitest';
import { MIGRATION_FILES, MIGRATION_SQL } from '../migrations-data';
import { migratePg } from '../client';

type Q = (sql: string, params?: unknown[]) => Promise<any>;

/** Simulates a legacy production DB: every object already exists. */
function legacyDb() {
  const calls: { sql: string; params?: unknown[] }[] = [];
  const recorded = new Set<string>();
  const rawQuery: Q = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('CREATE TABLE IF NOT EXISTS "schema_migrations"')) return { rows: [] };
    if (sql.startsWith('SELECT "name" FROM "schema_migrations"'))
      return { rows: [...recorded].map((name) => ({ name })) };
    if (sql.startsWith('INSERT INTO "schema_migrations"')) {
      recorded.add((params as string[])[0]);
      return { rowCount: 1 };
    }
    // Every real migration statement hits an already-existing object.
    const err = new Error('already exists') as Error & { code: string };
    err.code = sql.includes('ADD CONSTRAINT') ? '42710' : sql.includes('ADD COLUMN') ? '42701' : '42P07';
    throw err;
  };
  return { calls, recorded, rawQuery };
}

describe('migratePg tracking', () => {
  it('runs new migrations on a legacy DB and records them', async () => {
    const { calls, recorded, rawQuery } = legacyDb();
    await migratePg(rawQuery);
    // All embedded migrations attempted despite duplicate-object errors…
    expect(recorded).toEqual(new Set(MIGRATION_FILES));
    // …and a second boot is a no-op for migrations (only tracking queries run).
    const callsBefore = calls.length;
    await migratePg(rawQuery);
    const migrationRuns = calls.slice(callsBefore).filter((c) => !c.sql.includes('schema_migrations'));
    expect(migrationRuns).toEqual([]);
  });

  it('skips already-recorded migrations', async () => {
    const { recorded, rawQuery } = legacyDb();
    recorded.add(MIGRATION_FILES[0]);
    recorded.add(MIGRATION_FILES[1]);
    const ran: string[] = [];
    const spy: Q = async (sql, params) => {
      if (!sql.includes('schema_migrations')) ran.push(sql.slice(0, 24));
      return rawQuery(sql, params);
    };
    await migratePg(spy);
    // Only the unrecorded migrations were attempted.
    expect(recorded).toEqual(new Set(MIGRATION_FILES));
    expect(ran.length).toBe(MIGRATION_SQL.length - 2);
  });

  it('rethrows non-duplicate errors', async () => {
    const boom: Q = async (sql) => {
      if (sql.startsWith('CREATE TABLE IF NOT EXISTS "schema_migrations"')) return { rows: [] };
      if (sql.startsWith('SELECT')) return { rows: [] };
      const err = new Error('connection lost') as Error & { code: string };
      err.code = '08006';
      throw err;
    };
    await expect(migratePg(boom)).rejects.toThrow('connection lost');
  });

  it('migration file list and SQL list stay aligned', () => {
    expect(MIGRATION_FILES.length).toBe(MIGRATION_SQL.length);
    expect(MIGRATION_FILES.length).toBeGreaterThan(0);
    expect(new Set(MIGRATION_FILES).size).toBe(MIGRATION_FILES.length);
  });
});
