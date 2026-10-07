/**
 * Etch — tests for the Video Studio tools (W2).
 *
 * Pure validation tests run without a DB; route tests run against
 * in-process PGlite (DATABASE_URL unset), with @/lib/auth mocked to a
 * switchable test user — same harness as the free-tier route tests.
 * The 0007 migration SQL is applied manually (CREATE TABLE IF NOT
 * EXISTS) so the test survives before/after the coordinator registers
 * it in migrations-data.ts.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import {
  decodeB64Strict,
  isValidTool,
  validateCaptionParams,
  validateInputFile,
  validateToolParams,
  validateTrimParams,
  validateTtsParams,
} from '@/lib/video/validate';
import { VIDEO_JOB_PRICE_PAISE, canTransitionVideoJob } from '@/lib/video/constants';

/* ---------------- pure validation ---------------- */

describe('video tool params validation', () => {
  it('accepts the three tools only', () => {
    expect(isValidTool('tts')).toBe(true);
    expect(isValidTool('caption')).toBe(true);
    expect(isValidTool('trim')).toBe(true);
    expect(isValidTool('edit')).toBe(false);
    expect(isValidTool(null)).toBe(false);
  });

  it('validates tts params', () => {
    const good = validateTtsParams({
      script: 'Hello world',
      voice: 'warm',
      sourceKind: 'upload',
    });
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.value).toMatchObject({ script: 'Hello world', voice: 'warm' });
    }
    expect(validateTtsParams({ script: '', voice: 'warm', sourceKind: 'upload' }).ok).toBe(false);
    expect(validateTtsParams({ script: 'x'.repeat(2001), voice: 'warm', sourceKind: 'upload' }).ok).toBe(false);
    expect(
      validateTtsParams({ script: 'hi', voice: 'robot', sourceKind: 'upload' }).ok
    ).toBe(false);
    const clip = validateTtsParams({
      script: 'hi',
      voice: 'calm',
      sourceKind: 'clip',
      generationId: '12345678-1234-1234-1234-1234567890ab',
    });
    expect(clip.ok).toBe(true);
    expect(
      validateTtsParams({ script: 'hi', voice: 'calm', sourceKind: 'clip', generationId: 'nope' }).ok
    ).toBe(false);
  });

  it('validates caption params', () => {
    expect(validateCaptionParams({ mode: 'auto' }).ok).toBe(true);
    const script = validateCaptionParams({ mode: 'script', text: 'hello there' });
    expect(script.ok).toBe(true);
    expect(validateCaptionParams({ mode: 'script', text: '' }).ok).toBe(false);
    expect(validateCaptionParams({ mode: 'whisper' }).ok).toBe(false);
  });

  it('validates trim params', () => {
    const good = validateTrimParams({
      start: 2.5,
      end: 12,
      text: 'Midnight Hills',
      position: 'top',
    });
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.value).toMatchObject({ start: 2.5, end: 12, text: 'Midnight Hills', position: 'top' });
    }
    expect(validateTrimParams({ start: 10, end: 5 }).ok).toBe(false);
    expect(validateTrimParams({ start: -1, end: 5 }).ok).toBe(false);
    expect(validateTrimParams({ start: 0, end: 700 }).ok).toBe(false);
    expect(validateTrimParams({ start: 0, end: 10, text: 'x', position: 'left' }).ok).toBe(false);
    const noText = validateTrimParams({ start: 0, end: 10 });
    expect(noText.ok).toBe(true);
    if (noText.ok) expect(noText.value.position).toBeUndefined();
  });

  it('dispatches per tool', () => {
    expect(validateToolParams('tts', { script: 'x', voice: 'warm', sourceKind: 'upload' }).ok).toBe(true);
    expect(validateToolParams('caption', { mode: 'auto' }).ok).toBe(true);
    expect(validateToolParams('trim', { start: 0, end: 1 }).ok).toBe(true);
  });

  it('validates input files (50MB mp4 cap)', () => {
    expect(validateInputFile({ mime: 'video/mp4', bytes: 1024 })).toBeNull();
    expect(validateInputFile({ mime: null, bytes: 1024 })).toBeNull();
    const tooBig = validateInputFile({ mime: 'video/mp4', bytes: 50 * 1024 * 1024 + 1 });
    expect(tooBig).toMatchObject({ code: 'FILE_TOO_LARGE' });
    expect(validateInputFile({ mime: 'video/mp4', bytes: 0 })).toMatchObject({ code: 'FILE_EMPTY' });
    expect(validateInputFile({ mime: 'video/avi', bytes: 1024 })).toMatchObject({
      code: 'INVALID_FILE_TYPE',
    });
  });

  it('walks the video-job state machine', () => {
    expect(canTransitionVideoJob('queued', 'processing')).toBe(true);
    expect(canTransitionVideoJob('queued', 'done')).toBe(false);
    expect(canTransitionVideoJob('processing', 'done')).toBe(true);
    expect(canTransitionVideoJob('processing', 'queued')).toBe(false);
    expect(canTransitionVideoJob('done', 'failed')).toBe(false);
    expect(VIDEO_JOB_PRICE_PAISE).toBe(3900);
  });

  it('decodes strict base64', () => {
    const b = decodeB64Strict('x', Buffer.from('hi').toString('base64'));
    expect(b.toString()).toBe('hi');
    expect(() => decodeB64Strict('x', '!!!not-base64!!!')).toThrow();
    expect(() => decodeB64Strict('x', '')).toThrow();
  });
});

