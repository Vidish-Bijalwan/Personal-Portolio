/**
 * /me profile + history regression tests.
 *
 * Drives the REAL route handlers against in-process PGlite (auth mocked):
 *
 *  1. GET /api/me/generations returns only the caller's own generations
 *     from the last 30 days (older rows excluded), newest first.
 *  2. Unauthenticated requests get 401 on all three routes.
 *  3. Unlock price comes from the server-side job quote (never the client),
 *     and the unlock endpoint routing matches the watch room.
 *  4. GET /api/me/orders returns only the caller's orders with correct
 *     labels; downloadUrl appears only for unlocked generations.
 *  5. PATCH /api/me/profile updates name/avatar, validates input, and can
 *     never change email/role.
 *  6. Pure-helper unit tests: profile patch validation, price routing,
 *     30-day cutoff, prompt truncation.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({
  userId: null as string | null,
  email: null as string | null,
}));

vi.mock('@/lib/auth', () => ({
  requireSession: () =>
    Promise.resolve(
      mockAuth.userId
        ? {
            user: { id: mockAuth.userId, email: mockAuth.email },
            response: null,
          }
        : {
            user: null,
            response: new Response(
              JSON.stringify({ code: 'LOGIN_REQUIRED' }),
              { status: 401, headers: { 'content-type': 'application/json' } }
            ),
          }
    ),
}));

delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.ADMIN_EMAILS = 'owner@vidish.dev';

type Handler = (req: NextRequest, ctx?: any) => Promise<Response>;

let meProfileGET: Handler;
let meProfilePATCH: Handler;
let meGenerationsGET: Handler;
let meOrdersGET: Handler;
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(async () => {
  const load = async (p: string) =>
    (await import(pathToFileURL(resolve(process.cwd(), p)).href)) as Record<
      string,
      unknown
    >;
  meProfileGET = (await load('app/api/me/profile/route.ts')).GET as Handler;
  meProfilePATCH = (await load('app/api/me/profile/route.ts'))
    .PATCH as Handler;
  meGenerationsGET = (await load('app/api/me/generations/route.ts'))
    .GET as Handler;
  meOrdersGET = (await load('app/api/me/orders/route.ts')).GET as Handler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  await client.runMigrations();
}, 180_000);

function asUser(userId: string | null) {
  mockAuth.userId = userId;
  mockAuth.email = userId ? `${userId}@vidish.dev` : null;
}

function getReq(url: string): NextRequest {
  return new NextRequest(`http://localhost${url}`, { method: 'GET' });
}

function patchReq(url: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function seedUser(id: string, name: string | null = null) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id, email: `${id}@vidish.dev`, name })
    .onConflictDoNothing();
}

async function seedGeneration(opts: {
  userId: string;
  prompt?: string;
  mediaType?: string;
  tier?: string;
  status?: string;
  unlocked?: boolean;
  ageDays?: number;
  durationSeconds?: number | null;
  jobCustomerPrice?: number | null;
}) {
  const db = client.getDb();
  let jobId: string | null = null;
  if (opts.jobCustomerPrice !== undefined && opts.jobCustomerPrice !== null) {
    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        userId: opts.userId,
        state: 'QUOTED',
        prompt: 'price probe',
        task: 'text_to_image',
        customerPrice: opts.jobCustomerPrice,
        product: 'product-photo',
        idempotencyKey: crypto.randomUUID(),
      })
      .returning({ id: schema.generationJobs.id });
    jobId = job.id;
  }
  const createdAt = new Date(Date.now() - (opts.ageDays ?? 0) * DAY_MS);
  const [gen] = await db
    .insert(schema.generations)
    .values({
      userId: opts.userId,
      prompt: opts.prompt ?? 'a test creation',
      mediaType: opts.mediaType ?? 'image',
      tier: opts.tier ?? 'paid',
      status: opts.status ?? 'done',
      unlocked: opts.unlocked ?? false,
      durationSeconds: opts.durationSeconds ?? null,
      jobId,
      createdAt,
    })
    .returning();
  return gen;
}

async function seedOrder(opts: {
  userId: string;
  code: string;
  amountPaise: number;
  status?: string;
  generationId?: string | null;
  purpose?: 'unlock' | 'video' | null;
}) {
  const db = client.getDb();
  const [job] = await db
    .insert(schema.generationJobs)
    .values({
      userId: opts.userId,
      state: 'DRAFT',
      prompt: 'order probe',
      task: 'text_to_image',
      customerPrice: opts.amountPaise,
      idempotencyKey: crypto.randomUUID(),
    })
    .returning({ id: schema.generationJobs.id });
  const [order] = await db
    .insert(schema.orders)
    .values({
      code: opts.code,
      jobId: job.id,
      userId: opts.userId,
      amountPaise: opts.amountPaise,
      status: (opts.status ?? 'PAYMENT_PENDING') as 'PAYMENT_PENDING',
      provider: 'cashfree',
      expiresAt: new Date(Date.now() + 30 * 60_000),
    })
    .returning();
  if (opts.generationId) {
    await db.insert(schema.generationOrders).values({
      orderId: order.id,
      generationId: opts.generationId,
      purpose: opts.purpose ?? 'unlock',
    });
  }
  return order;
}

describe('pure helpers (src/lib/me/profile)', () => {
  it('validates profile patches', async () => {
    const { validateProfilePatch } = await import('@/lib/me/profile');
    expect(validateProfilePatch({ displayName: '  Vidish  ' })).toEqual({
      ok: true,
      displayName: 'Vidish',
    });
    expect(validateProfilePatch({ displayName: '   ' }).ok).toBe(false);
    expect(validateProfilePatch({ displayName: 42 }).ok).toBe(false);
    expect(validateProfilePatch({}).ok).toBe(false);
    expect(validateProfilePatch(null).ok).toBe(false);
    // email/role keys are ignored, never applied
    const r = validateProfilePatch({
      displayName: 'Ok',
      email: 'evil@x.com',
      role: 'admin',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect('email' in r).toBe(false);
      expect('role' in r).toBe(false);
    }
  });

  it('validates avatar uploads', async () => {
    const { validateProfilePatch, MAX_AVATAR_BYTES } = await import(
      '@/lib/me/profile'
    );
    const tiny = `data:image/jpeg;base64,${'a'.repeat(100)}`;
    expect(validateProfilePatch({ avatarUrl: tiny }).ok).toBe(true);
    expect(
      validateProfilePatch({ avatarUrl: 'https://cdn.example.com/a.jpg' }).ok
    ).toBe(true);
    expect(validateProfilePatch({ avatarUrl: null })).toEqual({
      ok: true,
      avatarUrl: null,
    });
    expect(
      validateProfilePatch({ avatarUrl: 'http://evil.com/a.jpg' }).ok
    ).toBe(false);
    expect(
      validateProfilePatch({ avatarUrl: 'data:image/gif;base64,abcd' }).ok
    ).toBe(false);
    const bigB64 = 'a'.repeat(Math.ceil(((MAX_AVATAR_BYTES + 1) * 4) / 3));
    expect(
      validateProfilePatch({ avatarUrl: `data:image/png;base64,${bigB64}` }).ok
    ).toBe(false);
  });

  it('computes server-side unlock prices', async () => {
    const {
      unlockPricePaiseForGeneration,
      unlockEndpointForGeneration,
      orderItemLabel,
      retentionCutoff,
      RETENTION_DAYS,
      promptPreview,
    } = await import('@/lib/me/profile');
    const { priceOf } = await import('@/lib/pricing/catalog');
    const { videoClipPricePaise } = await import('@/lib/pricing/engine');

    // paid image: job quote wins
    expect(
      unlockPricePaiseForGeneration({
        tier: 'paid',
        mediaType: 'image',
        status: 'done',
        unlocked: false,
        durationSeconds: null,
        jobCustomerPrice: 2900,
      })
    ).toBe(2900);
    // paid image: catalog fallback
    expect(
      unlockPricePaiseForGeneration({
        tier: 'paid',
        mediaType: 'image',
        status: 'done',
        unlocked: false,
        durationSeconds: null,
        jobCustomerPrice: null,
      })
    ).toBe(priceOf('single-image'));
    // free image
    expect(
      unlockPricePaiseForGeneration({
        tier: 'free',
        mediaType: 'image',
        status: 'done',
        unlocked: false,
        durationSeconds: null,
        jobCustomerPrice: null,
      })
    ).toBeGreaterThan(0);
    // paid video: duration-priced
    expect(
      unlockPricePaiseForGeneration({
        tier: 'paid',
        mediaType: 'video',
        status: 'done',
        unlocked: false,
        durationSeconds: 30,
        jobCustomerPrice: null,
      })
    ).toBe(videoClipPricePaise(30));
    // not unlockable states
    for (const g of [
      { status: 'queued', unlocked: false },
      { status: 'done', unlocked: true },
      { status: 'failed', unlocked: false },
    ]) {
      expect(
        unlockPricePaiseForGeneration({
          tier: 'paid',
          mediaType: 'image',
          durationSeconds: null,
          jobCustomerPrice: 1500,
          ...g,
        })
      ).toBeNull();
    }

    // endpoint routing mirrors the watch room
    expect(
      unlockEndpointForGeneration({
        id: 'g1',
        tier: 'paid',
        mediaType: 'image',
        status: 'done',
        unlocked: false,
      })?.url
    ).toBe('/api/generation/unlock');
    expect(
      unlockEndpointForGeneration({
        id: 'g2',
        tier: 'free',
        mediaType: 'image',
        status: 'done',
        unlocked: false,
      })?.url
    ).toBe('/api/gen/g2/unlock');
    expect(
      unlockEndpointForGeneration({
        id: 'g3',
        tier: 'paid',
        mediaType: 'video',
        status: 'done',
        unlocked: false,
      })?.url
    ).toBe('/api/gen/g3/unlock');
    expect(
      unlockEndpointForGeneration({
        id: 'g4',
        tier: 'paid',
        mediaType: 'image',
        status: 'done',
        unlocked: true,
      })
    ).toBeNull();

    expect(orderItemLabel('unlock', 'image')).toBe('Image unlock');
    expect(orderItemLabel('video', 'video')).toBe('Video unlock');
    expect(orderItemLabel(null, null)).toBe('Etch order');

    expect(RETENTION_DAYS).toBe(30);
    const now = new Date('2026-10-08T00:00:00Z');
    expect(retentionCutoff(now).toISOString()).toBe('2026-09-08T00:00:00.000Z');

    expect(promptPreview('short prompt')).toBe('short prompt');
    expect(promptPreview('x'.repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

describe('GET /api/me/generations', () => {
  it('returns only the caller\u2019s last-30-day generations, newest first', async () => {
    await seedUser('me-gen-a');
    await seedUser('me-gen-b');
    const locked = await seedGeneration({
      userId: 'me-gen-a',
      prompt: 'locked paid image',
      jobCustomerPrice: 2900,
      ageDays: 2,
    });
    await seedGeneration({
      userId: 'me-gen-a',
      prompt: 'unlocked free image',
      tier: 'free',
      unlocked: true,
      ageDays: 5,
    });
    await seedGeneration({
      userId: 'me-gen-a',
      prompt: 'too old to show',
      ageDays: 31,
    });
    await seedGeneration({
      userId: 'me-gen-b',
      prompt: 'someone else\u2019s image',
      jobCustomerPrice: 1500,
    });

    asUser('me-gen-a');
    const res = await meGenerationsGET(getReq('/api/me/generations'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.retentionDays).toBe(30);
    const prompts = body.items.map((i: { prompt: string }) => i.prompt);
    expect(prompts).toContain('locked paid image');
    expect(prompts).toContain('unlocked free image');
    expect(prompts).not.toContain('too old to show');
    expect(prompts).not.toContain('someone else\u2019s image');
    // newest first
    expect(
      new Date(body.items[0].createdAt).getTime()
    ).toBeGreaterThanOrEqual(
      new Date(body.items[body.items.length - 1].createdAt).getTime()
    );

    const lockedItem = body.items.find(
      (i: { id: string }) => i.id === locked.id
    );
    expect(lockedItem.pricePaise).toBe(2900); // server-side job quote
    expect(lockedItem.thumbnailUrl).toBe(`/api/gen/${locked.id}/preview`);
    expect(lockedItem.downloadUrl).toBeNull();
    expect(lockedItem.unlock.url).toBe('/api/generation/unlock');

    const unlockedItem = body.items.find(
      (i: { prompt: string }) => i.prompt === 'unlocked free image'
    );
    expect(unlockedItem.pricePaise).toBeNull();
    expect(unlockedItem.downloadUrl).toBe(
      `/api/gen/${unlockedItem.id}/clean`
    );
    expect(unlockedItem.unlock).toBeNull();
  });

  it('isolates users and rejects anonymous callers', async () => {
    asUser('me-gen-b');
    const res = await meGenerationsGET(getReq('/api/me/generations'));
    const body = await res.json();
    expect(
      body.items.every((i: { prompt: string }) =>
        i.prompt.includes('someone else')
      )
    ).toBe(true);

    asUser(null);
    const anon = await meGenerationsGET(getReq('/api/me/generations'));
    expect(anon.status).toBe(401);
  });
});

describe('GET /api/me/orders', () => {
  it('returns only the caller\u2019s orders with download links for unlocked items', async () => {
    await seedUser('me-ord-a');
    await seedUser('me-ord-b');
    const unlockedGen = await seedGeneration({
      userId: 'me-ord-a',
      unlocked: true,
    });
    const lockedGen = await seedGeneration({ userId: 'me-ord-a' });
    await seedOrder({
      userId: 'me-ord-a',
      code: 'VLSH-PROF1A',
      amountPaise: 2900,
      status: 'PAYMENT_VERIFIED',
      generationId: unlockedGen.id,
      purpose: 'unlock',
    });
    await seedOrder({
      userId: 'me-ord-a',
      code: 'VLSH-PROF2B',
      amountPaise: 1500,
      status: 'PAYMENT_PENDING',
      generationId: lockedGen.id,
      purpose: 'unlock',
    });
    await seedOrder({
      userId: 'me-ord-b',
      code: 'VLSH-PROF3C',
      amountPaise: 4500,
      status: 'PAYMENT_VERIFIED',
    });

    asUser('me-ord-a');
    const res = await meOrdersGET(getReq('/api/me/orders'));
    expect(res.status).toBe(200);
    const body = await res.json();
    const codes = body.items.map((i: { code: string }) => i.code);
    expect(codes).toContain('VLSH-PROF1A');
    expect(codes).toContain('VLSH-PROF2B');
    expect(codes).not.toContain('VLSH-PROF3C');

    const paid = body.items.find(
      (i: { code: string }) => i.code === 'VLSH-PROF1A'
    );
    expect(paid.itemLabel).toBe('Image unlock');
    expect(paid.status).toBe('PAYMENT_VERIFIED');
    expect(paid.downloadUrl).toBe(`/api/gen/${unlockedGen.id}/clean`);

    const pending = body.items.find(
      (i: { code: string }) => i.code === 'VLSH-PROF2B'
    );
    expect(pending.downloadUrl).toBeNull(); // locked: no download leak

    asUser(null);
    expect((await meOrdersGET(getReq('/api/me/orders'))).status).toBe(401);
  });
});

describe('/api/me/profile', () => {
  it('reads and updates only the caller\u2019s profile', async () => {
    await seedUser('me-prof-a', 'Old Name');
    await seedUser('me-prof-b', 'Other');

    asUser('me-prof-a');
    const getRes = await meProfileGET(getReq('/api/me/profile'));
    expect(getRes.status).toBe(200);
    expect((await getRes.json()).displayName).toBe('Old Name');

    const patchRes = await meProfilePATCH(
      patchReq('/api/me/profile', { displayName: '  New Name  ' })
    );
    expect(patchRes.status).toBe(200);
    expect((await patchRes.json()).displayName).toBe('New Name');

    // email can never be changed through this route
    await meProfilePATCH(
      patchReq('/api/me/profile', {
        displayName: 'New Name',
        email: 'hacker@evil.com',
      })
    );
    const db = client.getDb();
    const [row] = await db
      .select({ email: schema.users.email, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, 'me-prof-a'))
      .limit(1);
    expect(row.email).toBe('me-prof-a@vidish.dev');
    expect(row.name).toBe('New Name');

    // other user's profile untouched
    asUser('me-prof-b');
    await meProfilePATCH(
      patchReq('/api/me/profile', { displayName: 'Other Updated' })
    );
    const [rowA] = await db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, 'me-prof-a'))
      .limit(1);
    expect(rowA.name).toBe('New Name');

    // invalid input rejected
    asUser('me-prof-a');
    expect(
      (
        await meProfilePATCH(
          patchReq('/api/me/profile', { displayName: '   ' })
        )
      ).status
    ).toBe(400);
    expect(
      (
        await meProfilePATCH(
          patchReq('/api/me/profile', {
            avatarUrl: 'data:image/gif;base64,abcd',
          })
        )
      ).status
    ).toBe(400);

    asUser(null);
    expect((await meProfileGET(getReq('/api/me/profile'))).status).toBe(401);
    expect(
      (
        await meProfilePATCH(
          patchReq('/api/me/profile', { displayName: 'x' })
        )
      ).status
    ).toBe(401);
  });
});
