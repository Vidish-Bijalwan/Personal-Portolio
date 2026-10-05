/**
 * Pixaura Phase 2 — contract §5 capacity gates on POST /api/generation/start.
 *
 * The gate runs BEFORE order creation:
 * - ORDERS_ACCEPTING=false → 403 { error: 'ORDERS_PAUSED' }
 * - daily count of operator jobs created today (state NOT IN DRAFT,
 *   fulfillmentMode=operator) >= MAX_OPERATOR_ORDERS_PER_DAY
 *   → 403 { error: 'DAILY_CAP_REACHED' }
 * - a valid x-admin-token header bypasses both gates.
 *
 * Covered at route level: the contract factors no pure capacity helper, so
 * there is nothing pure to unit-test in isolation. Session auth is mocked;
 * DB runs on in-process PGlite; storage/payment providers are real local
 * implementations (no network).
 */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  requireSession: () =>
    Promise.resolve({
      user: {
        id: 'cap-user-1',
        email: 'capacity@vilish.dev',
        name: 'Capacity User',
      },
      response: null,
    }),
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
}));

delete process.env.DATABASE_URL;

const START_FILE = resolve(process.cwd(), 'app/api/generation/start/route.ts');
const HAS_START = existsSync(START_FILE);

const ADMIN_TOKEN = 'test-admin-token-capacity';

describe.runIf(HAS_START)('POST /api/generation/start — capacity gates', () => {
  let POST: (req: NextRequest) => Promise<Response>;
  let db: ReturnType<typeof import('@/lib/db/client').getDb>;
  let schema: typeof import('@/lib/db/schema');

  beforeAll(async () => {
    process.env.ADMIN_TOKEN = ADMIN_TOKEN;
    const client = await import('@/lib/db/client');
    schema = await import('@/lib/db/schema');
    db = client.getDb();
    await client.runMigrations();
    const seed = await import('@/lib/db/seed');
    await seed.seed();
    ({ POST } = await import(pathToFileURL(START_FILE).href));
    await db
      .insert(schema.users)
      .values({
        id: 'cap-user-1',
        name: 'Capacity User',
        email: 'capacity@vilish.dev',
      })
      .onConflictDoNothing();
  }, 120_000);

  afterEach(async () => {
    // restore open-for-business defaults: accepting=true, no daily cap
    // (cap "null" is stored as jsonb null per the contract seed — SQL NULL
    // violates the column's NOT NULL constraint)
    await setConfig('ORDERS_ACCEPTING', 'true');
    await db
      .insert(schema.adminConfig)
      .values({
        key: 'MAX_OPERATOR_ORDERS_PER_DAY',
        value: sql`'null'::jsonb`,
      })
      .onConflictDoUpdate({
        target: schema.adminConfig.key,
        set: { value: sql`'null'::jsonb` },
      });
  });

  async function setConfig(key: string, value: string | number | boolean) {
    await db
      .insert(schema.adminConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.adminConfig.key,
        set: { value },
      });
  }

  /** A QUOTED operator-mode job with a live quote, ready for /start. */
  async function makeStartableJob() {
    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        userId: 'cap-user-1',
        task: 'text_to_image',
        prompt: 'capacity probe',
        aspectRatio: '1:1',
        quality: 'quick',
        customerPrice: 2900,
        state: 'QUOTED',
        fulfillmentMode: 'operator',
        idempotencyKey: crypto.randomUUID(),
      } as Record<string, unknown>)
      .returning();
    const [quote] = await db
      .insert(schema.quotes)
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
    return { job, quote };
  }

  function startRequest(quoteId: string, adminToken?: string) {
    return new NextRequest('http://localhost/api/generation/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      },
      body: JSON.stringify({ quoteId }),
    });
  }

  it('ORDERS_ACCEPTING=false → 403 ORDERS_PAUSED', async () => {
    await setConfig('ORDERS_ACCEPTING', 'false');
    const { quote } = await makeStartableJob();
    const res = await POST(startRequest(quote.id));
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe('ORDERS_PAUSED');
  });

  it('daily cap reached → 403 DAILY_CAP_REACHED', async () => {
    await setConfig('MAX_OPERATOR_ORDERS_PER_DAY', 1);
    // one other operator job created today, already past DRAFT
    await makeStartableJob();
    const { quote } = await makeStartableJob();
    const res = await POST(startRequest(quote.id));
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe('DAILY_CAP_REACHED');
  });

  it('below the daily cap → order is created normally', async () => {
    await setConfig('MAX_OPERATOR_ORDERS_PER_DAY', 50);
    const { quote } = await makeStartableJob();
    const res = await POST(startRequest(quote.id));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      jobId?: string;
      payment?: { code?: string };
    };
    expect(body.jobId).toBeTruthy();
    expect(body.payment?.code).toMatch(/^VLSH-/);
  });

  it('valid x-admin-token bypasses the paused gate', async () => {
    await setConfig('ORDERS_ACCEPTING', 'false');
    const { quote } = await makeStartableJob();
    const res = await POST(startRequest(quote.id, ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { payment?: { code?: string } };
    expect(body.payment?.code).toMatch(/^VLSH-/);
  });

  it('valid x-admin-token bypasses the daily-cap gate', async () => {
    await setConfig('MAX_OPERATOR_ORDERS_PER_DAY', 1);
    await makeStartableJob(); // fill the cap
    const { quote } = await makeStartableJob();
    const res = await POST(startRequest(quote.id, ADMIN_TOKEN));
    expect(res.status).toBe(200);
  });
});