/* ---------------- route integration ---------------- */

const mockAuth = vi.hoisted(() => ({ userId: 'vuser-1' as string | null }));

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
let manualUpi: typeof import('@/lib/payments/manual-upi');

function reqJson(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function reqForm(path: string, fields: Record<string, string>, file?: { name: string; bytes: Buffer; type: string }): NextRequest {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (file) {
    fd.append('video', new File([new Uint8Array(file.bytes)], file.name, { type: file.type }));
  }
  return new NextRequest(`http://localhost${path}`, { method: 'POST', body: fd });
}

async function json(res: Response): Promise<{ status: number; body: any }> {
  return { status: res.status, body: await res.json().catch(() => null) };
}

const MP4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0xde, 0xad, 0xbe, 0xef]);
const NOT_MP4 = Buffer.from('this is not a video file at all....');

async function seedUser(id: string) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id, email: `${id}@vidish.dev`, name: id })
    .onConflictDoNothing();
}

beforeAll(async () => {
  const files = [
    'app/api/video-jobs/route.ts',
    'app/api/video-jobs/clips/route.ts',
    'app/api/video-jobs/[id]/status/route.ts',
    'app/api/video-jobs/[id]/preview/route.ts',
    'app/api/video-jobs/[id]/clean/route.ts',
    'app/api/video-jobs/[id]/payment/route.ts',
    'app/api/admin/video-jobs/claim/route.ts',
    'app/api/admin/video-jobs/[id]/input/route.ts',
    'app/api/admin/video-jobs/deliver/route.ts',
  ];
  for (const f of files) {
    const mod = (await import(pathToFileURL(resolve(process.cwd(), f)).href)) as Record<string, unknown>;
    for (const m of ['GET', 'POST']) {
      if (typeof mod[m] === 'function') handlers.set(`${m} ${f}`, mod[m] as Handler);
    }
  }
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  manualUpi = await import('@/lib/payments/manual-upi');
  await client.runMigrations();
  // Apply the 0007 migration manually (coordinator registers it in
  // migrations-data.ts later; IF NOT EXISTS keeps this idempotent).
  const migrationSql = readFileSync(resolve(process.cwd(), 'drizzle/0007_video_jobs.sql'), 'utf8');
  const db = client.getDb();
  for (const stmt of migrationSql.split('--> statement-breakpoint')) {
    const trimmed = stmt.trim();
    if (trimmed) await db.execute(sql.raw(trimmed));
  }
  await seedUser('vuser-1');
  await seedUser('vuser-2');
}, 180_000);

function h(method: 'GET' | 'POST', file: string): Handler {
  const handler = handlers.get(`${method} ${file}`);
  expect(handler, `${method} ${file}`).toBeTypeOf('function');
  return handler!;
}

