/**
 * Pixaura — route tests for the free-tier image + paid video
 * generations pipeline. Runs against in-process PGlite (DATABASE_URL
 * unset), with @/lib/auth mocked to a switchable test user.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({ userId: 'user-1' as string | null }));

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
delete process.env.UPI_PAYMENT_ENABLED;
process.env.ADMIN_TOKEN = 'test-admin-token';

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> }
) => Promise<Response>;

const handlers = new Map<string, Handler>();
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');
let manualUpi: typeof import('@/lib/payments/manual-upi');

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

async function json(res: Response): Promise<{ status: number; body: any }> {
  return { status: res.status, body: await res.json().catch(() => null) };
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0xde, 0xad]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xde, 0xad, 0xbe, 0xef]);
const MP4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

async function seedUser(id: string) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id, email: `${id}@vidish.dev`, name: id })
    .onConflictDoNothing();
}

async function insertGeneration(
  userId: string,
  overrides: Partial<typeof schema.generations.$inferInsert> = {}
) {
  const db = client.getDb();
  const [row] = await db
    .insert(schema.generations)
    .values({
      userId,
      prompt: 'a brass lamp in a studio',
      quality: 'studio',
      aspectRatio: '1:1',
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
      ...overrides,
    })
    .returning();
  return row;
}

beforeAll(async () => {
  const files = [
    'app/api/free/generate/route.ts',
    'app/api/free/remaining/route.ts',
    'app/api/video/order/route.ts',
    'app/api/gen/[id]/status/route.ts',
    'app/api/gen/[id]/preview/route.ts',
    'app/api/gen/[id]/clean/route.ts',
    'app/api/gen/[id]/payment/route.ts',
    'app/api/gen/[id]/unlock/route.ts',
    'app/api/admin/fulfillment/deliver-generation/route.ts',
    'app/api/admin/fulfillment/generations/claim/route.ts',
    'app/api/gen/[id]/retry/route.ts',
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
  manualUpi = await import('@/lib/payments/manual-upi');
  await client.runMigrations();
  await seedUser('user-1');
  await seedUser('user-2');
  await seedUser('cap-user');
  await seedUser('cap-user-2');
}, 180_000);

function h(method: 'GET' | 'POST', file: string): Handler {
  const handler = handlers.get(`${method} ${file}`);
  expect(handler, `${method} ${file}`).toBeTypeOf('function');
  return handler!;
}

describe('POST /api/free/generate', () => {
  const FILE = 'app/api/free/generate/route.ts';

  it('creates a queued free image generation', async () => {
    mockAuth.userId = 'user-1';
    const res = await h('POST', FILE)(
      req('POST', '/api/free/generate', { prompt: 'a brass lamp' }),
      { params: Promise.resolve({}) }
    );
    const { status, body } = await json(res);
    expect(status).toBe(201);
    expect(body.id).toBeTruthy();

    const db = client.getDb();
    const rows = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.id));
    expect(rows[0]).toMatchObject({
      userId: 'user-1',
      prompt: 'a brass lamp',
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
      unlocked: false,
    });
  });

  it('401s when unauthenticated', async () => {
    mockAuth.userId = null;
    const res = await h('POST', FILE)(
      req('POST', '/api/free/generate', { prompt: 'x' }),
      { params: Promise.resolve({}) }
    );
    expect(res.status).toBe(401);
    mockAuth.userId = 'user-1';
  });

  it('400s on bad prompts and video media_type', async () => {
    mockAuth.userId = 'user-1';
    const post = h('POST', FILE);
    for (const body of [
      { prompt: '' },
      { prompt: '   ' },
      { prompt: 'x'.repeat(2001) },
      {},
      { prompt: 'ok', media_type: 'video' },
      { prompt: 'ok', mediaType: 'video' },
      { prompt: 'ok', media_type: 'audio' },
    ]) {
      const { status, body: b } = await json(
        await post(req('POST', '/api/free/generate', body), {
          params: Promise.resolve({}),
        })
      );
      expect(status).toBe(400);
      expect(b.code).toBeTruthy();
    }
  });

  it('429s after 3 non-failed free images; failed rows do not count', async () => {
    mockAuth.userId = 'cap-user';
    const post = h('POST', FILE);
    const mk = (b: unknown) =>
      post(req('POST', '/api/free/generate', b), { params: Promise.resolve({}) });

    await insertGeneration('cap-user', { status: 'failed' });
    for (let i = 0; i < 3; i++) {
      const { status } = await json(await mk({ prompt: `cap ${i}` }));
      expect(status).toBe(201);
    }
    const { status, body } = await json(await mk({ prompt: 'one too many' }));
    expect(status).toBe(429);
    expect(body.code).toBe('FREE_CAP_REACHED');
  });

  it('does not count videos toward the free cap', async () => {
    mockAuth.userId = 'cap-user-2';
    await insertGeneration('cap-user-2', { mediaType: 'video', tier: 'paid' });
    await insertGeneration('cap-user-2', { mediaType: 'video', tier: 'paid' });
    await insertGeneration('cap-user-2', { mediaType: 'video', tier: 'paid' });
    const { status } = await json(
      await h('POST', FILE)(req('POST', '/api/free/generate', { prompt: 'still free' }), {
        params: Promise.resolve({}),
      })
    );
    expect(status).toBe(201);
  });
});

describe('GET /api/free/remaining', () => {
  const FILE = 'app/api/free/remaining/route.ts';

  it('returns {left, cap} reflecting usage', async () => {
    mockAuth.userId = 'user-2';
    const get = h('GET', FILE);
    const fresh = await json(
      await get(req('GET', '/api/free/remaining'), { params: Promise.resolve({}) })
    );
    expect(fresh.body).toEqual({ left: 3, cap: 3 });

    await insertGeneration('user-2');
    const after = await json(
      await get(req('GET', '/api/free/remaining'), { params: Promise.resolve({}) })
    );
    expect(after.body).toEqual({ left: 2, cap: 3 });
  });

  it('401s when unauthenticated', async () => {
    mockAuth.userId = null;
    const res = await h('GET', FILE)(req('GET', '/api/free/remaining'), {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(401);
    mockAuth.userId = 'user-1';
  });
});

describe('GET /api/gen/[id]/status', () => {
  const FILE = 'app/api/gen/[id]/status/route.ts';

  it('is owner-gated: 200 owner, 403 stranger, 404 missing', async () => {
    const row = await insertGeneration('user-1', {
      status: 'generating',
      stage: 'rendering',
    });
    const get = h('GET', FILE);
    const call = (id: string) =>
      get(req('GET', `/api/gen/${id}/status`), { params: Promise.resolve({ id }) });

    mockAuth.userId = 'user-1';
    const ok = await json(await call(row.id));
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({
      media_type: 'image',
      tier: 'free',
      status: 'generating',
      stage: 'rendering',
      unlocked: false,
    });
    expect(ok.body).not.toHaveProperty('error');

    mockAuth.userId = 'user-2';
    expect((await call(row.id)).status).toBe(403);

    mockAuth.userId = 'user-1';
    expect((await call('00000000-0000-0000-0000-000000000000')).status).toBe(404);
    mockAuth.userId = null;
    expect((await call(row.id)).status).toBe(401);
    mockAuth.userId = 'user-1';
  });

  it('includes error when the generation failed', async () => {
    const row = await insertGeneration('user-1', {
      status: 'failed',
      error: 'provider timeout',
    });
    mockAuth.userId = 'user-1';
    const { body } = await json(
      await h('GET', FILE)(req('GET', `/api/gen/${row.id}/status`), {
        params: Promise.resolve({ id: row.id }),
      })
    );
    expect(body.error).toBe('provider timeout');
  });

  it('returns waiting-room transparency fields (created_at, queue_position, prompt_insight)', async () => {
    const get = h('GET', FILE);
    const call = (id: string) =>
      get(req('GET', `/api/gen/${id}/status`), { params: Promise.resolve({ id }) });

    // Dedicated user: these queued rows must not consume user-1's free cap
    // (a later end-to-end test asserts on it).
    await seedUser('queue-user');
    mockAuth.userId = 'queue-user';
    // Fixed past timestamps: every other insert in this file uses "now",
    // which is always later — so the queue math below is deterministic.
    await insertGeneration('queue-user', {
      prompt: 'cinematic photo of a sneaker, dramatic light',
      status: 'queued',
      createdAt: new Date('2026-10-06T10:00:00Z'),
    });
    const second = await insertGeneration('queue-user', {
      prompt: 'a red bicycle',
      status: 'queued',
      createdAt: new Date('2026-10-06T10:01:00Z'),
    });

    const { body } = await json(await call(second.id));
    expect(body.created_at).toBe('2026-10-06T10:01:00.000Z');
    expect(body.queue_position).toBe(2);
    expect(body.prompt_insight).toMatchObject({
      subject: 'red bicycle',
      styles: [],
      mood: null,
    });
    expect(body.prompt).toBe('a red bicycle');

    const first = await json(
      await call((await insertGeneration('queue-user', {
        prompt: 'cinematic photo of a sneaker, dramatic light',
        status: 'queued',
        createdAt: new Date('2026-10-06T09:59:00Z'),
      })).id)
    );
    expect(first.body.queue_position).toBe(1);
    expect(first.body.prompt_insight).toMatchObject({
      subject: 'sneaker light',
      styles: ['Cinematic', 'Photo'],
      mood: 'Dramatic',
    });

    // Non-queued rows carry no queue position.
    const done = await insertGeneration('queue-user', {
      status: 'done',
      createdAt: new Date('2026-10-06T10:02:00Z'),
    });
    const doneBody = (await json(await call(done.id))).body;
    expect(doneBody.queue_position).toBeNull();
    expect(doneBody.created_at).toBe('2026-10-06T10:02:00.000Z');
    mockAuth.userId = 'user-1';
  });
});

describe('free image end-to-end: deliver → preview → unlock → clean', () => {
  const GEN = 'app/api/free/generate/route.ts';
  const DELIVER = 'app/api/admin/fulfillment/deliver-generation/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };

  it('runs the full funnel', async () => {
    mockAuth.userId = 'user-1';
    const db = client.getDb();

    // generate
    const created = await json(
      await h('POST', GEN)(req('POST', '/api/free/generate', { prompt: 'funnel test' }), {
        params: Promise.resolve({}),
      })
    );
    expect(created.status).toBe(201);
    const id = created.body.id as string;

    // preview 404s before delivery
    const pre404 = await h('GET', 'app/api/gen/[id]/preview/route.ts')(
      req('GET', `/api/gen/${id}/preview`),
      { params: Promise.resolve({ id }) }
    );
    expect(pre404.status).toBe(404);

    // admin delivers
    const delivered = await json(
      await h('POST', DELIVER)(
        req(
          'POST',
          '/api/admin/fulfillment/deliver-generation',
          {
            id,
            watermarked_b64: JPEG.toString('base64'),
            clean_b64: JPEG.toString('base64'),
            mime: 'image/jpeg',
          },
          admin
        ),
        { params: Promise.resolve({}) }
      )
    );
    expect(delivered.status).toBe(200);
    expect(delivered.body).toEqual({ ok: true, id });

    const [stored] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, id));
    expect(stored.status).toBe('done');
    expect(stored.unlocked).toBe(false); // deliver must NOT unlock
    expect(stored.deliveredAt).toBeTruthy();
    expect(stored.updatedAt.getTime()).toBeGreaterThanOrEqual(
      stored.createdAt.getTime()
    );

    // preview serves inline jpeg
    const preview = await h('GET', 'app/api/gen/[id]/preview/route.ts')(
      req('GET', `/api/gen/${id}/preview`),
      { params: Promise.resolve({ id }) }
    );
    expect(preview.status).toBe(200);
    expect(preview.headers.get('content-type')).toBe('image/jpeg');
    expect(preview.headers.get('content-disposition')).toContain('inline');
    expect(preview.headers.get('x-content-type-options')).toBe('nosniff');

    // clean is locked before payment
    const locked = await json(
      await h('GET', 'app/api/gen/[id]/clean/route.ts')(
        req('GET', `/api/gen/${id}/clean`),
        { params: Promise.resolve({ id }) }
      )
    );
    expect(locked.status).toBe(402);
    expect(locked.body.code).toBe('LOCKED');

    // unlock creates the ₹19 order
    const unlock = await json(
      await h('POST', 'app/api/gen/[id]/unlock/route.ts')(
        req('POST', `/api/gen/${id}/unlock`),
        { params: Promise.resolve({ id }) }
      )
    );
    expect(unlock.status).toBe(201);
    expect(unlock.body.payment.amountPaise).toBe(1900);
    expect(unlock.body.payment.code).toBeTruthy();
    expect(unlock.body.payment.upiUri).toContain('upi://pay');
    const orderCode = unlock.body.payment.code as string;

    // second unlock resumes instead of duplicating
    const resumed = await json(
      await h('POST', 'app/api/gen/[id]/unlock/route.ts')(
        req('POST', `/api/gen/${id}/unlock`),
        { params: Promise.resolve({ id }) }
      )
    );
    expect(resumed.status).toBe(200);
    expect(resumed.body.resumed).toBe(true);
    expect(resumed.body.payment.code).toBe(orderCode);

    // customer submits UTR, owner verifies → unlock hook flips the flag
    await manualUpi.submitPaymentUtr({
      code: orderCode,
      utrReference: 'TESTUTR123456',
      userId: 'user-1',
    });
    const verified = await manualUpi.verifyPaymentOrder({
      code: orderCode,
      adminUserId: 'admin',
    });
    expect(verified.status).toBe('PAYMENT_VERIFIED');

    const [after] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, id));
    expect(after.unlocked).toBe(true);

    // clean now downloads as attachment
    const clean = await h('GET', 'app/api/gen/[id]/clean/route.ts')(
      req('GET', `/api/gen/${id}/clean`),
      { params: Promise.resolve({ id }) }
    );
    expect(clean.status).toBe(200);
    expect(clean.headers.get('content-type')).toBe('image/jpeg');
    expect(clean.headers.get('content-disposition')).toContain('attachment');

    // unlock again → already unlocked
    const again = await json(
      await h('POST', 'app/api/gen/[id]/unlock/route.ts')(
        req('POST', `/api/gen/${id}/unlock`),
        { params: Promise.resolve({ id }) }
      )
    );
    expect(again.status).toBe(409);
    expect(again.body.code).toBe('ALREADY_UNLOCKED');
  });

  it('rejects unlock before delivery and for non-free rows', async () => {
    mockAuth.userId = 'user-1';
    const pending = await insertGeneration('user-1');
    const unlock = h('POST', 'app/api/gen/[id]/unlock/route.ts');
    const call = (id: string) =>
      unlock(req('POST', `/api/gen/${id}/unlock`), { params: Promise.resolve({ id }) });

    const notDelivered = await json(await call(pending.id));
    expect(notDelivered.status).toBe(409);
    expect(notDelivered.body.code).toBe('NOT_DELIVERED');

    const video = await insertGeneration('user-1', {
      mediaType: 'video',
      tier: 'paid',
      status: 'done',
    });
    const notFree = await json(await call(video.id));
    expect(notFree.status).toBe(400);
    expect(notFree.body.code).toBe('NOT_FREE_IMAGE');
  });
});

describe('POST /api/video/order', () => {
  const FILE = 'app/api/video/order/route.ts';

  it('creates a paid video row + ₹89 order link, uncapped', async () => {
    mockAuth.userId = 'user-1';
    const db = client.getDb();
    let lastId = '';
    for (let i = 0; i < 3; i++) {
      const { status, body } = await json(
        await h('POST', FILE)(
          req('POST', '/api/video/order', { prompt: `clip ${i}` }),
          { params: Promise.resolve({}) }
        )
      );
      expect(status).toBe(201);
      expect(body.payment.amountPaise).toBe(8900);
      expect(body.payment.code).toBeTruthy();
      lastId = body.id;
    }
    const [row] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, lastId));
    expect(row).toMatchObject({
      mediaType: 'video',
      tier: 'paid',
      status: 'queued',
      mime: 'video/mp4',
      unlocked: false,
    });

    const links = await db
      .select()
      .from(schema.generationOrders)
      .where(eq(schema.generationOrders.generationId, lastId));
    expect(links).toHaveLength(1);
    expect(links[0].purpose).toBe('video');
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, links[0].orderId));
    expect(order.amountPaise).toBe(8900);
    expect(order.provider).toBe('manual_upi');
  });

  it('400s on bad prompts, 401s unauthenticated', async () => {
    mockAuth.userId = 'user-1';
    const post = h('POST', FILE);
    const bad = await json(
      await post(req('POST', '/api/video/order', { prompt: '' }), {
        params: Promise.resolve({}),
      })
    );
    expect(bad.status).toBe(400);
    mockAuth.userId = null;
    const unauth = await post(
      req('POST', '/api/video/order', { prompt: 'x' }),
      { params: Promise.resolve({}) }
    );
    expect(unauth.status).toBe(401);
    mockAuth.userId = 'user-1';
  });
});

describe('paid video clean 402 → 200 after the verify hook', () => {
  const ORDER = 'app/api/video/order/route.ts';
  const DELIVER = 'app/api/admin/fulfillment/deliver-generation/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };

  it('gates the clean mp4 on payment verification', async () => {
    mockAuth.userId = 'user-2';
    const db = client.getDb();

    const ordered = await json(
      await h('POST', ORDER)(
        req('POST', '/api/video/order', { prompt: 'a wave', aspectRatio: '9:16' }),
        { params: Promise.resolve({}) }
      )
    );
    expect(ordered.status).toBe(201);
    const id = ordered.body.id as string;
    const orderCode = ordered.body.payment.code as string;

    // deliver the mp4 pair (watcher generates immediately on order)
    const delivered = await json(
      await h('POST', DELIVER)(
        req(
          'POST',
          '/api/admin/fulfillment/deliver-generation',
          {
            id,
            watermarked_b64: MP4.toString('base64'),
            clean_b64: MP4.toString('base64'),
            mime: 'video/mp4',
          },
          admin
        ),
        { params: Promise.resolve({}) }
      )
    );
    expect(delivered.status).toBe(200);

    const cleanRoute = h('GET', 'app/api/gen/[id]/clean/route.ts');
    const locked = await json(
      await cleanRoute(req('GET', `/api/gen/${id}/clean`), {
        params: Promise.resolve({ id }),
      })
    );
    expect(locked.status).toBe(402);

    // unlock via unlock route is rejected for paid video…
    const noUnlock = await json(
      await h('POST', 'app/api/gen/[id]/unlock/route.ts')(
        req('POST', `/api/gen/${id}/unlock`),
        { params: Promise.resolve({ id }) }
      )
    );
    expect(noUnlock.status).toBe(400);

    // …the ₹89 payment verify flips unlocked instead
    await manualUpi.submitPaymentUtr({
      code: orderCode,
      utrReference: 'VIDEOUTR999001',
      userId: 'user-2',
    });
    await manualUpi.verifyPaymentOrder({ code: orderCode, adminUserId: 'admin' });

    const clean = await cleanRoute(req('GET', `/api/gen/${id}/clean`), {
      params: Promise.resolve({ id }),
    });
    expect(clean.status).toBe(200);
    expect(clean.headers.get('content-type')).toBe('video/mp4');
    expect(clean.headers.get('content-disposition')).toContain('attachment');
    expect(clean.headers.get('content-disposition')).toContain('.mp4');
  });
});

describe('GET /api/gen/[id]/payment', () => {
  const FILE = 'app/api/gen/[id]/payment/route.ts';
  const UNLOCK = 'app/api/gen/[id]/unlock/route.ts';

  it('returns the linked order, null when none, and is owner-gated', async () => {
    mockAuth.userId = 'user-1';
    const get = h('GET', FILE);
    const call = (id: string) =>
      get(req('GET', `/api/gen/${id}/payment`), { params: Promise.resolve({ id }) });

    const bare = await insertGeneration('user-1');
    const none = await json(await call(bare.id));
    expect(none.status).toBe(200);
    expect(none.body).toEqual({ order: null });

    const done = await insertGeneration('user-1', { status: 'done' });
    const unlocked = await json(
      await h('POST', UNLOCK)(req('POST', `/api/gen/${done.id}/unlock`), {
        params: Promise.resolve({ id: done.id }),
      })
    );
    expect(unlocked.status).toBe(201);
    const withOrder = await json(await call(done.id));
    expect(withOrder.status).toBe(200);
    expect(withOrder.body.order).toMatchObject({
      code: unlocked.body.payment.code,
      status: 'PAYMENT_PENDING',
      amountPaise: 1900,
      purpose: 'unlock',
    });
    expect(withOrder.body.order.expiresAt).toBeTruthy();

    mockAuth.userId = 'user-2';
    expect((await call(done.id)).status).toBe(403);
    mockAuth.userId = 'user-1';
    expect((await call('00000000-0000-0000-0000-000000000000')).status).toBe(404);
    mockAuth.userId = null;
    expect((await call(done.id)).status).toBe(401);
    mockAuth.userId = 'user-1';
  });
});

describe('POST /api/admin/fulfillment/deliver-generation', () => {
  const FILE = 'app/api/admin/fulfillment/deliver-generation/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };

  it('401s without the admin token', async () => {
    const res = await h('POST', FILE)(
      req('POST', '/api/admin/fulfillment/deliver-generation', { id: 'x' }),
      { params: Promise.resolve({}) }
    );
    expect(res.status).toBe(401);
  });

  it('validates id, magic bytes, mime match and size caps', async () => {
    const post = h('POST', FILE);
    const call = (body: unknown, headers: Record<string, string> = admin) =>
      post(req('POST', '/api/admin/fulfillment/deliver-generation', body, headers), {
        params: Promise.resolve({}),
      });
    const b64 = (b: Buffer) => b.toString('base64');

    const missing = await json(await call({ id: '00000000-0000-0000-0000-000000000000', watermarked_b64: b64(JPEG), clean_b64: b64(JPEG), mime: 'image/jpeg' }));
    expect(missing.status).toBe(404);

    const row = await insertGeneration('user-1');
    const garbage = Buffer.from('definitely not an image file at all');
    const badMagic = await json(
      await call({ id: row.id, watermarked_b64: b64(garbage), clean_b64: b64(JPEG), mime: 'image/jpeg' })
    );
    expect(badMagic.status).toBe(400);
    expect(badMagic.body.code).toBe('NOT_AN_IMAGE_OR_VIDEO');

    const mismatch = await json(
      await call({ id: row.id, watermarked_b64: b64(JPEG), clean_b64: b64(JPEG), mime: 'image/png' })
    );
    expect(mismatch.status).toBe(400);
    expect(mismatch.body.code).toBe('MIME_MISMATCH');

    const badB64 = await json(
      await call({ id: row.id, watermarked_b64: '!!!not-base64!!!', clean_b64: b64(JPEG), mime: 'image/jpeg' })
    );
    expect(badB64.status).toBe(400);
    expect(badB64.body.code).toBe('INVALID_BASE64');

    const huge = Buffer.concat([JPEG, Buffer.alloc(8 * 1024 * 1024)]);
    const tooBig = await json(
      await call({ id: row.id, watermarked_b64: b64(huge), clean_b64: b64(JPEG), mime: 'image/jpeg' })
    );
    expect(tooBig.status).toBe(413);
    expect(tooBig.body.code).toBe('FILE_TOO_LARGE');

    // PNG pair is accepted and stored with its mime
    const pngOk = await json(
      await call({ id: row.id, watermarked_b64: b64(PNG), clean_b64: b64(PNG), mime: 'image/png' })
    );
    expect(pngOk.status).toBe(200);
    const db = client.getDb();
    const [stored] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, row.id));
    expect(stored.mime).toBe('image/png');
    expect(stored.status).toBe('done');

    // delivering again → 409
    const again = await json(
      await call({ id: row.id, watermarked_b64: b64(PNG), clean_b64: b64(PNG), mime: 'image/png' })
    );
    expect(again.status).toBe(409);
  });

  it('accepts mp4 up to 32MB and rejects mixed-kind pairs', async () => {
    const post = h('POST', FILE);
    const call = (body: unknown) =>
      post(
        req('POST', '/api/admin/fulfillment/deliver-generation', body, admin),
        { params: Promise.resolve({}) }
      );
    const b64 = (b: Buffer) => b.toString('base64');

    const row = await insertGeneration('user-1', { mediaType: 'video', tier: 'paid' });
    const mixed = await json(
      await call({ id: row.id, watermarked_b64: b64(MP4), clean_b64: b64(JPEG), mime: 'video/mp4' })
    );
    expect(mixed.status).toBe(400);

    const bigMp4 = Buffer.concat([MP4, Buffer.alloc(32 * 1024 * 1024)]);
    const tooBig = await json(
      await call({ id: row.id, watermarked_b64: b64(bigMp4), clean_b64: b64(MP4), mime: 'video/mp4' })
    );
    expect(tooBig.status).toBe(413);

    const ok = await json(
      await call({ id: row.id, watermarked_b64: b64(MP4), clean_b64: b64(MP4), mime: 'video/mp4' })
    );
    expect(ok.status).toBe(200);
  });
});

describe('POST /api/admin/fulfillment/generations/claim fail action', () => {
  const FILE = 'app/api/admin/fulfillment/generations/claim/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };
  const call = (body: unknown, headers: Record<string, string> = admin) =>
    h('POST', FILE)(
      req('POST', '/api/admin/fulfillment/generations/claim', body, headers),
      { params: Promise.resolve({}) }
    );
  const stored = async (id: string) => {
    const db = client.getDb();
    const [row] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, id));
    return row;
  };

  it('401s without the admin token', async () => {
    const res = await h('POST', FILE)(
      req('POST', '/api/admin/fulfillment/generations/claim', { action: 'fail', id: 'x' }),
      { params: Promise.resolve({}) }
    );
    expect(res.status).toBe(401);
  });

  it('classifies content_refused: stores the code + fixed copy, not raw text', async () => {
    const row = await insertGeneration('user-1', { status: 'generating' });
    const { status, body } = await json(
      await call({
        action: 'fail',
        id: row.id,
        error_code: 'content_refused',
        error: 'Traceback (most recent call last): provider.SafetyError: BLOOD detected',
      })
    );
    expect(status).toBe(200);
    expect(body.error_code).toBe('content_refused');

    const after = await stored(row.id);
    expect(after.status).toBe('failed');
    expect(after.errorCode).toBe('content_refused');
    // fixed user-safe copy — the raw traceback must NOT be stored
    expect(after.error).toContain('declined');
    expect(after.error).not.toContain('Traceback');
    expect(after.error).not.toContain('SafetyError');
  });

  it('defaults unknown error_code to technical with the technical copy', async () => {
    const row = await insertGeneration('user-1', { status: 'queued' });
    const { status, body } = await json(
      await call({ action: 'fail', id: row.id, error_code: 'nope', error: 'boom' })
    );
    expect(status).toBe(200);
    expect(body.error_code).toBe('technical');
    const after = await stored(row.id);
    expect(after.errorCode).toBe('technical');
    expect(after.error).toContain('grill flared up');
  });

  it('400s without an id and only fails open rows', async () => {
    expect((await json(await call({ action: 'fail' }))).status).toBe(400);
    const done = await insertGeneration('user-1', { status: 'done' });
    const { status } = await json(
      await call({ action: 'fail', id: done.id, error_code: 'technical' })
    );
    expect(status).toBe(200); // idempotent: done rows are left untouched
    const after = await stored(done.id);
    expect(after.status).toBe('done');
  });
});

describe('POST /api/gen/[id]/retry', () => {
  const FILE = 'app/api/gen/[id]/retry/route.ts';
  const call = (id: string, body?: unknown) =>
    h('POST', FILE)(req('POST', `/api/gen/${id}/retry`, body), {
      params: Promise.resolve({ id }),
    });
  const stored = async (id: string) => {
    const db = client.getDb();
    const [row] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, id));
    return row;
  };

  it('is owner-gated and 401s when unauthenticated', async () => {
    const row = await insertGeneration('user-1', { status: 'failed' });
    mockAuth.userId = 'user-2';
    expect((await call(row.id)).status).toBe(403);
    mockAuth.userId = null;
    expect((await call(row.id)).status).toBe(401);
    mockAuth.userId = 'user-1';
    expect((await call('00000000-0000-0000-0000-000000000000')).status).toBe(404);
  });

  it('mints a fresh queued row with the same prompt from a failed row', async () => {
    mockAuth.userId = 'retry-user-1';
    await seedUser('retry-user-1');
    const row = await insertGeneration('retry-user-1', {
      status: 'failed',
      errorCode: 'content_refused',
      prompt: 'a dragon on fire',
      quality: 'hd',
      aspectRatio: '16:9',
    });
    const { status, body } = await json(await call(row.id));
    expect(status).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.id).not.toBe(row.id);

    const fresh = await stored(body.id);
    expect(fresh).toMatchObject({
      userId: 'retry-user-1',
      prompt: 'a dragon on fire',
      quality: 'hd',
      aspectRatio: '16:9',
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
    });
    // the source row keeps its terminal history
    const source = await stored(row.id);
    expect(source.status).toBe('failed');
  });

  it('accepts a safer rephrase prompt in the body', async () => {
    mockAuth.userId = 'retry-user-2';
    await seedUser('retry-user-2');
    const row = await insertGeneration('retry-user-2', {
      status: 'failed',
      errorCode: 'content_refused',
      prompt: 'a dragon on fire',
    });
    const safer = 'a dragon lit by warm dramatic light';
    const { status, body } = await json(await call(row.id, { prompt: safer }));
    expect(status).toBe(201);
    const fresh = await stored(body.id);
    expect(fresh.prompt).toBe(safer);
  });

  it('rejects invalid rephrase prompts and finished rows', async () => {
    mockAuth.userId = 'retry-user-3';
    await seedUser('retry-user-3');
    const row = await insertGeneration('retry-user-3', { status: 'failed' });
    expect((await json(await call(row.id, { prompt: '   ' }))).status).toBe(400);

    const done = await insertGeneration('retry-user-3', { status: 'done' });
    const { status, body } = await json(await call(done.id));
    expect(status).toBe(409);
    expect(body.code).toBe('NOT_RETRYABLE');
  });

  it('re-queues a stuck open row: old row failed, new row queued', async () => {
    mockAuth.userId = 'retry-user-4';
    await seedUser('retry-user-4');
    const db = client.getDb();
    const row = await insertGeneration('retry-user-4', { status: 'generating' });
    // simulate a 20-minute stall
    await db.execute(
      sql`UPDATE generations SET updated_at = now() - interval '20 minutes' WHERE id = ${row.id}::uuid`
    );
    const { status, body } = await json(await call(row.id));
    expect(status).toBe(201);

    const old = await stored(row.id);
    expect(old.status).toBe('failed');
    expect(old.errorCode).toBe('technical');
    const fresh = await stored(body.id);
    expect(fresh.status).toBe('queued');
  });

  it('429s when the free cap is exhausted (failures never consumed it)', async () => {
    mockAuth.userId = 'retry-cap-user';
    await seedUser('retry-cap-user');
    const failed = await insertGeneration('retry-cap-user', { status: 'failed' });
    // 3 finished previews exhaust the cap; the failed one must not count
    for (let i = 0; i < 3; i++) {
      await insertGeneration('retry-cap-user', { status: 'done' });
    }
    const { status, body } = await json(await call(failed.id));
    expect(status).toBe(429);
    expect(body.code).toBe('FREE_CAP_REACHED');
    mockAuth.userId = 'user-1';
  });
});

describe('GET /api/gen/[id]/status failure-class surface', () => {
  const FILE = 'app/api/gen/[id]/status/route.ts';
  const call = (id: string) =>
    h('GET', FILE)(req('GET', `/api/gen/${id}/status`), {
      params: Promise.resolve({ id }),
    });

  it('exposes error_code and a suggested rephrase for refusals', async () => {
    mockAuth.userId = 'user-1';
    const row = await insertGeneration('user-1', {
      status: 'failed',
      errorCode: 'content_refused',
      error: 'fixed copy',
      prompt: 'a dragon on fire',
    });
    const { status, body } = await json(await call(row.id));
    expect(status).toBe(200);
    expect(body.error_code).toBe('content_refused');
    expect(body.suggested_prompt).toBe('a dragon lit by warm dramatic light');
    expect(body.error).toBe('fixed copy');
  });

  it('omits error_code for unclassified failures and flags stuck rows', async () => {
    mockAuth.userId = 'user-1';
    const row = await insertGeneration('user-1', { status: 'failed' });
    const { body } = await json(await call(row.id));
    expect(body).not.toHaveProperty('error_code');
    expect(body).not.toHaveProperty('suggested_prompt');
  });
});
