/**
 * Pixaura — tests for the Video Studio Phase 4 tools
 * (compress, convert, gif, add-audio, denoise).
 *
 * Pure validation tests run without a DB; route tests run against
 * in-process PGlite (DATABASE_URL unset), with @/lib/auth mocked to a
 * switchable test user — same harness as video-studio.test.ts.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import {
  audioMimeForMagic,
  decodeB64Strict,
  gifMimeForMagic,
  isValidTool,
  validateAddAudioParams,
  validateAudioFile,
  validateCompressParams,
  validateConvertParams,
  validateDenoiseParams,
  validateGifParams,
  validateToolParams,
} from '@/lib/video/validate';
import {
  TOOL_OUTPUT_MIME,
  VIDEO_JOB_PRICE_PAISE,
  VIDEO_TOOLS,
} from '@/lib/video/constants';
import { priceOf } from '@/lib/pricing/catalog';
import { formatINR } from '@/lib/vilish/types';
import { progressForStage } from '@/lib/vilish/progress';

/* ---------------- pure validation ---------------- */

describe('phase 4 tool registry', () => {
  it('registers exactly the eight real tools', () => {
    expect(VIDEO_TOOLS).toEqual([
      'tts',
      'caption',
      'trim',
      'compress',
      'convert',
      'gif',
      'add-audio',
      'denoise',
    ]);
    for (const t of ['compress', 'convert', 'gif', 'add-audio', 'denoise']) {
      expect(isValidTool(t)).toBe(true);
    }
    expect(isValidTool('dubbing')).toBe(false);
    expect(isValidTool('talking-photo')).toBe(false);
    expect(isValidTool('voice-clone')).toBe(false);
    expect(isValidTool(null)).toBe(false);
  });

  it('prices every tool from the real catalog — no hardcoded paise', () => {
    expect(VIDEO_JOB_PRICE_PAISE).toBe(priceOf('video-studio'));
    expect(VIDEO_JOB_PRICE_PAISE).toBe(3900);
    expect(formatINR(priceOf('video-studio'))).toBe('₹39');
  });

  it('maps each tool to its real output mime', () => {
    expect(TOOL_OUTPUT_MIME.compress).toBe('video/mp4');
    expect(TOOL_OUTPUT_MIME.convert).toBe('audio/mpeg');
    expect(TOOL_OUTPUT_MIME.gif).toBe('image/gif');
    expect(TOOL_OUTPUT_MIME['add-audio']).toBe('video/mp4');
    expect(TOOL_OUTPUT_MIME.denoise).toBe('video/mp4');
  });
});

describe('phase 4 params validation', () => {
  it('validates compress params', () => {
    expect(validateCompressParams({ quality: 'balanced' }).ok).toBe(true);
    expect(validateCompressParams({ quality: 'small' }).ok).toBe(true);
    expect(validateCompressParams({ quality: 'best' }).ok).toBe(true);
    expect(validateCompressParams({ quality: 'ultra' }).ok).toBe(false);
    expect(validateCompressParams({}).ok).toBe(false);
    expect(validateCompressParams(null).ok).toBe(false);
  });

  it('validates convert params', () => {
    expect(validateConvertParams({}).ok).toBe(true);
    expect(validateConvertParams(undefined).ok).toBe(true);
    expect(validateConvertParams('nope').ok).toBe(false);
  });

  it('validates gif params', () => {
    const good = validateGifParams({ start: 1, end: 6, fps: 12, width: 480 });
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.value).toMatchObject({ start: 1, end: 6, fps: 12, width: 480 });
    }
    expect(validateGifParams({ start: 1, end: 6, fps: 30, width: 480 }).ok).toBe(false);
    expect(validateGifParams({ start: 1, end: 6, fps: 12, width: 1920 }).ok).toBe(false);
    expect(validateGifParams({ start: 0, end: 12, fps: 12, width: 480 }).ok).toBe(false); // >10s
    expect(validateGifParams({ start: 6, end: 6, fps: 12, width: 480 }).ok).toBe(false);
    expect(validateGifParams({ start: -1, end: 5, fps: 12, width: 480 }).ok).toBe(false);
  });

  it('validates add-audio params', () => {
    expect(validateAddAudioParams({ mode: 'mix' }).ok).toBe(true);
    expect(validateAddAudioParams({ mode: 'replace' }).ok).toBe(true);
    expect(validateAddAudioParams({ mode: 'overlay' }).ok).toBe(false);
    expect(validateAddAudioParams({}).ok).toBe(false);
  });

  it('validates denoise params', () => {
    expect(validateDenoiseParams({ strength: 'light' }).ok).toBe(true);
    expect(validateDenoiseParams({ strength: 'medium' }).ok).toBe(true);
    expect(validateDenoiseParams({ strength: 'strong' }).ok).toBe(true);
    expect(validateDenoiseParams({ strength: 'max' }).ok).toBe(false);
    expect(validateDenoiseParams({}).ok).toBe(false);
  });

  it('dispatches per new tool', () => {
    expect(validateToolParams('compress', { quality: 'small' }).ok).toBe(true);
    expect(validateToolParams('convert', {}).ok).toBe(true);
    expect(validateToolParams('gif', { start: 0, end: 5, fps: 10, width: 320 }).ok).toBe(true);
    expect(validateToolParams('add-audio', { mode: 'replace' }).ok).toBe(true);
    expect(validateToolParams('denoise', { strength: 'light' }).ok).toBe(true);
    expect(validateToolParams('compress', { quality: 'nope' }).ok).toBe(false);
  });
});

