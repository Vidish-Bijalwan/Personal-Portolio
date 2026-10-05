/**
 * Vidish Studio — payment-claim flow tests.
 *
 * Covers the phone-ping payment flow: user taps "I've paid" (no UTR),
 * order moves PAYMENT_PENDING → PAYMENT_AWAITING_OWNER, the owner
 * confirms (YES) or sends it back (NO), and the ping throttle.
 *
 * Service functions run against in-process PGlite (DATABASE_URL unset);
 * session auth is mocked to a switchable test user.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({ userId: 'claim-user' as string | null }));

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
process.env.UPI_PAYMENT_ENABLED = 'true';
process.env.UPI_VPA = 'vidish@okhdfcbank';
process.env.UPI_PAYEE_NAME = 'VidishStudio';
process.env.ADMIN_TOKEN='test-admin-token'

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> }
) => Promise<Response>;

let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');
let manualUpi: typeof import('@/lib/payments/manual-upi');
let claimPaidPOST: Handler;

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

async function seedUser(id: string) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id, email: `${id}@vidish.dev`, name: id })
    .onConflictDoNothing();
}

/** Minimal operator stub job + manual-UPI order, like the real flow. */
async function seedOrder(userId: string) {
  const db = client.getDb();
  const [stub] = await db
    .insert(schema.generationJobs)
    .values({ userId, prompt: 'stub', customerPrice: 2900 })
    .returning();
  return manualUpi.createManualPaymentOrder({
    jobId: stub.id,
    userId,
    amountPaise: 2900,
  });
}

async function orderStatus(code: string) {
  const db = client.getDb();
  const [row] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.code, code))
    .limit(1);
  return row;
}

beforeAll(async () => {
  const mod = (await import(
    pathToFileURL(resolve(process.cwd(), 'app/api/orders/[code]/claim-paid/route.ts')).href
  )) as Record<string, unknown>;
  claimPaidPOST = mod.POST as Handler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  manualUpi = await import('@/lib/payments/manual-upi');
  await client.runMigrations();
  await seedUser('claim-user');
  await seedUser('other-user');
}, 180_000);

describe('newShortCode', () => {
  it('is 4 chars from the unambiguous alphabet', async () => {
    const { newShortCode } = await import('@/lib/vilish/types');
    for (let i = 0; i < 50; i++) {
      const c = newShortCode();
      expect(c).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
    }
    const set = new Set(Array.from({ length: 50 }, () => newShortCode()));
    expect(set.size).toBeGreaterThan(40); // not obviously colliding
  });
});

describe('shouldPingOwner throttle', () => {
  it('pings when never pinged, throttles within 4 min, stops after 5', () => {
    const { shouldPingOwner, OWNER_PING_MAX } = manualUpi;
    const now = Date.now();
    expect(shouldPingOwner({ ownerPingedAt: null, pingCount: 0 }, now)).toBe(true);
    expect(
      shouldPingOwner({ ownerPingedAt: new Date(now - 3 * 60 * 1000), pingCount: 1 }, now)
    ).toBe(false);
    expect(
      shouldPingOwner({ ownerPingedAt: new Date(now - 5 * 60 * 1000), pingCount: 1 }, now)
    ).toBe(true);
    expect(
      shouldPingOwner({ ownerPingedAt: null, pingCount: OWNER_PING_MAX }, now)
    ).toBe(false);
    expect(
      shouldPingOwner(
        { ownerPingedAt: new Date(now - 60 * 60 * 1000), pingCount: OWNER_PING_MAX },
        now
      )
    ).toBe(false);
  });
});

