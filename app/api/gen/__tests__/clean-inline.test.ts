/**
 * ?inline=1 on GET /api/gen/[id]/clean.
 *
 * Drives the REAL route handler with mocked auth + access (no PGlite):
 *
 *  1. Default (no param) serves attachment; ?inline=1 serves inline.
 *  2. The unlocked gate is identical either way — a locked generation
 *     still gets 402 with ?inline=1 (no watermark bypass).
 *  3. 404 when not done / no clean bytes, with or without inline.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';

const mockAuth = vi.hoisted(() => ({ userId: 'u1' as string | null }));
const mockAccess = vi.hoisted(() => ({
  gen: null as Record<string, unknown> | null,
}));

vi.mock('@/lib/auth', () => ({
  requireSession: () =>
    Promise.resolve(
      mockAuth.userId
        ? {
            user: { id: mockAuth.userId, email: 'u@x.dev' },
            response: null,
          }
        : {
            user: null,
            response: new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
              status: 401,
              headers: { 'content-type': 'application/json' },
            }),
          }
    ),
}));

vi.mock('@/lib/free/access', () => ({
  getOwnedGeneration: () =>
    Promise.resolve(
      mockAccess.gen ? { gen: mockAccess.gen } : { error: new Response('nf', { status: 404 }) }
    ),
  toBuffer: (b: unknown) => (b instanceof Uint8Array ? Buffer.from(b) : null),
}));

type Handler = (req: NextRequest, ctx: any) => Promise<Response>;
let cleanGET: Handler;

beforeAll(async () => {
  const href = pathToFileURL(resolve(process.cwd(), 'app/api/gen/[id]/clean/route.ts')).href;
  cleanGET = ((await import(href)) as Record<string, unknown>).GET as Handler;
});

const CLEAN = new Uint8Array([1, 2, 3, 4]);
const ctx = { params: Promise.resolve({ id: 'g1' }) };

function req(inline: boolean): NextRequest {
  return new NextRequest(
    `http://test.local/api/gen/g1/clean${inline ? '?inline=1' : ''}`
  );
}

function setGen(overrides: Record<string, unknown> = {}) {
  mockAccess.gen = {
    id: 'g1',
    unlocked: true,
    status: 'done',
    mime: 'image/jpeg',
    clean: CLEAN,
    ...overrides,
  };
}

describe('GET /api/gen/[id]/clean ?inline=1', () => {
  it('serves attachment by default', async () => {
    setGen();
    const res = await cleanGET(req(false), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-disposition')).toMatch(/^attachment;/);
  });

  it('serves inline with ?inline=1', async () => {
    setGen();
    const res = await cleanGET(req(true), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-disposition')).toMatch(/^inline;/);
  });

  it('still 402 when locked even with ?inline=1 (no bypass)', async () => {
    setGen({ unlocked: false });
    const res = await cleanGET(req(true), ctx);
    expect(res.status).toBe(402);
    expect((await res.json()).code).toBe('LOCKED');
  });

  it('404 when not done, with or without ?inline=1', async () => {
    setGen({ status: 'generating' });
    expect((await cleanGET(req(true), ctx)).status).toBe(404);
    expect((await cleanGET(req(false), ctx)).status).toBe(404);
  });

  it('serves the clean bytes inline', async () => {
    setGen();
    const res = await cleanGET(req(true), ctx);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    expect([...Buffer.from(await res.arrayBuffer())]).toEqual([1, 2, 3, 4]);
  });
});