describe('audio + gif magic detection', () => {
  const mp3Id3 = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x21, 0x76]);
  const mp3Frame = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const wav = Buffer.from('RIFF....WAVEfmt .......');
  const m4a = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20]);
  const gif89 = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x10, 0x00]);
  const gif87 = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61, 0x10, 0x00]);
  const mp4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

  it('detects mp3, wav, m4a', () => {
    expect(audioMimeForMagic(mp3Id3)).toBe('audio/mpeg');
    expect(audioMimeForMagic(mp3Frame)).toBe('audio/mpeg');
    expect(audioMimeForMagic(wav)).toBe('audio/wav');
    expect(audioMimeForMagic(m4a)).toBe('audio/mp4');
    expect(audioMimeForMagic(mp4)).toBe(null); // plain mp4 video is not audio
    expect(audioMimeForMagic(Buffer.from('junk'))).toBe(null);
  });

  it('detects gif87a/gif89a', () => {
    expect(gifMimeForMagic(gif89)).toBe('image/gif');
    expect(gifMimeForMagic(gif87)).toBe('image/gif');
    expect(gifMimeForMagic(mp4)).toBe(null);
    expect(gifMimeForMagic(Buffer.from('junk'))).toBe(null);
  });

  it('validates audio files (20MB cap, mp3/wav/m4a)', () => {
    expect(validateAudioFile({ mime: 'audio/mpeg', bytes: 1024 })).toBeNull();
    expect(validateAudioFile({ mime: null, bytes: 1024 })).toBeNull();
    const tooBig = validateAudioFile({ mime: 'audio/mpeg', bytes: 20 * 1024 * 1024 + 1 });
    expect(tooBig).toMatchObject({ code: 'FILE_TOO_LARGE' });
    expect(validateAudioFile({ mime: 'audio/mpeg', bytes: 0 })).toMatchObject({ code: 'FILE_EMPTY' });
    expect(validateAudioFile({ mime: 'video/mp4', bytes: 1024 })).toMatchObject({
      code: 'INVALID_FILE_TYPE',
    });
  });

  it('strict base64 still rejects garbage', () => {
    expect(() => decodeB64Strict('x', '!!!not-base64!!!')).toThrow();
  });
});

