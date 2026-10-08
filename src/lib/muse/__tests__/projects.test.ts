/**
 * Madam Muse projects CRUD round-trip tests.
 * Runs against in-process PGlite with the embedded migrations (same
 * pattern as src/lib/db/__tests__/db.test.ts) — no external DB needed.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  type CreativeBrief,
} from '../projects';

let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(
  async () => {
    // Force the PGlite fallback path before client.ts evaluates.
    delete process.env.DATABASE_URL;
    schema = await import('@/lib/db/schema');
    client = await import('@/lib/db/client');
    await client.runMigrations();
  },
  120_000
);

function makeBrief(overrides: Partial<CreativeBrief> = {}): CreativeBrief {
  return {
    version: 1,
    taskType: 'image-generate',
    instruction: 'a retro travel poster of Manali at dawn',
    primary: null,
    references: [],
    preserve: ['text'],
    modifiers: [],
    exclusions: ['no stock look'],
    visualFamily: 'retro collage',
    outputSpec: { media: 'image', aspectRatio: '4:5', quality: 'studio' },
    ...overrides,
  };
}

async function makeUser(email: string) {
  const [u] = await client
    .getDb()
    .insert(schema.users)
    .values({ id: crypto.randomUUID(), email, name: 'Muse QA' })
    .returning();
  return u;
}

describe('projects CRUD', () => {
  it('creates, reads, lists, and patches a project', async () => {
    const db = client.getDb();
    const user = await makeUser(`muse-${crypto.randomUUID()}@test.local`);

    const created = await createProject(db, user.id, {
      name: 'Manali poster',
      brief: makeBrief(),
      primaryAsset: { refId: 'ref_01' },
      referenceIds: ['att_1', 'att_2'],
    });
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(created.name).toBe('Manali poster');
    expect(created.brief.instruction).toContain('Manali');
    expect(created.revisions).toBe(0);
    expect(created.lastResult).toBeUndefined();

    const fetched = await getProject(db, user.id, created.id);
    expect(fetched?.name).toBe('Manali poster');

    const listed = await listProjects(db, user.id);
    expect(listed.some((p) => p.id === created.id)).toBe(true);
    // Summary omits the brief.
    expect('brief' in listed[0]).toBe(false);

    const patched = await updateProject(db, user.id, created.id, {
      name: 'Manali poster v2',
    });
    expect(patched?.name).toBe('Manali poster v2');
    expect(patched?.revisions).toBe(0); // no result delivered → no increment
  });

  it('increments revisions when lastResult is patched', async () => {
    const db = client.getDb();
    const user = await makeUser(`muse-${crypto.randomUUID()}@test.local`);

    const created = await createProject(db, user.id, {
      name: 'Revision counter',
      brief: makeBrief(),
    });
    const delivered = await updateProject(db, user.id, created.id, {
      lastResult: {
        imageUrl: 'https://cdn.example/x.jpg',
        promptUsed: 'compiled prompt text',
      },
    });
    expect(delivered?.revisions).toBe(1);
    expect(delivered?.lastResult?.promptUsed).toBe('compiled prompt text');

    const delivered2 = await updateProject(db, user.id, created.id, {
      lastResult: { promptUsed: 'second revision prompt' },
    });
    expect(delivered2?.revisions).toBe(2);
  });

  it('is user-scoped: other users see nothing', async () => {
    const db = client.getDb();
    const a = await makeUser(`muse-a-${crypto.randomUUID()}@test.local`);
    const b = await makeUser(`muse-b-${crypto.randomUUID()}@test.local`);

    const created = await createProject(db, a.id, {
      name: 'Private',
      brief: makeBrief(),
    });
    expect(await getProject(db, b.id, created.id)).toBeNull();
    expect(await updateProject(db, b.id, created.id, { name: 'Hijack' })).toBeNull();
    expect((await listProjects(db, b.id)).some((p) => p.id === created.id)).toBe(false);
  });

  it('brief persists byte-identical through the round trip', async () => {
    const db = client.getDb();
    const user = await makeUser(`muse-${crypto.randomUUID()}@test.local`);
    const brief = makeBrief({ modifiers: ['darker', 'more grain'] });

    const created = await createProject(db, user.id, {
      name: 'Brief fidelity',
      brief,
    });
    const fetched = await getProject(db, user.id, created.id);
    expect(fetched?.brief).toEqual(brief);
  });
});