function ttsForm(overrides: Record<string, string> = {}, file?: { name: string; bytes: Buffer; type: string }) {
  return reqForm(
    '/api/video-jobs',
    {
      tool: 'tts',
      params: JSON.stringify({ script: 'hello world', voice: 'warm', sourceKind: 'upload', ...overrides }),
    },
    file ?? { name: 'clip.mp4', bytes: MP4, type: 'video/mp4' }
  );
}

describe('POST /api/video-jobs', () => {
  const FILE = 'app/api/video-jobs/route.ts';

  it('401s when unauthenticated', async () => {
    mockAuth.userId = null;
    const res = await h('POST', FILE)(ttsForm(), { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    mockAuth.userId = 'vuser-1';
  });

  it('creates a queued tts job + ₹39 order', async () => {
    mockAuth.userId = 'vuser-1';
    const res = await h('POST', FILE)(ttsForm(), { params: Promise.resolve({}) });
    const { status, body } = await json(res);
    expect(status).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.tool).toBe('tts');
    expect(body.pricePaise).toBe(3900);
    expect(body.watchUrl).toContain('/video-studio/watch/');
    expect(body.payment?.code).toBeTruthy();
    expect(body.payment?.amountPaise).toBe(3900);

    const db = client.getDb();
    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, body.id));
    expect(rows[0]).toMatchObject({ userId: 'vuser-1', tool: 'tts', status: 'queued', unlocked: false, priceCents: 3900 });
    const links = await db.select().from(schema.videoJobOrders).where(eq(schema.videoJobOrders.videoJobId, body.id));
    expect(links[0]?.purpose).toBe('video_studio');
  });

  it('creates caption and trim jobs', async () => {
    const cap = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'caption', params: JSON.stringify({ mode: 'auto' }) }, { name: 'v.mp4', bytes: MP4, type: 'video/mp4' }),
      { params: Promise.resolve({}) }
    );
    expect(cap.status).toBe(201);
    const trim = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'trim', params: JSON.stringify({ start: 1, end: 5 }) }, { name: 'v.mp4', bytes: MP4, type: 'video/mp4' }),
      { params: Promise.resolve({}) }
    );
    expect(trim.status).toBe(201);
  });

  it('400s on bad tool, bad params, missing video', async () => {
    const badTool = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'edit', params: '{}' }, { name: 'v.mp4', bytes: MP4, type: 'video/mp4' }),
      { params: Promise.resolve({}) }
    );
    expect(badTool.status).toBe(400);
    const badParams = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'trim', params: JSON.stringify({ start: 9, end: 2 }) }, { name: 'v.mp4', bytes: MP4, type: 'video/mp4' }),
      { params: Promise.resolve({}) }
    );
    expect(badParams.status).toBe(400);
    const noVideo = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'caption', params: JSON.stringify({ mode: 'auto' }) }),
      { params: Promise.resolve({}) }
    );
    expect(noVideo.status).toBe(400);
  });

  it('400s on non-mp4 magic', async () => {
    const res = await h('POST', FILE)(
      ttsForm({}, { name: 'clip.mp4', bytes: NOT_MP4, type: 'video/mp4' }),
      { params: Promise.resolve({}) }
    );
    expect(res.status).toBe(400);
    const { body } = await json(res);
    expect(body.code).toBe('INVALID_FILE_TYPE');
  });

  it('accepts a tts job sourced from the user\'s own clip', async () => {
    const db = client.getDb();
    const [gen] = await db
      .insert(schema.generations)
      .values({
        userId: 'vuser-1',
        prompt: 'a clip',
        mediaType: 'video',
        tier: 'paid',
        status: 'done',
        mime: 'video/mp4',
        watermarked: MP4,
        unlocked: false,
      })
      .returning({ id: schema.generations.id });
    const res = await h('POST', FILE)(
      ttsForm({ sourceKind: 'clip', generationId: gen.id }),
      { params: Promise.resolve({}) }
    );
    const { status, body } = await json(res);
    expect(status).toBe(201);
    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, body.id));
    expect(rows[0]?.inputMime).toBe('video/mp4');
  });

  it('403s when the clip belongs to someone else', async () => {
    const db = client.getDb();
    const [gen] = await db
      .insert(schema.generations)
      .values({
        userId: 'vuser-2',
        prompt: 'their clip',
        mediaType: 'video',
        tier: 'paid',
        status: 'done',
        mime: 'video/mp4',
        watermarked: MP4,
        unlocked: false,
      })
      .returning({ id: schema.generations.id });
    const res = await h('POST', FILE)(
      ttsForm({ sourceKind: 'clip', generationId: gen.id }),
      { params: Promise.resolve({}) }
    );
    expect(res.status).toBe(403);
  });
});

