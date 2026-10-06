/**
 * W1-BUGFIX empirical probe: drive the REAL POST /api/generation/start
 * handler with a multipart body (the paid reference-upload path) against
 * in-process PGlite. Verifies end-to-end: multipart parse -> validation ->
 * bytea insert -> payment order.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({ userId: 'uploader-1' as string | null }));

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
              JSON.stringify({ code: 'LOGIN_REQUIRED' }),
              { status: 401, headers: { 'content-type': 'application/json' } }
            ),
          }
    ),
}));

delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.ORDERS_ACCEPTING = 'true';

type Handler = (req: NextRequest) => Promise<Response>;

let POST: Handler;
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(async () => {
  const mod = (await import(
    pathToFileURL(resolve(process.cwd(), 'app/api/generation/start/route.ts')).href
  )) as Record<string, unknown>;
  POST = mod.POST as Handler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  await client.runMigrations();
}, 180_000);

async function seedJobAndQuote(userId: string) {
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({ id: userId, email: `${userId}@vidish.dev`, name: userId })
    .onConflictDoNothing();
  const [job] = await db
    .insert(schema.generationJobs)
    .values({ userId, state: 'QUOTED', prompt: 'a test image' })
    .returning({ id: schema.generationJobs.id });
  const [quote] = await db
    .insert(schema.quotes)
    .values({
      jobId: job.id,
      breakdown: { base: 1900 },
      totalPaise: 1900,
      expiresAt: new Date(Date.now() + 3600_000),
    })
    .returning({ id: schema.quotes.id });
  return { jobId: job.id, quoteId: quote.id };
}

function multipartReq(quoteId: string, files: File[]): NextRequest {
  const form = new FormData();
  form.append('quoteId', quoteId);
  form.append('country', 'IN');
  for (const f of files) form.append('files', f);
  return new NextRequest('http://localhost/api/generation/start', {
    method: 'POST',
    body: form,
  });
}

describe('POST /api/generation/start multipart (paid reference upload)', () => {
  it('stores attached reference files as bytea and returns a payment order', async () => {
    const { quoteId, jobId } = await seedJobAndQuote('uploader-1');
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xde, 0xad, 0xbe, 0xef]);
    const file = new File([bytes], 'ref.png', { type: 'image/png' });
    const res = await POST(multipartReq(quoteId, [file]));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(200);
    expect(body?.jobId).toBe(jobId);
    expect(body?.payment?.code).toBeTruthy();

    const db = client.getDb();
    const rows = await db
      .select()
      .from(schema.generationAttachments)
      .where(eq(schema.generationAttachments.generationId, jobId));
    expect(rows).toHaveLength(1);
    expect(rows[0].filename).toBe('ref.png');
    expect(rows[0].mimeType).toBe('image/png');
    expect(rows[0].byteSize).toBe(bytes.length);
    const stored = Buffer.isBuffer(rows[0].data)
      ? rows[0].data
      : Buffer.from(rows[0].data as unknown as Uint8Array);
    expect(stored.equals(bytes)).toBe(true);
  });

  it('rejects an oversized file server-side with a user-safe error', async () => {
    const { quoteId } = await seedJobAndQuote('uploader-1');
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'huge.png', {
      type: 'image/png',
    });
    const res = await POST(multipartReq(quoteId, [big]));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(400);
    expect(body?.code).toBe('INVALID_ATTACHMENTS');
    expect(typeof body?.error).toBe('string');
  });

  it('rejects a disallowed type server-side', async () => {
    const { quoteId } = await seedJobAndQuote('uploader-1');
    const evil = new File(['x'], 'run.exe', { type: 'application/x-msdownload' });
    const res = await POST(multipartReq(quoteId, [evil]));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(400);
    expect(body?.code).toBe('INVALID_ATTACHMENTS');
  });
});
