/**
 * Madam Muse wiring unit tests: muse field parsing + effective prompt
 * resolution used by the order-creation routes.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  effectivePrompt,
  parseMuseBody,
  parseMuseForm,
  resolveProjectRef,
} from '../wiring';
import type { CreativeBrief } from '../projects';

const PID = '123e4567-e89b-12d3-a456-426614174000';

function makeBrief(): CreativeBrief {
  return {
    version: 1,
    taskType: 'image-generate',
    instruction: 'test brief',
    primary: null,
    references: [],
    preserve: [],
    modifiers: [],
    exclusions: [],
    outputSpec: { media: 'image', aspectRatio: '1:1', quality: 'studio' },
  };
}

describe('parseMuseBody', () => {
  it('parses all three fields', () => {
    const r = parseMuseBody({
      brief: makeBrief(),
      compiledPrompt: 'compiled smart prompt',
      projectId: PID,
    });
    expect(r.error).toBeUndefined();
    expect(r.fields.brief?.instruction).toBe('test brief');
    expect(r.fields.compiledPrompt).toBe('compiled smart prompt');
    expect(r.fields.projectId).toBe(PID);
  });
  it('tolerates missing fields (all null)', () => {
    const r = parseMuseBody({});
    expect(r.error).toBeUndefined();
    expect(r.fields).toEqual({ brief: null, compiledPrompt: null, projectId: null });
  });
  it('rejects an invalid brief', () => {
    const r = parseMuseBody({ brief: { version: 2 } });
    expect(r.error).toContain('CreativeBrief');
  });
  it('rejects an invalid projectId', () => {
    const r = parseMuseBody({ projectId: 'not-a-uuid' });
    expect(r.error).toContain('UUID');
  });
  it('rejects an overlong compiledPrompt', () => {
    const r = parseMuseBody({ compiledPrompt: 'x'.repeat(2001) });
    expect(r.error).toContain('2000');
  });
});

describe('parseMuseForm', () => {
  it('reads brief as a JSON string from multipart fields', () => {
    const form = new FormData();
    form.append('brief', JSON.stringify(makeBrief()));
    form.append('compiledPrompt', 'from form');
    form.append('projectId', PID);
    const r = parseMuseForm(form);
    expect(r.error).toBeUndefined();
    expect(r.fields.brief?.taskType).toBe('image-generate');
    expect(r.fields.compiledPrompt).toBe('from form');
    expect(r.fields.projectId).toBe(PID);
  });
  it('rejects malformed brief JSON', () => {
    const form = new FormData();
    form.append('brief', '{not json');
    const r = parseMuseForm(form);
    expect(r.error).toContain('JSON');
  });
});

describe('effectivePrompt', () => {
  it('prefers the compiled prompt when present', () => {
    expect(effectivePrompt('compiled', 'fallback')).toBe('compiled');
  });
  it('falls back when compiled is null/empty', () => {
    expect(effectivePrompt(null, 'fallback')).toBe('fallback');
    expect(effectivePrompt('   ', 'fallback')).toBe('fallback');
  });
});

describe('resolveProjectRef', () => {
  let client: typeof import('@/lib/db/client');
  let schema: typeof import('@/lib/db/schema');

  beforeAll(async () => {
    delete process.env.DATABASE_URL;
    schema = await import('@/lib/db/schema');
    client = await import('@/lib/db/client');
    await client.runMigrations();
  }, 120_000);

  async function makeUser() {
    const [u] = await client
      .getDb()
      .insert(schema.users)
      .values({ id: crypto.randomUUID(), email: `w-${crypto.randomUUID()}@t.local` })
      .returning();
    return u;
  }

  it('passes through null', async () => {
    const u = await makeUser();
    const r = await resolveProjectRef(client.getDb(), null, u.id);
    expect(r).toEqual({ ok: true, projectId: null });
  });

  it('400s on an unknown project', async () => {
    const u = await makeUser();
    const r = await resolveProjectRef(client.getDb(), PID, u.id);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('403s on another user\'s project', async () => {
    const db = client.getDb();
    const a = await makeUser();
    const b = await makeUser();
    const [p] = await db
      .insert(schema.projects)
      .values({ userId: a.id, name: 'A project' })
      .returning();
    const r = await resolveProjectRef(db, p.id, b.id);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });

  it('claims an unowned project for the user', async () => {
    const db = client.getDb();
    const u = await makeUser();
    const [p] = await db
      .insert(schema.projects)
      .values({ userId: null, name: 'Unclaimed' })
      .returning();
    const r = await resolveProjectRef(db, p.id, u.id);
    expect(r).toEqual({ ok: true, projectId: p.id });
    const rows = await db
      .select()
      .from(schema.projects)
      .where(
        (await import('drizzle-orm')).eq(schema.projects.id, p.id)
      );
    expect(rows[0].userId).toBe(u.id);
  });
});