describe('phase 4 watcher stage labels map to real progress', () => {
  it('every new tool stage lands on the progress bar', () => {
    const stages: Array<[string, number]> = [
      ['Compressing your video', 60],
      ['Extracting your audio', 60],
      ['Building your GIF', 60],
      ['Mixing in your audio', 60],
      ['Cleaning background noise', 55],
    ];
    for (const [stage, pct] of stages) {
      expect(progressForStage(stage, 'processing')).toBe(pct);
    }
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

function reqForm(
  path: string,
  fields: Record<string, string>,
  file?: { name: string; bytes: Buffer; type: string },
  audioFile?: { name: string; bytes: Buffer; type: string }
): NextRequest {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (file) {
    fd.append('video', new File([new Uint8Array(file.bytes)], file.name, { type: file.type }));
  }
  if (audioFile) {
    fd.append('audio', new File([new Uint8Array(audioFile.bytes)], audioFile.name, { type: audioFile.type }));
  }
  return new NextRequest(`http://localhost${path}`, { method: 'POST', body: fd });
}

async function json(res: Response): Promise<{ status: number; body: any }> {
  return { status: res.status, body: await res.json().catch(() => null) };
}

const MP4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0xde, 0xad, 0xbe, 0xef]);
const MP3 = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x21, 0x76, 0xde, 0xad, 0xbe, 0xef]);
const GIF = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x10, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00]);

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
    'app/api/video-jobs/[id]/status/route.ts',
    'app/api/video-jobs/[id]/preview/route.ts',
    'app/api/video-jobs/[id]/clean/route.ts',
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
  await client.runMigrations();
  // Apply the 0007 + 0010 migrations manually (the coordinator registers
  // them in migrations-data.ts; IF NOT EXISTS / ADD COLUMN guarded by
  // the test's own checks keep this idempotent).
  const db = client.getDb();
  const migrationSql = readFileSync(resolve(process.cwd(), 'drizzle/0007_video_jobs.sql'), 'utf8');
  for (const stmt of migrationSql.split('--> statement-breakpoint')) {
    const trimmed = stmt.trim();
    if (trimmed) await db.execute(sql.raw(trimmed));
  }
  // 0010 adds input2 columns via runMigrations above (embedded in
  // migrations-data.ts) — assert the columns exist rather than
  // re-applying (duplicate_column on re-runs).
  const cols = await db.execute(
    sql.raw(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'video_jobs' AND column_name IN ('input2','input2_mime')`
    )
  );
  const names = (cols as unknown as { rows: Array<{ column_name: string }> }).rows.map(
    (r) => r.column_name
  );
  expect(names).toContain('input2');
  expect(names).toContain('input2_mime');
  await seedUser('vuser-1');
}, 180_000);

function h(method: 'GET' | 'POST', file: string): Handler {
  const handler = handlers.get(`${method} ${file}`);
  expect(handler, `${method} ${file}`).toBeTypeOf('function');
  return handler!;
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe('POST /api/video-jobs — phase 4 tools', () => {
  const FILE = 'app/api/video-jobs/route.ts';
  const VID = { name: 'clip.mp4', bytes: MP4, type: 'video/mp4' };
  const AUD = { name: 'track.mp3', bytes: MP3, type: 'audio/mpeg' };

  it('creates compress/convert/gif/denoise jobs with real output mimes', async () => {
    mockAuth.userId = 'vuser-1';
    const cases: Array<[string, Record<string, string>, string]> = [
      ['compress', { quality: 'balanced' }, 'video/mp4'],
      ['convert', {}, 'audio/mpeg'],
      ['gif', { start: 1, end: 5, fps: 12, width: 480 }, 'image/gif'],
      ['denoise', { strength: 'medium' }, 'video/mp4'],
    ];
    for (const [tool, params, mime] of cases) {
      const res = await h('POST', FILE)(
        reqForm('/api/video-jobs', { tool, params: JSON.stringify(params) }, VID),
        ctx('')
      );
      const { status, body } = await json(res);
      expect(status).toBe(201);
      expect(body.tool).toBe(tool);
      expect(body.pricePaise).toBe(3900);
      const db = client.getDb();
      const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, body.id));
      expect(rows[0]).toMatchObject({ tool, mime, status: 'queued', priceCents: 3900 });
    }
  });

  it('400s on garbage params for the new tools', async () => {
    const bad = [
      ['compress', { quality: 'ultra' }],
      ['gif', { start: 0, end: 30, fps: 12, width: 480 }],
      ['gif', { start: 1, end: 5, fps: 60, width: 480 }],
      ['add-audio', { mode: 'karaoke' }],
      ['denoise', { strength: 'extreme' }],
    ] as Array<[string, Record<string, unknown>]>;
    for (const [tool, params] of bad) {
      const res = await h('POST', FILE)(
        reqForm('/api/video-jobs', { tool, params: JSON.stringify(params) }, VID),
        ctx('')
      );
      expect(res.status).toBe(400);
    }
  });

  it('requires the audio file for add-audio, stores it as input2', async () => {
    const missing = await h('POST', FILE)(
      reqForm('/api/video-jobs', { tool: 'add-audio', params: JSON.stringify({ mode: 'mix' }) }, VID),
      ctx('')
    );
    expect(missing.status).toBe(400);
    expect((await json(missing)).body.code).toBe('MISSING_AUDIO');

    const ok = await h('POST', FILE)(
      reqForm(
        '/api/video-jobs',
        { tool: 'add-audio', params: JSON.stringify({ mode: 'replace' }) },
        VID,
        AUD
      ),
      ctx('')
    );
    const { status, body } = await json(ok);
    expect(status).toBe(201);
    const db = client.getDb();
    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, body.id));
    expect(rows[0]?.input2Mime).toBe('audio/mpeg');
    expect(rows[0]?.input2).toBeTruthy();
    expect(rows[0]?.mime).toBe('video/mp4');
  });

  it('400s when the audio upload is not audio', async () => {
    const res = await h('POST', FILE)(
      reqForm(
        '/api/video-jobs',
        { tool: 'add-audio', params: JSON.stringify({ mode: 'mix' }) },
        VID,
        { name: 'fake.mp3', bytes: MP4, type: 'audio/mpeg' }
      ),
      ctx('')
    );
    expect(res.status).toBe(400);
    expect((await json(res)).body.code).toBe('INVALID_FILE_TYPE');
  });
});

describe('admin claim/input/deliver — phase 4 mimes', () => {
  const CLAIM = 'app/api/admin/video-jobs/claim/route.ts';
  const INPUT = 'app/api/admin/video-jobs/[id]/input/route.ts';
  const DELIVER = 'app/api/admin/video-jobs/deliver/route.ts';
  const PREVIEW = 'app/api/video-jobs/[id]/preview/route.ts';
  const admin = { 'x-admin-token': 'test-admin-token' };
  const VID = { name: 'clip.mp4', bytes: MP4, type: 'video/mp4' };
  const AUD = { name: 'track.mp3', bytes: MP3, type: 'audio/mpeg' };

  it('claim exposes input2_mime; ?which=2 serves the audio track', async () => {
    const db = client.getDb();
    await db.execute(sql`UPDATE video_jobs SET status = 'failed' WHERE status IN ('queued','processing')`);

    const created = await h('POST', 'app/api/video-jobs/route.ts')(
      reqForm(
        '/api/video-jobs',
        { tool: 'add-audio', params: JSON.stringify({ mode: 'mix' }) },
        VID,
        AUD
      ),
      ctx('')
    );
    const jobId = (await json(created)).body.id;

    const claimed = await json(
      await h('POST', CLAIM)(reqJson('POST', '/c', { action: 'claim', limit: 1 }, admin), ctx(''))
    );
    expect(claimed.body.claimed).toHaveLength(1);
    expect(claimed.body.claimed[0]).toMatchObject({
      id: jobId,
      tool: 'add-audio',
      input2_mime: 'audio/mpeg',
    });
    expect(claimed.body.claimed[0]).not.toHaveProperty('input');
    expect(claimed.body.claimed[0]).not.toHaveProperty('input2');

    const input2 = await h('GET', INPUT)(
      new NextRequest(`http://localhost/i/${jobId}?which=2`, { headers: admin }),
      ctx(jobId)
    );
    expect(input2.status).toBe(200);
    expect(input2.headers.get('content-type')).toBe('audio/mpeg');
  });

  it('delivers mp3 for convert jobs and gif for gif jobs', async () => {
    const db = client.getDb();
    const mp3b64 = MP3.toString('base64');
    const gifb64 = GIF.toString('base64');

    const conv = await h('POST', 'app/api/video-jobs/route.ts')(
      reqForm('/api/video-jobs', { tool: 'convert', params: '{}' }, VID),
      ctx('')
    );
    const convId = (await json(conv)).body.id;
    const deliveredMp3 = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: convId, watermarked_b64: mp3b64, clean_b64: mp3b64, mime: 'audio/mpeg' }, admin),
        ctx('')
      )
    );
    expect(deliveredMp3.status).toBe(200);
    expect(deliveredMp3.body).toMatchObject({ ok: true, status: 'done' });

    const rows = await db.select().from(schema.videoJobs).where(eq(schema.videoJobs.id, convId));
    expect(rows[0]?.mime).toBe('audio/mpeg');

    const gifJob = await h('POST', 'app/api/video-jobs/route.ts')(
      reqForm('/api/video-jobs', { tool: 'gif', params: JSON.stringify({ start: 0, end: 3, fps: 10, width: 320 }) }, VID),
      ctx('')
    );
    const gifId = (await json(gifJob)).body.id;
    const deliveredGif = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: gifId, watermarked_b64: gifb64, clean_b64: gifb64, mime: 'image/gif' }, admin),
        ctx('')
      )
    );
    expect(deliveredGif.status).toBe(200);

    // preview serves the real mime + extension
    const preview = await h('GET', PREVIEW)(reqJson('GET', '/p'), ctx(convId));
    expect(preview.status).toBe(200);
    expect(preview.headers.get('content-type')).toBe('audio/mpeg');
    expect(preview.headers.get('content-disposition')).toContain('.mp3');
  });

  it('deliver rejects mismatched magic and unknown mimes', async () => {
    const created = await h('POST', 'app/api/video-jobs/route.ts')(
      reqForm('/api/video-jobs', { tool: 'gif', params: JSON.stringify({ start: 0, end: 3, fps: 10, width: 320 }) }, VID),
      ctx('')
    );
    const gifId = (await json(created)).body.id;
    // mp4 bytes claimed as gif → 400
    const bad = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: gifId, watermarked_b64: MP4.toString('base64'), clean_b64: MP4.toString('base64'), mime: 'image/gif' }, admin),
        ctx('')
      )
    );
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('INVALID_FILE_TYPE');
    // unknown mime → 400
    const badMime = await json(
      await h('POST', DELIVER)(
        reqJson('POST', '/d', { id: gifId, watermarked_b64: GIF.toString('base64'), clean_b64: GIF.toString('base64'), mime: 'video/avi' }, admin),
        ctx('')
      )
    );
    expect(badMime.status).toBe(400);
    expect(badMime.body.code).toBe('INVALID_MIME');
  });
});