describe('POST /api/orders/[code]/claim-paid', () => {
  it('401s when unauthenticated', async () => {
    mockAuth.userId = null;
    const res = await claimPaidPOST(req('POST', '/x'), {
      params: Promise.resolve({ code: 'VLSH-XXXXXX' }),
    });
    expect(res.status).toBe(401);
    mockAuth.userId = 'claim-user';
  });

  it('403s on another user\'s order', async () => {
    const payment = await seedOrder('other-user');
    const { status, body } = await json(
      await claimPaidPOST(req('POST', '/x'), {
        params: Promise.resolve({ code: payment.code }),
      })
    );
    expect(status).toBe(403);
    expect(body.error).toBe('FORBIDDEN');
  });

  it('404s on unknown code', async () => {
    const { status } = await json(
      await claimPaidPOST(req('POST', '/x'), {
        params: Promise.resolve({ code: 'VLSH-NOPE00' }),
      })
    );
    expect(status).toBe(404);
  });

  it('claims PENDING → AWAITING_OWNER and is idempotent', async () => {
    const payment = await seedOrder('claim-user');
    expect(payment.shortCode).toMatch(/^[A-Z2-9]{4}$/);
    const call = () =>
      claimPaidPOST(req('POST', '/x'), {
        params: Promise.resolve({ code: payment.code }),
      });
    const first = await json(await call());
    expect(first.status).toBe(200);
    expect(first.body.status).toBe('PAYMENT_AWAITING_OWNER');
    expect(first.body.shortCode).toBe(payment.shortCode);
    expect((await orderStatus(payment.code))?.status).toBe('PAYMENT_AWAITING_OWNER');

    const second = await json(await call());
    expect(second.status).toBe(200);
    expect(second.body.status).toBe('PAYMENT_AWAITING_OWNER');
  });

  it('409s when the order is already verified', async () => {
    const payment = await seedOrder('claim-user');
    await manualUpi.claimPaymentPaid({ code: payment.code, userId: 'claim-user' });
    await manualUpi.setOrderPaidByOwner({ code: payment.code });
    const { status } = await json(
      await claimPaidPOST(req('POST', '/x'), {
        params: Promise.resolve({ code: payment.code }),
      })
    );
    expect(status).toBe(409);
  });
});

describe('owner confirm / reject', () => {
  it('setOrderPaidByOwner verifies an awaiting order (short code works)', async () => {
    const payment = await seedOrder('claim-user');
    await manualUpi.claimPaymentPaid({ code: payment.code, userId: 'claim-user' });
    const res = await manualUpi.setOrderPaidByOwner({ code: payment.shortCode! });
    expect(res.status).toBe('PAYMENT_VERIFIED');
    expect((await orderStatus(payment.code))?.status).toBe('PAYMENT_VERIFIED');
  });

  it('rejectOrderPayment sends the order back to PENDING', async () => {
    const payment = await seedOrder('claim-user');
    await manualUpi.claimPaymentPaid({ code: payment.code, userId: 'claim-user' });
    const res = await manualUpi.rejectOrderPayment({ code: payment.shortCode! });
    expect(res.status).toBe('PAYMENT_PENDING');
    const row = await orderStatus(payment.code);
    expect(row?.status).toBe('PAYMENT_PENDING');
    expect(row?.pingCount).toBe(0);
    expect(row?.ownerPingedAt).toBeNull();
  });

  it('rejectOrderPayment 409s when not awaiting', async () => {
    const payment = await seedOrder('claim-user');
    await expect(
      manualUpi.rejectOrderPayment({ code: payment.code })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('verifyPaymentOrder still accepts the legacy PAYMENT_SUBMITTED state', async () => {
    const payment = await seedOrder('claim-user');
    await manualUpi.submitPaymentUtr({
      code: payment.code,
      utrReference: '412345678901',
      userId: 'claim-user',
    });
    const res = await manualUpi.verifyPaymentOrder({
      code: payment.code,
      adminUserId: 'admin',
    });
    expect(res.status).toBe('PAYMENT_VERIFIED');
  });

  it('owner confirm flips generations.unlocked via the existing hook', async () => {
    const db = client.getDb();
    const [gen] = await db
      .insert(schema.generations)
      .values({
        userId: 'claim-user',
        prompt: 'a brass lamp',
        quality: 'studio',
        aspectRatio: '1:1',
        mediaType: 'image',
        tier: 'free',
        status: 'done',
        unlocked: false,
      })
      .returning();
    const payment = await seedOrder('claim-user');
    const [orderRow] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.code, payment.code))
      .limit(1);
    await db.insert(schema.generationOrders).values({
      orderId: orderRow.id,
      generationId: gen.id,
      purpose: 'unlock',
    });
    await manualUpi.claimPaymentPaid({ code: payment.code, userId: 'claim-user' });
    await manualUpi.setOrderPaidByOwner({ code: payment.shortCode! });
    const [updated] = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, gen.id))
      .limit(1);
    expect(updated.unlocked).toBe(true);
  });
});
