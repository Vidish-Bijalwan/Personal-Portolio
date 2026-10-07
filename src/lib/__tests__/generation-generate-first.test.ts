/**
 * Generate-first flow regression tests (paid images).
 *
 * Drives the REAL route handlers against in-process PGlite (auth mocked):
 *
 *  1. POST /api/generation/start creates NO payment order — it queues a
 *     paid generations row and returns its id.
 *  2. POST /api/generation/unlock refuses before delivery (409), then
 *     creates the unlock order at click time with the SERVER-SIDE price
 *     (the job's quoted customerPrice — never client input).
 *  3. Unlock is idempotent (a pending order is resumed, not duplicated).
 *  4. PAYMENT_VERIFIED (manual-UPI confirm AND Cashfree mark-paid) flips
 *     generations.unlocked via runUnlockHooks — the clean file gates on it.
 *  5. Admin bypass (isAdminEmail) skips all payment UI — the unlock order
 *     is verified immediately and the clean download opens.
 *  6. Cashfree post-payment destination for unlock orders is the watch
 *     room (/watch/[id]), not the job page.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { servicePricePaise } from '@/lib/pricing/catalog';

const mockAuth = vi.hoisted(() => ({
  userId: 'gf-user-1' as string | null,
  email: 'gf-user-1@vidish.dev' as string | null,
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
process.env.ORDERS_ACCEPTING = 'true';

type Handler = (req: NextRequest, ctx?: any) => Promise<Response>;

let startPOST: Handler;
let unlockGET: Handler;
let unlockPOST: Handler;
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');
let verifyPaymentOrder: typeof import('@/lib/payments/manual-upi').verifyPaymentOrder;
let markCashfreeOrderPaid: typeof import('@/lib/payments/cashfree').markCashfreeOrderPaid;
let resolvePostPaymentDestination: typeof import('@/lib/payments/cashfree').resolvePostPaymentDestination;

beforeAll(async () => {
  const startMod = (await import(
    pathToFileURL(resolve(process.cwd(), 'app/api/generation/start/route.ts')).href
  )) as Record<string, unknown>;
  startPOST = startMod.POST as Handler;
  const unlockMod = (await import(
    pathToFileURL(resolve(process.cwd(), 'app/api/generation/unlock/route.ts')).href
  )) as Record<string, unknown>;
  unlockGET = unlockMod.GET as Handler;
  unlockPOST = unlockMod.POST as Handler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  await client.runMigrations();
  ({ verifyPaymentOrder } = await import('@/lib/payments/manual-upi'));
  ({ markCashfreeOrderPaid, resolvePostPaymentDestination } = await import(
    '@/lib/payments/cashfree'
  ));
}, 180_000);

const CUSTOMER_PRICE = 3900; // product-photo ladder price (server-side quote)

async function seedJobAndQuote(userId: string, pricePaise = CUSTOMER_PRICE) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id: userId, email: `${userId}@vidish.dev`, name: userId })
    .onConflictDoNothing();
  const [job] = await db
    .insert(schema.generationJobs)
    .values({
      userId,
      state: 'QUOTED',
      prompt: 'a generate-first test image',
      task: 'text_to_image',
      quality: 'studio',
      aspectRatio: '1:1',
      customerPrice: pricePaise,
      product: 'product-photo',
      idempotencyKey: crypto.randomUUID(),
    })
    .returning();
  const [quote] = await db
    .insert(schema.quotes)
    .values({
      jobId: job.id,
      breakdown: { total: pricePaise },
      totalPaise: pricePaise,
      expiresAt: new Date(Date.now() + 3600_000),
    })
    .returning({ id: schema.quotes.id });
  return { jobId: job.id, quoteId: quote.id };
}

function postJson(url: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function asUser(userId: string, email: string) {
  mockAuth.userId = userId;
  mockAuth.email = email;
}

async function startGeneration(quoteId: string) {
  const res = await startPOST(postJson('/api/generation/start', { quoteId, country: 'IN' }));
  const body = (await res.json().catch(() => null)) as any;
  return { res, body };
}

async function markDone(generationId: string) {
  const db = client.getDb();
  await db
    .update(schema.generations)
    .set({ status: 'done', updatedAt: new Date() })
    .where(eq(schema.generations.id, generationId));
}

describe('generate-first: generation starts with no order created', () => {
  it('queues a paid generations row and creates zero orders', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId, jobId } = await seedJobAndQuote('gf-user-1');
    const { res, body } = await startGeneration(quoteId);
    expect(res.status).toBe(201);
    expect(body.jobId).toBe(jobId);
    expect(body.generationId).toBeTruthy();
    expect(body.payment).toBeUndefined();

    const db = client.getDb();
    const orders = await db.select({ id: schema.orders.id }).from(schema.orders);
    expect(orders).toHaveLength(0);

    const [gen] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.generationId));
    expect(gen).toBeTruthy();
    expect(gen.tier).toBe('paid');
    expect(gen.mediaType).toBe('image');
    expect(gen.status).toBe('queued');
    expect(gen.jobId).toBe(jobId);
    expect(gen.unlocked).toBe(false);

    // The pricing job stays QUOTED as the server-side price record.
    const [job] = await db
      .select()
      .from(schema.generationJobs)
      .where(eq(schema.generationJobs.id, jobId));
    expect(job.state).toBe('QUOTED');
  });

  it('claims an anonymous quote job for the signed-in user', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const db = client.getDb();
    await db
      .insert(schema.users)
      .values({ id: 'gf-user-1', email: 'gf-user-1@vidish.dev', name: 'u1' })
      .onConflictDoNothing();
    // Quote route creates jobs without a userId (quotes are anonymous
    // until Generate-time auth).
    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        userId: null,
        state: 'QUOTED',
        prompt: 'anonymous quote',
        customerPrice: CUSTOMER_PRICE,
        product: 'single-image',
        idempotencyKey: crypto.randomUUID(),
      })
      .returning();
    const [quote] = await db
      .insert(schema.quotes)
      .values({
        jobId: job.id,
        breakdown: { total: CUSTOMER_PRICE },
        totalPaise: CUSTOMER_PRICE,
        expiresAt: new Date(Date.now() + 3600_000),
      })
      .returning({ id: schema.quotes.id });

    const { res, body } = await startGeneration(quote.id);
    expect(res.status).toBe(201);
    expect(body.generationId).toBeTruthy();

    const [claimed] = await db
      .select()
      .from(schema.generationJobs)
      .where(eq(schema.generationJobs.id, job.id));
    expect(claimed.userId).toBe('gf-user-1');
    const [gen] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.generationId));
    expect(gen.userId).toBe('gf-user-1');
  });
});

describe('generate-first: unlock order created at click time with server-side price', () => {
  it('refuses the unlock before delivery (409)', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    const res = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const rbody = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(409);
    expect(rbody.code).toBe('NOT_DELIVERED');
  });

  it('creates the unlock order on click with the quoted server-side price', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    const res = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const rbody = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(201);
    expect(rbody.generationId).toBe(body.generationId);
    // Amount from the server-side pricing job — never the client.
    expect(rbody.payment.amountPaise).toBe(CUSTOMER_PRICE);
    expect(rbody.payment.code).toMatch(/^VLSH-/);

    const db = client.getDb();
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.code, rbody.payment.code));
    expect(order).toBeTruthy();
    expect(order.status).toBe('PAYMENT_PENDING');
    expect(order.amountPaise).toBe(CUSTOMER_PRICE);

    const [link] = await db
      .select()
      .from(schema.generationOrders)
      .where(eq(schema.generationOrders.orderId, order.id));
    expect(link).toBeTruthy();
    expect(link.purpose).toBe('unlock');
    expect(link.generationId).toBe(body.generationId);
  });

  it('resumes a pending unlock order instead of duplicating it', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    const first = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const firstBody = (await first.json().catch(() => null)) as any;
    const second = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const secondBody = (await second.json().catch(() => null)) as any;
    expect(secondBody.resumed).toBe(true);
    expect(secondBody.payment.code).toBe(firstBody.payment.code);

    const db = client.getDb();
    const links = await db
      .select()
      .from(schema.generationOrders)
      .where(eq(schema.generationOrders.generationId, body.generationId));
    expect(links).toHaveLength(1);
  });

  it('falls back to the catalog price when the job has no quoted price', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1', 0);
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    const res = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const rbody = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(201);
    // Never hardcoded: the live catalog price for the job's product.
    expect(rbody.payment.amountPaise).toBe(servicePricePaise('product-photo'));
  });

  it('GET returns the server-side unlock price for the CTA', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    const req = new NextRequest(
      `http://localhost/api/generation/unlock?generationId=${body.generationId}`,
      { method: 'GET' }
    );
    const res = await unlockGET(req);
    const rbody = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(200);
    expect(rbody.pricePaise).toBe(CUSTOMER_PRICE);
  });

  it('rejects unlock for a generation the user does not own', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    asUser('gf-user-2', 'gf-user-2@vidish.dev');
    await client
      .getDb()
      .insert(schema.users)
      .values({ id: 'gf-user-2', email: 'gf-user-2@vidish.dev', name: 'u2' })
      .onConflictDoNothing();
    const res = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    expect(res.status).toBe(403);
  });
});

describe('generate-first: unlock requires PAYMENT_VERIFIED', () => {
  it('manual-UPI verify flips generations.unlocked via runUnlockHooks', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);
    const unlockRes = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const unlockBody = (await unlockRes.json().catch(() => null)) as any;
    const code = unlockBody.payment.code as string;

    // Claim "I've paid", then the owner verifies — the unlock hook runs.
    const db = client.getDb();
    await db
      .update(schema.orders)
      .set({ status: 'PAYMENT_AWAITING_OWNER' })
      .where(eq(schema.orders.code, code));
    const result = await verifyPaymentOrder({ code, adminUserId: 'owner' });
    expect(result.status).toBe('PAYMENT_VERIFIED');

    const [gen] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.generationId));
    expect(gen.unlocked).toBe(true);
  });

  it('Cashfree mark-paid flips generations.unlocked via runUnlockHooks', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);
    const unlockRes = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const unlockBody = (await unlockRes.json().catch(() => null)) as any;
    const code = unlockBody.payment.code as string;

    const db = client.getDb();
    const cfOrderId = `etch_${code}_test`;
    await db
      .update(schema.orders)
      .set({ cashfreeOrderId: cfOrderId, provider: 'cashfree' })
      .where(eq(schema.orders.code, code));

    const result = await markCashfreeOrderPaid({
      cashfreeOrderId: cfOrderId,
      paidAmountPaise: CUSTOMER_PRICE,
      rawPayload: { test: true },
    });
    expect(result.ok).toBe(true);

    const [gen] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.generationId));
    expect(gen.unlocked).toBe(true);
  });

  it('unlock orders route Cashfree return traffic to the watch room', async () => {
    asUser('gf-user-1', 'gf-user-1@vidish.dev');
    const { quoteId } = await seedJobAndQuote('gf-user-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);
    const unlockRes = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const unlockBody = (await unlockRes.json().catch(() => null)) as any;

    const db = client.getDb();
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.code, unlockBody.payment.code));
    const dest = await resolvePostPaymentDestination(order.id);
    expect(dest).toBe(`/watch/${body.generationId}?paid=1`);
  });
});

describe('generate-first: admin bypass skips all payment UI', () => {
  it('unlock as admin verifies immediately and opens the clean file', async () => {
    asUser('owner-1', 'owner@vidish.dev');
    const { quoteId } = await seedJobAndQuote('owner-1');
    const { body } = await startGeneration(quoteId);
    await markDone(body.generationId);

    const res = await unlockPOST(
      postJson('/api/generation/unlock', { generationId: body.generationId })
    );
    const rbody = (await res.json().catch(() => null)) as any;
    expect(rbody.adminBypass).toBe(true);
    expect(rbody.unlocked).toBe(true);
    expect(rbody.payment).toBeUndefined();

    const db = client.getDb();
    const [gen] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, body.generationId));
    expect(gen.unlocked).toBe(true);

    // The bypass is audit-logged as payment.admin_bypass.
    const audits = await db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.action, 'payment.admin_bypass'));
    expect(audits.length).toBeGreaterThan(0);
  });
});