describe('video-job status / preview / clean gating', () => {
  const STATUS = 'app/api/video-jobs/[id]/status/route.ts';
  const PREVIEW = 'app/api/video-jobs/[id]/preview/route.ts';
  const CLEAN = 'app/api/video-jobs/[id]/clean/route.ts';
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  let jobId = '';

  it('creates a job to gate', async () => {
    const res = await h('POST', 'app/api/video-jobs/route.ts')(ttsForm(), ctx(''));
    const { body } = await json(res);
    jobId = body.id;
    expect(jobId).toBeTruthy();
  });

  it('owner sees status; stranger gets 403; missing gets 404', async () => {
    mockAuth.userId = 'vuser-1';
    const ok = await json(await h('GET', STATUS)(reqJson('GET', `/s/${jobId}`), ctx(jobId)));
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ tool: 'tts', status: 'queued', unlocked: false });
    mockAuth.userId = 'vuser-2';
    expect((await h('GET', STATUS)(reqJson('GET', `/s/${jobId}`), ctx(jobId))).status).toBe(403);
    expect(
      (await h('GET', STATUS)(reqJson('GET', '/s/nope'), ctx('00000000-0000-0000-0000-000000000000'))).status
    ).toBe(404);
    mockAuth.userId = 'vuser-1';
  });

  it('preview 404s before delivery; clean 402s while locked', async () => {
    expect((await h('GET', PREVIEW)(reqJson('GET', '/p'), ctx(jobId))).status).toBe(404);
    const clean = await h('GET', CLEAN)(reqJson('GET', '/c'), ctx(jobId));
    expect(clean.status).toBe(402);
    expect((await json(clean)).body.code).toBe('LOCKED');
  });
});

