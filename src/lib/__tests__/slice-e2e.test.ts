/**
 * Pixaura vertical-slice E2E (no network, no external services).
 * Drives the real lib functions the API routes call, in one PGlite DB:
 * interpret → quote → manual-UPI order → UTR submit → admin verify →
 * job queued → mock provider generation → READY + remake eligibility.
 */
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';

vi.stubEnv('UPI_PAYMENT_ENABLED', 'true');
vi.stubEnv('UPI_VPA', 'vidish-test@upi');
vi.stubEnv('UPI_PAYEE_NAME', 'Pixaura TEST');
vi.stubEnv('ALLOW_MOCK_PROVIDER', 'true');
vi.stubEnv('GENERATION_PROVIDER_PRIORITY', 'mock');

import { runMigrations, getDb } from '@/lib/db/client';
import { seed } from '@/lib/db/seed';
import * as schema from '@/lib/db/schema';
import { interpretCreative as interpret } from '@/lib/creative/interpret';
import { getGenerationService } from '@/lib/providers/registry';
import { quotePrice, remakePrice, ladderPrice } from '@/lib/pricing/engine';
import {
  createManualPaymentOrder,
  submitPaymentUtr,
  verifyPaymentOrder,
} from '@/lib/payments/manual-upi';
import { canTransition } from '@/lib/vilish/types';

const db = getDb();

async function getJob(id: string) {
  const rows = await db
    .select()
    .from(schema.generationJobs)
    .where(eq(schema.generationJobs.id, id));
  return rows[0];
}

describe('Pixaura slice E2E', () => {
  let jobId: string;
  let orderCode: string;

  it('migrates + seeds', async () => {
    await runMigrations();
    await seed();
    const providers = await db.select().from(schema.providers);
    expect(providers.length).toBe(3);
  }, 120000);

  it('interpret → CreativeSpec', async () => {
    const spec = interpret({
      prompt: 'Turn my sneaker photo into a cinematic product ad for instagram reel',
    });
    expect(spec.task).toBe('text_to_image');
    expect(spec.aspectRatio).toBe('9:16');
    expect(spec.enhancedPrompt.length).toBeGreaterThan(spec.prompt.length);
  });

  it('quote → job QUOTED with price', async () => {
    const spec = interpret({ prompt: 'a sneaker ad', aspectRatio: '1:1' });
    const service = getGenerationService();
    expect(service.providerId).toBe('mock');
    const plan = await service.plan(spec);
    const breakdown = quotePrice({ providerCostPaise: plan.estimatedCostPaise });
    expect(breakdown.total).toBeGreaterThan(0);
    expect(breakdown.total % 100).toBe(0);
    // Slice retail mirrors the quote route: ladder price, floor-protected.
    const retailPaise = ladderPrice('singleImage', plan.estimatedCostPaise);
    expect(retailPaise).toBe(1900);

    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        state: 'QUOTED',
        task: spec.task,
        prompt: spec.prompt,
        enhancedPrompt: spec.enhancedPrompt,
        aspectRatio: spec.aspectRatio,
        quality: spec.quality,
        providerId: plan.providerId,
        model: plan.model,
        estimatedCost: plan.estimatedCostPaise,
        customerPrice: retailPaise,
        idempotencyKey: `test-${Date.now()}`,
      })
      .returning();
    jobId = job.id;
    expect(job.state).toBe('QUOTED');
  });

  it('start → manual UPI order, job PAYMENT_PENDING', async () => {
    const job = await getJob(jobId);
    const order = await createManualPaymentOrder({
      jobId,
      userId: null,
      amountPaise: job.customerPrice,
    });
    orderCode = order.code;
    expect(order.code).toMatch(/^VLSH-[A-Z2-9]{6}$/);
    expect(order.upiUri).toContain('upi://pay?');
    expect(order.qrDataUri ?? order.qrImageUrl).toBeTruthy();

    expect(canTransition('QUOTED', 'PAYMENT_PENDING')).toBe(true);
    await db
      .update(schema.generationJobs)
      .set({ state: 'PAYMENT_PENDING' })
      .where(eq(schema.generationJobs.id, jobId));
  });

  it('HARD RULE: worker-eligible states exclude PAYMENT_PENDING', async () => {
    const { isWorkerEligible } = await import('@/lib/jobs');
    expect(isWorkerEligible({ state: 'PAYMENT_PENDING', fulfillmentMode: 'provider' })).toBe(false);
    expect(isWorkerEligible({ state: 'QUEUED', fulfillmentMode: 'provider' })).toBe(true);
    // operator mode: worker never touches jobs
    expect(isWorkerEligible({ state: 'QUEUED', fulfillmentMode: 'operator' })).toBe(false);
  });

  it('UTR submit → PAYMENT_SUBMITTED', async () => {
    const res = await submitPaymentUtr({
      code: orderCode,
      utrReference: '123456789012',
      userId: null,
    });
    expect(res.status).toBe('PAYMENT_SUBMITTED');
  });

  it('admin verify → PAYMENT_VERIFIED, job PAID → QUEUED', async () => {
    const res = await verifyPaymentOrder({
      code: orderCode,
      adminUserId: 'admin-test',
    });
    expect(res.status).toBe('PAYMENT_VERIFIED');

    // what the admin verify route does:
    let job = await getJob(jobId);
    expect(canTransition(job.state, 'PAID')).toBe(true);
    await db
      .update(schema.generationJobs)
      .set({ state: 'PAID' })
      .where(eq(schema.generationJobs.id, jobId));
    job = await getJob(jobId);
    expect(canTransition(job.state, 'QUEUED')).toBe(true);
    await db
      .update(schema.generationJobs)
      .set({ state: 'QUEUED' })
      .where(eq(schema.generationJobs.id, jobId));
  });

  it('worker: mock provider → READY + remake eligibility', async () => {
    const service = getGenerationService();
    const job = await getJob(jobId);
    const { providerJobId } = await service.start({
      task: job.task as 'text_to_image',
      prompt: job.enhancedPrompt ?? job.prompt,
      aspectRatio: job.aspectRatio as '1:1',
      quality: job.quality as 'studio',
    });

    let status = await service.poll(providerJobId);
    expect(['queued', 'generating']).toContain(status.state);
    status = await service.poll(providerJobId);
    status = await service.poll(providerJobId);
    expect(status.state).toBe('ready');
    // watermark text is URI-encoded inside the data URI
    expect(status.outputUrl).toContain('DEV%20MOCK');

    await db
      .update(schema.generationJobs)
      .set({ state: 'READY', providerJobId })
      .where(eq(schema.generationJobs.id, jobId));

    const rp = remakePrice({ providerCostPaise: job.estimatedCost, level: 1 });
    await db.insert(schema.remakeEligibility).values({
      jobId,
      level: 1,
      pricePaise: rp.totalPaise,
      expiresAt: new Date(Date.now() + 48 * 3600_000),
    });
    const elig = await db
      .select()
      .from(schema.remakeEligibility)
      .where(eq(schema.remakeEligibility.jobId, jobId));
    expect(elig.length).toBe(1);
    expect(elig[0].pricePaise).toBeLessThan(job.customerPrice);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });
});
