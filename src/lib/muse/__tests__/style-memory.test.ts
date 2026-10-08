/**
 * Madam Muse approved-style memory tests.
 * Persistence round-trip runs against in-process PGlite with the embedded
 * migrations (same pattern as projects.test.ts) — no external DB needed.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import {
  clearStyleMemory,
  deriveFingerprintFromProject,
  isValidStyleFingerprint,
  listStyleMemory,
  recordStyleApproval,
  removeStyleMemory,
  STYLE_MEMORY_CAP,
  topMemoryFamily,
  type StyleFingerprint,
} from '../style-memory';
import type { Project } from '../projects';

let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(
  async () => {
    delete process.env.DATABASE_URL;
    schema = await import('@/lib/db/schema');
    client = await import('@/lib/db/client');
    await client.runMigrations();
  },
  180_000
);

const GOOD: StyleFingerprint = {
  visualFamily: 'retro collage',
  palette: ['#f4ead8', '#2a7f7f', '#e08a3c'],
  texture: 'grainy paper, halftone overlays',
  typography: 'hand-drawn retro display headline',
  accentRole: 'orange accent for stamps',
  source: 'manual',
};

async function makeUser(email: string) {
  const [u] = await client
    .getDb()
    .insert(schema.users)
    .values({ id: crypto.randomUUID(), email, name: 'Muse QA' })
    .returning();
  return u;
}

function makeProject(overrides: Partial<Project['brief']> = {}): Project {
  return {
    id: crypto.randomUUID(),
    name: 'Test project',
    brief: {
      version: 1,
      taskType: 'image-generate',
      instruction: 'a retro poster',
      primary: null,
      references: [],
      preserve: [],
      modifiers: [],
      exclusions: [],
      visualFamily: 'retro collage',
      outputSpec: { media: 'image', aspectRatio: '4:5', quality: 'studio' },
      ...overrides,
    } as Project['brief'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revisions: 0,
  };
}

describe('isValidStyleFingerprint', () => {
  it('accepts a well-formed fingerprint', () => {
    expect(isValidStyleFingerprint(GOOD)).toBe(true);
  });

  it('rejects bad families, palettes, and missing hints', () => {
    expect(isValidStyleFingerprint({ ...GOOD, visualFamily: 'cyberpunk 2077' })).toBe(false);
    expect(isValidStyleFingerprint({ ...GOOD, palette: [] })).toBe(false);
    expect(
      isValidStyleFingerprint({ ...GOOD, palette: ['a', 'b', 'c', 'd', 'e', 'f'] })
    ).toBe(false);
    expect(isValidStyleFingerprint({ ...GOOD, texture: '' })).toBe(false);
    expect(isValidStyleFingerprint({ ...GOOD, typography: '' })).toBe(false);
    expect(isValidStyleFingerprint(null)).toBe(false);
    expect(isValidStyleFingerprint({})).toBe(false);
  });
});

describe('style memory persistence', () => {
  it('records and lists newest-first', async () => {
    const db = client.getDb();
    const user = await makeUser(`style-${crypto.randomUUID()}@test.local`);

    const first = await recordStyleApproval(db, user.id, GOOD);
    expect(first).not.toBeNull();
    const second = await recordStyleApproval(db, user.id, {
      ...GOOD,
      visualFamily: 'minimal soft',
    });
    expect(second).not.toBeNull();

    const listed = await listStyleMemory(db, user.id);
    expect(listed).toHaveLength(2);
    expect(listed[0].fingerprint.visualFamily).toBe('minimal soft');
    expect(listed[1].fingerprint.visualFamily).toBe('retro collage');
  });

  it('rejects invalid fingerprints without inserting', async () => {
    const db = client.getDb();
    const user = await makeUser(`style-${crypto.randomUUID()}@test.local`);
    const stored = await recordStyleApproval(db, user.id, {
      ...GOOD,
      visualFamily: 'not a family',
    });
    expect(stored).toBeNull();
    expect(await listStyleMemory(db, user.id)).toHaveLength(0);
  });

  it(`trims to the last ${STYLE_MEMORY_CAP}`, async () => {
    const db = client.getDb();
    const user = await makeUser(`style-${crypto.randomUUID()}@test.local`);
    for (let i = 0; i < STYLE_MEMORY_CAP + 2; i++) {
      // Tiny delay so created_at ordering is deterministic.
      await new Promise((r) => setTimeout(r, 2));
      await recordStyleApproval(db, user.id, {
        ...GOOD,
        source: `manual:${i}`,
      });
    }
    const listed = await listStyleMemory(db, user.id);
    expect(listed).toHaveLength(STYLE_MEMORY_CAP);
    expect(listed[0].fingerprint.source).toBe(`manual:${STYLE_MEMORY_CAP + 1}`);
  });

  it('removes one and clears all', async () => {
    const db = client.getDb();
    const user = await makeUser(`style-${crypto.randomUUID()}@test.local`);
    const a = await recordStyleApproval(db, user.id, GOOD);
    const b = await recordStyleApproval(db, user.id, {
      ...GOOD,
      visualFamily: 'minimal soft',
    });
    expect(await removeStyleMemory(db, user.id, a!.id)).toBe(true);
    expect(await removeStyleMemory(db, user.id, a!.id)).toBe(false);
    expect(await listStyleMemory(db, user.id)).toHaveLength(1);
    expect(await clearStyleMemory(db, user.id)).toBe(1);
    expect(b).not.toBeNull();
    expect(await listStyleMemory(db, user.id)).toHaveLength(0);
  });

  it('never touches another user\u2019s memory', async () => {
    const db = client.getDb();
    const u1 = await makeUser(`style-${crypto.randomUUID()}@test.local`);
    const u2 = await makeUser(`style-${crypto.randomUUID()}@test.local`);
    const s = await recordStyleApproval(db, u1.id, GOOD);
    expect(await removeStyleMemory(db, u2.id, s!.id)).toBe(false);
    expect(await listStyleMemory(db, u1.id)).toHaveLength(1);
    expect(await clearStyleMemory(db, u2.id)).toBe(0);
  });
});

describe('deriveFingerprintFromProject', () => {
  it('derives from the project brief (palette ref wins)', () => {
    const project = makeProject({
      references: [
        {
          id: 'ref_01',
          kind: 'image',
          name: 'pal.png',
          mime: 'image/png',
          width: 100,
          height: 100,
          sizeBytes: 10,
          role: 'palette',
          roleConfidence: 1,
          roleUserOverride: true,
          palette: ['#111111', '#222222'],
        },
      ],
    });
    const fp = deriveFingerprintFromProject(project);
    expect(fp).not.toBeNull();
    expect(fp!.visualFamily).toBe('retro collage');
    expect(fp!.palette).toEqual(['#111111', '#222222']);
    expect(fp!.texture.length).toBeGreaterThan(0);
    expect(fp!.source).toBe(`project:${project.id}`);
  });

  it('falls back to the playbook recipe palette without a palette ref', () => {
    const fp = deriveFingerprintFromProject(makeProject());
    expect(fp).not.toBeNull();
    expect(fp!.palette.length).toBeGreaterThanOrEqual(2);
  });

  it('returns null when the project has no usable family', () => {
    const project = makeProject({ visualFamily: undefined });
    expect(deriveFingerprintFromProject(project)).toBeNull();
  });
});

describe('topMemoryFamily', () => {
  it('returns the first valid family, skipping invalid ones', () => {
    expect(topMemoryFamily(undefined)).toBeNull();
    expect(topMemoryFamily([])).toBeNull();
    expect(
      topMemoryFamily([
        { ...GOOD, visualFamily: 'bogus' },
        { ...GOOD, visualFamily: 'minimal soft' },
      ])
    ).toBe('minimal soft');
  });
});
