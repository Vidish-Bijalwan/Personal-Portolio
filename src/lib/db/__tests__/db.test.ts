/**
 * Pixaura DB tests — run against in-process PGlite, no external services.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { eq } from 'drizzle-orm';

let schema: typeof import('../schema');
let client: typeof import('../client');
let seed: typeof import('../seed');

beforeAll(
  async () => {
    // Force the PGlite fallback path before client.ts evaluates.
    delete process.env.DATABASE_URL;
    schema = await import('../schema');
    client = await import('../client');
    seed = await import('../seed');
    await client.runMigrations();
  },
  120_000
);

describe('db roundtrip', () => {
  it('inserts and reads user → project → job → quote → order → payment chain', async () => {
    const db = client.getDb();
    const { users, projects, generationJobs, quotes, orders, payments } =
      schema;

    const [user] = await db
      .insert(users)
      .values({ name: 'Test User', email: 'test@vidish.dev' })
      .returning();
    expect(user.id).toBeTruthy();

    const [project] = await db
      .insert(projects)
      .values({ userId: user.id, title: 'Test project' })
      .returning();

    const [job] = await db
      .insert(generationJobs)
      .values({
        userId: user.id,
        projectId: project.id,
        task: 'text_to_image',
        prompt: 'a studio portrait of a brass lamp',
        aspectRatio: '1:1',
        quality: 'studio',
        customerPrice: 2900,
        idempotencyKey: crypto.randomUUID(),
      })
      .returning();
    expect(job.state).toBe('DRAFT');

    const [quote] = await db
      .insert(quotes)
      .values({
        jobId: job.id,
        breakdown: {
          providerCost: 27,
          infraCost: 50,
          paymentFee: 0,
          taxBuffer: 0,
          margin: 2823,
          total: 2900,
          currency: 'INR',
        },
        totalPaise: 2900,
        expiresAt: new Date(Date.now() + 15 * 60_000),
      })
      .returning();

    const orderCode = `VLSH-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const [order] = await db
      .insert(orders)
      .values({
        code: orderCode,
        jobId: job.id,
        userId: user.id,
        provider: 'manual_upi',
        amountPaise: 2900,
        status: 'PAYMENT_PENDING',
        utrReference: '123456789012',
        expiresAt: new Date(Date.now() + 30 * 60_000),
      })
      .returning();

    const [payment] = await db
      .insert(payments)
      .values({
        orderId: order.id,
        utrReference: '123456789012',
        amountPaise: 2900,
        method: 'upi_manual',
        status: 'verified',
      })
      .returning();

    // roundtrip reads
    const readJob = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, job.id));
    expect(readJob[0].prompt).toBe('a studio portrait of a brass lamp');
    expect(readJob[0].customerPrice).toBe(2900);

    const readQuote = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quote.id));
    expect(readQuote[0].totalPaise).toBe(2900);
    expect(readQuote[0].breakdown).toMatchObject({ currency: 'INR' });

    const readOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id));
    expect(readOrder[0].code).toBe(orderCode);
    expect(readOrder[0].utrReference).toBe('123456789012');
    expect(readOrder[0].provider).toBe('manual_upi');

    const readPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, payment.id));
    expect(readPayment[0].orderId).toBe(order.id);
    expect(readPayment[0].amountPaise).toBe(2900);
    expect(readPayment[0].status).toBe('verified');
  });
});

describe('seed idempotency', () => {
  it('seed() twice yields exactly one copy of each seed row', async () => {
    const db = client.getDb();
    const { providers, modelCatalog, adminConfig } = schema;

    await seed.seed();
    await seed.seed();

    const provs = await db.select().from(providers);
    expect(provs.map((p) => p.id).sort()).toEqual(['fal', 'meta', 'mock']);
    expect(provs.find((p) => p.id === 'fal')).toMatchObject({
      displayName: 'fal.ai',
      status: 'READY_FOR_CREDENTIAL',
      priority: 1,
      enabled: true,
    });
    expect(provs.find((p) => p.id === 'meta')).toMatchObject({
      status: 'AWAITING_PROVIDER_ACCESS',
      priority: 2,
    });
    expect(provs.find((p) => p.id === 'mock')).toMatchObject({
      status: 'CONNECTED',
      priority: 3,
    });

    const models = await db.select().from(modelCatalog);
    expect(models).toHaveLength(1);
    expect(models[0]).toMatchObject({
      providerId: 'fal',
      model: 'fal-ai/flux/schnell',
      task: 'text_to_image',
      qualityTier: 'studio',
      costPaisePerUnit: 27,
      enabled: true,
    });
    expect(models[0].capabilities).toMatchObject({
      endpointId: 'fal-ai/flux/schnell',
      usdPerMP: 0.003,
    });

    const cfg = await db.select().from(adminConfig);
    const byKey = Object.fromEntries(cfg.map((c) => [c.key, c.value]));
    expect(Object.keys(byKey).sort()).toEqual(
      [
        'FULFILLMENT_MODE',
        'MAX_OPERATOR_ORDERS_PER_DAY',
        'OPERATOR_ESTIMATED_TURNAROUND',
        'ORDERS_ACCEPTING',
        'ladder',
        'payments:feeBps',
        'payments:provider',
        'pricing:infraPaise',
        'pricing:marginBps',
        'pricing:minMarginPaise',
        'pricing:taxBufferBps',
        'region:multiplier:IN',
        'usd:inr',
      ].sort()
    );
    expect(byKey['pricing:marginBps']).toBe(6000);
    expect(byKey['payments:provider']).toBe('manual_upi');
    // phase 2: operator fulfillment config seeds
    expect(byKey['FULFILLMENT_MODE']).toBe('operator');
    // NOTE: seeded as the string 'true'; drizzle-orm's jsonb
    // mapFromDriverValue double-parses on read (JSON.parse('true') -> true),
    // so it round-trips as boolean true. getFulfillmentConfig() accepts both.
    expect(byKey['ORDERS_ACCEPTING']).toBe(true);
    expect(byKey['MAX_OPERATOR_ORDERS_PER_DAY']).toBeNull();
    expect(byKey['OPERATOR_ESTIMATED_TURNAROUND']).toBe(
      'Typical processing time: 30 minutes – several hours'
    );
    expect(byKey['ladder']).toEqual({
      singleImage: 2900,
      fourPack: 7900,
      productPhoto: 4900,
      clip5s: 9900,
      remake: 1900,
    });
  });
});
