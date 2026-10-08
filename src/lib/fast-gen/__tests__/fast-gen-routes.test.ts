/**
 * Etch fast-gen — route tests for the instant trigger + speculative
 * pre-generation. Runs against in-process PGlite (DATABASE_URL unset),
 * with @/lib/auth mocked to a switchable test user.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({ userId: 'spec-user' as string | null }));

vi.mock('@/lib/auth', () => ({
  requireSession: () =>
    Promise.resolve(
      mockAuth.userId
        ? {
            user: { id: mockAuth.userId, email: `${mockAuth.userId}@vidish.dev` },
            response: null,
          }
        : {
            user: null,
            response: new Response(
              JSON.stringify({ code: 'LOGIN_REQUIRED', error: 'Sign in required' }),
              { status: 401, headers: { 'content-type': 'application/json' } }
            ),
          }
    ),
}));

delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = 'test-admin-token';

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> }
) => Promise<Response>;

const handlers = new Map<string, Handler>();
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');
let specLib: typeof import('../spec');
let triggerLib: typeof import('../trigger');

function req(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function adminHeaders(): Record<string, string> {
  return { 'x-admin-token': 'test-admin-token' };
}

async function json(res: Response): Promise<{ status: number; body: any }> {
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function seedUser(id: string) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id, email: `${id}@vidish.dev`, name: id })
    .onConflictDoNothing();
}

async function genRow(id: string) {
  const db = client.getDb();
  const rows = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, id));
  return rows[0];
}

async function triggersFor(generationId: string) {
  const db = client.getDb();
  return db
    .select()
    .from(schema.generationTriggers)
    .where(eq(schema.generationTriggers.generationId, generationId));
}

beforeAll(async () => {
  const files = [
    'app/api/gen/speculative/route.ts',
    'app/api/free/generate/route.ts',
    'app/api/admin/fulfillment/generations/claim/route.ts',
    'app/api/admin/fulfillment/generations/trigger/route.ts',
    'app/api/me/generations/route.ts',
  ];
  for (const f of files) {
    const mod = (await import(pathToFileURL(resolve(process.cwd(), f)).href)) as Record<
      string,
      unknown
    >;
    for (const m of ['GET', 'POST']) {
      if (typeof mod[m] === 'function') handlers.set(`${m} ${f}`, mod[m] as Handler);
    }
  }
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  specLib = await import('../spec');
  triggerLib = await import('../trigger');
  await client.runMigrations();
  for (const u of ['spec-user', 'spec-user-2', 'spec-user-3', 'spec-user-4', 'spec-user-5']) {
    await seedUser(u);
  }
}, 180_000);

function h(method: 'GET' | 'POST', file: string): Handler {
  const handler = handlers.get(`${method} ${file}`);
  expect(handler, `${method} ${file}`).toBeTypeOf('function');
  return handler!;
}

const SPEC = 'app/api/gen/speculative/route.ts';
const FREE = 'app/api/free/generate/route.ts';
const CLAIM = 'app/api/admin/fulfillment/generations/claim/route.ts';
const TRIGGER = 'app/api/admin/fulfillment/generations/trigger/route.ts';
const ME = 'app/api/me/generations/route.ts';

function specBody(prompt: string, overrides: Record<string, unknown> = {}) {
  const input = {
    prompt,
    quality: 'studio',
    aspectRatio: '1:1',
    mediaType: 'image',
    ...overrides,
  };
  return {
    ...input,
    specHash: specLib.speculativeHash({
      prompt: input.prompt,
      quality: input.quality,
      aspectRatio: input.aspectRatio,
      mediaType: input.mediaType,
    }),
  };
}

describe('POST /api/gen/speculative', () => {
  it('creates a non-charging speculative row and a trigger', async () => {
    mockAuth.userId = 'spec-user';
    const { status, body } = await json(
      await h('POST', SPEC)(
        req('POST', '/api/gen/speculative', specBody('a brass lamp in a studio')),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.status).toBe('queued');
    expect(body.deduped).toBe(false);

    const row = await genRow(body.id);
    expect(row).toMatchObject({
      userId: 'spec-user',
      prompt: 'a brass lamp in a studio',
      tier: 'speculative',
      status: 'queued',
      mediaType: 'image',
      unlocked: false,
    });
    expect(row.specHash).toBe(body.specHash);
    expect(row.specExpiresAt).toBeTruthy();

    // A trigger was written so the worker wakes immediately.
    const triggers = await triggersFor(body.id);
    expect(triggers.length).toBe(1);
    expect(triggers[0].consumedAt).toBeNull();
  });

  it('dedupes: same spec returns the existing row, no duplicate job', async () => {
    mockAuth.userId = 'spec-user-2';
    const payload = specBody('a calm mountain lake at sunrise');
    const first = await json(
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
        params: Promise.resolve({}),
      })
    );
    const second = await json(
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
        params: Promise.resolve({}),
      })
    );
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.deduped).toBe(true);

    const db = client.getDb();
    const rows = await db
      .select()
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.userId, 'spec-user-2'),
          eq(schema.generations.tier, 'speculative')
        )
      );
    expect(rows.length).toBe(1);
  });

  it('400s SPEC_HASH_MISMATCH when the client hash does not match the inputs', async () => {
    mockAuth.userId = 'spec-user-3';
    const payload = specBody('a red balloon');
    payload.specHash = 'deadbeefdeadbeef';
    const { status, body } = await json(
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
        params: Promise.resolve({}),
      })
    );
    expect(status).toBe(400);
    expect(body.code).toBe('SPEC_HASH_MISMATCH');
  });

  it('400s MISSING_REFERENCE for prompts needing a person photo', async () => {
    mockAuth.userId = 'spec-user-3';
    const { status, body } = await json(
      await h('POST', SPEC)(
        req(
          'POST',
          '/api/gen/speculative',
          specBody('the person in the reference photo as an astronaut')
        ),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(400);
    expect(body.code).toBe('MISSING_REFERENCE');
  });

  it('401s when unauthenticated', async () => {
    mockAuth.userId = null;
    const { status } = await json(
      await h('POST', SPEC)(
        req('POST', '/api/gen/speculative', specBody('a brass lamp')),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(401);
    mockAuth.userId = 'spec-user';
  });
});

describe('POST /api/free/generate with specHash', () => {
  it('converts a matching speculative row instead of queueing a new one', async () => {
    mockAuth.userId = 'spec-user-3';
    const payload = specBody('a brass lamp on a wooden table');
    const spec = await json(
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
        params: Promise.resolve({}),
      })
    );
    expect(spec.status).toBe(201);

    const { status, body } = await json(
      await h('POST', FREE)(
        req('POST', '/api/free/generate', {
          prompt: payload.prompt,
          quality: 'studio',
          aspectRatio: '1:1',
          specHash: payload.specHash,
        }),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(200);
    expect(body.id).toBe(spec.body.id);
    expect(body.speculative).toBe(true);

    const row = await genRow(body.id);
    expect(row.tier).toBe('free');
    expect(row.specHash).toBeNull();
    expect(row.specExpiresAt).toBeNull();
  });

  it('falls back to the normal flow on hash mismatch (edited prompt)', async () => {
    mockAuth.userId = 'spec-user-4';
    const payload = specBody('a brass lamp');
    await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
      params: Promise.resolve({}),
    });

    // User edited the prompt after speculation: the server recomputes the
    // hash from the real inputs, it mismatches, and a fresh row is queued.
    const { status, body } = await json(
      await h('POST', FREE)(
        req('POST', '/api/free/generate', {
          prompt: 'a brass lamp at sunset',
          quality: 'studio',
          aspectRatio: '1:1',
          specHash: payload.specHash, // stale hash for the old prompt
        }),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(201);
    const row = await genRow(body.id);
    expect(row.tier).toBe('free');
    expect(row.prompt).toBe('a brass lamp at sunset');
  });

  it('never charges cap for speculative work; conversion charges exactly once', async () => {
    const { countFreeImagesToday } = await import('@/lib/free/access');
    mockAuth.userId = 'spec-user-5';
    // Fire several speculative renders for evolving prompts.
    for (const p of ['cap probe one', 'cap probe two', 'cap probe three']) {
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', specBody(p)), {
        params: Promise.resolve({}),
      });
    }
    // Speculative rows must not consume the free daily cap.
    expect(await countFreeImagesToday('spec-user-5')).toBe(0);

    const payload = specBody('cap probe final');
    const spec = await json(
      await h('POST', SPEC)(req('POST', '/api/gen/speculative', payload), {
        params: Promise.resolve({}),
      })
    );
    expect(spec.status).toBe(201);
    const { status } = await json(
      await h('POST', FREE)(
        req('POST', '/api/free/generate', {
          prompt: payload.prompt,
          quality: 'studio',
          aspectRatio: '1:1',
          specHash: payload.specHash,
        }),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(200);
    // Exactly one cap unit consumed by the conversion.
    expect(await countFreeImagesToday('spec-user-5')).toBe(1);
  });
});

describe('instant trigger endpoints', () => {
  it('GET returns the newest fresh trigger; POST consume retires it', async () => {
    mockAuth.userId = 'spec-user';
    const spec = await json(
      await h('POST', SPEC)(
        req('POST', '/api/gen/speculative', specBody('trigger check probe')),
        { params: Promise.resolve({}) }
      )
    );
    const genId = spec.body.id;

    const got = await json(
      await h('GET', TRIGGER)(
        req('GET', '/api/admin/fulfillment/generations/trigger', undefined, adminHeaders()),
        { params: Promise.resolve({}) }
      )
    );
    expect(got.status).toBe(200);
    expect(got.body.trigger).toBeTruthy();
    expect(got.body.trigger.generation_id).toBe(genId);

    const consumed = await json(
      await h('POST', TRIGGER)(
        req('POST', '/api/admin/fulfillment/generations/trigger', { action: 'consume', id: got.body.trigger.id }, adminHeaders()),
        { params: Promise.resolve({}) }
      )
    );
    expect(consumed.body.ok).toBe(true);

    const triggers = await triggersFor(genId);
    expect(triggers.filter((t) => t.consumedAt === null).length).toBe(0);
  });

  it('401s without the admin token', async () => {
    const { status } = await json(
      await h('GET', TRIGGER)(
        req('GET', '/api/admin/fulfillment/generations/trigger'),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(401);
  });

  it('claim consumes triggers for claimed rows and reaps expired speculative rows', async () => {
    const db = client.getDb();
    // Clear queued rows left by earlier tests so this claim is deterministic.
    await db.execute(
      sql`DELETE FROM generations WHERE status = 'queued'`
    );
    // A real queued row with a trigger.
    const [real] = await db
      .insert(schema.generations)
      .values({
        userId: 'spec-user',
        prompt: 'a real queued image',
        quality: 'studio',
        aspectRatio: '1:1',
        mediaType: 'image',
        tier: 'free',
        status: 'queued',
      })
      .returning({ id: schema.generations.id });
    await triggerLib.queueGenerationTrigger(real.id);

    // An abandoned speculative row past its TTL.
    const [stale] = await db
      .insert(schema.generations)
      .values({
        userId: 'spec-user',
        prompt: 'abandoned typing',
        quality: 'studio',
        aspectRatio: '1:1',
        mediaType: 'image',
        tier: 'speculative',
        status: 'queued',
        specHash: 'abc123',
        specExpiresAt: new Date(Date.now() - 60_000),
      })
      .returning({ id: schema.generations.id });

    const { status, body } = await json(
      await h('POST', CLAIM)(
        req(
          'POST',
          '/api/admin/fulfillment/generations/claim',
          { action: 'claim', limit: 5 },
          adminHeaders()
        ),
        { params: Promise.resolve({}) }
      )
    );
    expect(status).toBe(200);
    expect(body.claimed.map((c: { id: string }) => c.id)).toContain(real.id);

    // Trigger consumed by the claim.
    const triggers = await triggersFor(real.id);
    expect(triggers.every((t) => t.consumedAt !== null)).toBe(true);

    // Stale speculative row reaped.
    expect(await genRow(stale.id)).toBeUndefined();
  });
});

describe('speculative rows stay invisible and un-unlockable', () => {
  it('/api/me/generations excludes tier=speculative rows', async () => {
    mockAuth.userId = 'spec-user-2';
    const { status, body } = await json(
      await h('GET', ME)(req('GET', '/api/me/generations?limit=60'), {
        params: Promise.resolve({}),
      })
    );
    expect(status).toBe(200);
    const items = body.items ?? body.generations ?? [];
    expect(
      items.every((g: { tier: string }) => g.tier !== 'speculative')
    ).toBe(true);
  });

  it('countsTowardCap excludes speculative rows', async () => {
    const { countsTowardCap } = await import('@/lib/free/policy');
    expect(
      countsTowardCap({ status: 'queued', mediaType: 'image', tier: 'speculative' })
    ).toBe(false);
    expect(
      countsTowardCap({ status: 'queued', mediaType: 'image', tier: 'free' })
    ).toBe(true);
  });
});