describe('admin claim / input / deliver', () => {
  const CLAIM = 'app/api/admin/video-jobs/claim/route.ts';
  const INPUT = 'app/api/admin/video-jobs/[id]/input/route.ts';
  const DELIVER = 'app/api/admin/video-jobs/deliver/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };
  let jobId = '';

  it('rejects without admin token', async () => {
    const res = await h('POST', CLAIM)(reqJson('POST', '/c', { action: 'claim' }), {
      params: Promise.resolve({}),
    });
    expect(res.status).toBe(401);
  });

  it('claims, stages, serves input, delivers', async () => {
    const db = client.getDb();
    // isolate: earlier tests left queued jobs behind — fail them so the
    // claim below picks exactly the job we create here.
    await db.execute(sql`UPDATE video_jobs SET status = 'failed' WHERE status = 'queued'`);

    const created = await h('POST', 'app/api/video-jobs/route.ts')(ttsForm(), {
      params: Promise.resolve({}),
    });
    jobId = (await json(created)).body.id;

    const claimed = await json(
      await h('POST', CLAIM)(reqJson('POST', '/c', { action: 'claim', limit: 1 }, admin), {
        params: Promise.resolve({}),
      })
    );
    expect(claimed.status).toBe(200);
    expect(claimed.body.claimed).toHaveLength(1);
    expect(claimed.body.claimed[0]).toMatchObject({ id: jobId, tool: 'tts' });
    expect(claimed.body.claimed[0]).not.toHaveProperty('input');

    const staged = await h('POST', CLAIM)(
      reqJson('POST', '/c', { action: 'stage', id: jobId, stage: 'Mixing audio' }, admin),
      { params: Promise.resolve({}) }
    );
    expect(staged.status).toBe(200);

    const input = await h('GET', INPUT)(reqJson('GET', '/i', undefined, admin), {
      params: Promise.resolve({ id: jobId }),
    });
    expect(input.status).toBe(200);
    expect(input.headers.get('content-type')).toBe('video/mp4');

    const wm = MP4.toString('base64');
    const delivered = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: jobId, watermarked_b64: wm, clean_b64: wm, mime: 'video/mp4' }, admin),
        { params: Promise.resolve({}) }
      )
    );
    expect(delivered.status).toBe(200);
    expect(delivered.body).toMatchObject({ ok: true, status: 'done' });

    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, jobId));
    expect(rows[0]).toMatchObject({ status: 'done', unlocked: false });

    // preview now serves; clean still 402 until payment verified
    const preview = await h('GET', 'app/api/video-jobs/[id]/preview/route.ts')(
      reqJson('GET', '/p'),
      { params: Promise.resolve({ id: jobId }) }
    );
    expect(preview.status).toBe(200);
    const clean = await h('GET', 'app/api/video-jobs/[id]/clean/route.ts')(
      reqJson('GET', '/c'),
      { params: Promise.resolve({ id: jobId }) }
    );
    expect(clean.status).toBe(402);
  });

  it('deliver rejects non-mp4 and bad states', async () => {
    // fresh queued job: non-mp4 deliverable → 400 (mime check after auth/id checks)
    const created = await h('POST', 'app/api/video-jobs/route.ts')(ttsForm(), {
      params: Promise.resolve({}),
    });
    const freshId = (await json(created)).body.id;
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64');
    const bad = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: freshId, watermarked_b64: png, clean_b64: png, mime: 'video/mp4' }, admin),
        { params: Promise.resolve({}) }
      )
    );
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('INVALID_FILE_TYPE');

    // re-delivering the already-done job → 409 (state machine wins)
    const redeliver = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: jobId, watermarked_b64: MP4.toString('base64'), clean_b64: MP4.toString('base64'), mime: 'video/mp4' }, admin),
        { params: Promise.resolve({}) }
      )
    );
    expect(redeliver.status).toBe(409);
    expect(redeliver.body.code).toBe('INVALID_STATE');
  });

  it('fail marks a queued job failed', async () => {
    const created = await h('POST', 'app/api/video-jobs/route.ts')(ttsForm(), {
      params: Promise.resolve({}),
    });
    const id = (await json(created)).body.id;
    const failed = await h('POST', CLAIM)(
      reqJson('POST', '/c', { action: 'fail', id, error: 'boom' }, admin),
      { params: Promise.resolve({}) }
    );
    expect(failed.status).toBe(200);
    const db = client.getDb();
    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, id));
    expect(rows[0]).toMatchObject({ status: 'failed', error: 'boom' });
  });
});

describe('payment verify unlocks the clean video', () => {
  it('verifyPaymentOrder flips video_jobs.unlocked via video_job_orders', async () => {
    mockAuth.userId = 'vuser-1';
    const created = await h('POST', 'app/api/video-jobs/route.ts')(ttsForm(), {
      params: Promise.resolve({}),
    });
    const { body } = await json(created);
    const jobId = body.id as string;
    const code = body.payment.code as string;

    await manualUpi.submitPaymentUtr({ code, utrReference: '412345678901', userId: 'vuser-1' });
    const res = await manualUpi.verifyPaymentOrder({ code, adminUserId: 'admin' });
    expect(res.status).toBe('PAYMENT_VERIFIED');

    const db = client.getDb();
    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, jobId));
    expect(rows[0]?.unlocked).toBe(true);

    // clean download now serves
    const clean = await h('GET', 'app/api/video-jobs/[id]/clean/route.ts')(
      reqJson('GET', '/c'),
      { params: Promise.resolve({ id: jobId }) }
    );
    // not delivered yet → 404 (unlocked gate passed, delivery gate next)
    expect(clean.status).toBe(404);
    expect((await json(clean)).body.code).toBe('NOT_READY');
  });
});
