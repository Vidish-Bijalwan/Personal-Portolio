/**
 * W1-BUGFIX: free-tier reference uploads.
 * - POST /api/free/generate accepts multipart/form-data with 0-5 reference
 *   files under the shared attachment policy (8MB/file, 20MB total, 5 max),
 *   stores them as bytea on free_generation_attachments linked to the
 *   generations row; the JSON path is unchanged.
 * - GET /api/admin/fulfillment/generations/[id]/attachments (x-admin-token)
 *   returns the reference files for the generation watcher.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

const mockAuth = vi.hoisted(() => ({ userId: 'free-uploader' as string | null }));

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
            response: new Response(JSON.stringify({ code: 'LOGIN_REQUIRED' }), {
              status: 401,
              headers: { 'content-type': 'application/json' },
            }),
          }
    ),
}));

delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = 'test-admin-token';

type PostHandler = (req: NextRequest) => Promise<Response>;
type GetHandler = (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) => Promise<Response>;

let freeGenerate: PostHandler;
let getAttachments: GetHandler;
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(async () => {
  const genMod = (await import(
    pathToFileURL(resolve(process.cwd(), 'app/api/free/generate/route.ts')).href
  )) as Record<string, unknown>;
  freeGenerate = genMod.POST as PostHandler;
  const attMod = (await import(
    pathToFileURL(
      resolve(
        process.cwd(),
        'app/api/admin/fulfillment/generations/[id]/attachments/route.ts'
      )
    ).href
  )) as Record<string, unknown>;
  getAttachments = attMod.GET as GetHandler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  await client.runMigrations();
  // Migration 0008 (free_generation_attachments) is registered in
  // migrations-data.ts, so runMigrations() above already created the table.
  const db = client.getDb();
  await db
    .insert(schema.users)
    .values({
      id: 'free-uploader',
      email: 'free-uploader@vidish.dev',
      name: 'free-uploader',
    })
    .onConflictDoNothing();
}, 180_000);

function multipartReq(fields: Record<string, string>, files: File[]): NextRequest {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  for (const f of files) form.append('files', f);
  return new NextRequest('http://localhost/api/free/generate', {
    method: 'POST',
    body: form,
  });
}

function jsonReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/free/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xde, 0xad, 0xbe, 0xef,
]);

describe('POST /api/free/generate multipart', () => {
  it('stores reference files as bytea linked to the generation row', async () => {
    const file = new File([PNG_BYTES], 'mood.png', { type: 'image/png' });
    const res = await freeGenerate(
      multipartReq({ prompt: 'a brass lamp', quality: 'studio' }, [file])
    );
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(201);
    expect(body?.id).toBeTruthy();

    const db = client.getDb();
    const rows = await db
      .select()
      .from(schema.freeGenerationAttachments)
      .where(eq(schema.freeGenerationAttachments.generationId, body.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].filename).toBe('mood.png');
    expect(rows[0].mimeType).toBe('image/png');
    expect(rows[0].byteSize).toBe(PNG_BYTES.length);
    const stored = Buffer.isBuffer(rows[0].data)
      ? rows[0].data
      : Buffer.from(rows[0].data as unknown as Uint8Array);
    expect(stored.equals(PNG_BYTES)).toBe(true);
  });

  it('accepts multipart without files', async () => {
    const res = await freeGenerate(multipartReq({ prompt: 'no refs here' }, []));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(201);
    expect(body?.id).toBeTruthy();
    const db = client.getDb();
    const rows = await db
      .select()
      .from(schema.freeGenerationAttachments)
      .where(eq(schema.freeGenerationAttachments.generationId, body.id));
    expect(rows).toHaveLength(0);
  });

  it('rejects an oversized file with INVALID_ATTACHMENTS (no row created)', async () => {
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'huge.png', {
      type: 'image/png',
    });
    const res = await freeGenerate(multipartReq({ prompt: 'too big' }, [big]));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(400);
    expect(body?.code).toBe('INVALID_ATTACHMENTS');
    expect(typeof body?.error).toBe('string');
  });

  it('rejects a disallowed type with INVALID_ATTACHMENTS', async () => {
    const evil = new File(['x'], 'run.exe', { type: 'application/x-msdownload' });
    const res = await freeGenerate(multipartReq({ prompt: 'evil' }, [evil]));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(400);
    expect(body?.code).toBe('INVALID_ATTACHMENTS');
  });

  it('rejects more than 5 files', async () => {
    const files = Array.from(
      { length: 6 },
      (_, i) => new File(['x'], `f${i}.png`, { type: 'image/png' })
    );
    const res = await freeGenerate(multipartReq({ prompt: 'many' }, files));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(400);
    expect(body?.code).toBe('INVALID_ATTACHMENTS');
  });

  it('keeps the JSON path working (no files)', async () => {
    const res = await freeGenerate(jsonReq({ prompt: 'classic json' }));
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(201);
    expect(body?.id).toBeTruthy();
  });
});

describe('GET /api/admin/fulfillment/generations/[id]/attachments', () => {
  // Fresh users per test: the free tier caps at 3 images/user/IST day.
  async function useFreshUser(tag: string) {
    const userId = `free-${tag}`;
    mockAuth.userId = userId;
    const db = client.getDb();
    await db
      .insert(schema.users)
      .values({ id: userId, email: `${userId}@vidish.dev`, name: userId })
      .onConflictDoNothing();
    return userId;
  }

  it('401s without the admin token', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/fulfillment/generations/x/attachments'
    );
    const res = await getAttachments(req, { params: Promise.resolve({ id: 'x' }) });
    expect(res.status).toBe(401);
  });

  it('404s for an unknown generation', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/fulfillment/generations/00000000-0000-0000-0000-000000000000/attachments',
      { headers: { 'x-admin-token': 'test-admin-token' } }
    );
    const res = await getAttachments(req, {
      params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }),
    });
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(404);
    expect(body?.code).toBe('GENERATION_NOT_FOUND');
  });

  it('returns the reference files with base64 bytes for the watcher', async () => {
    await useFreshUser('watcher-1');
    // Create a generation with an attachment via the multipart route.
    const file = new File([PNG_BYTES], 'watcher-ref.png', { type: 'image/png' });
    const genRes = await freeGenerate(
      multipartReq({ prompt: 'for watcher' }, [file])
    );
    const genBody = (await genRes.json().catch(() => null)) as any;
    expect(genRes.status).toBe(201);
    const genId = genBody.id as string;

    const req = new NextRequest(
      `http://localhost/api/admin/fulfillment/generations/${genId}/attachments`,
      { headers: { 'x-admin-token': 'test-admin-token' } }
    );
    const res = await getAttachments(req, { params: Promise.resolve({ id: genId }) });
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(200);
    expect(body?.generationId).toBe(genId);
    expect(body?.count).toBe(1);
    const att = body?.attachments?.[0];
    expect(att?.filename).toBe('watcher-ref.png');
    expect(att?.mimeType).toBe('image/png');
    expect(att?.byteSize).toBe(PNG_BYTES.length);
    expect(typeof att?.dataBase64).toBe('string');
    expect(Buffer.from(att.dataBase64, 'base64').equals(PNG_BYTES)).toBe(true);
  });

  it('returns an empty list when the generation has no attachments', async () => {
    await useFreshUser('watcher-2');
    const genRes = await freeGenerate(jsonReq({ prompt: 'no attachments' }));
    const genBody = (await genRes.json().catch(() => null)) as any;
    const genId = genBody.id as string;
    const req = new NextRequest(
      `http://localhost/api/admin/fulfillment/generations/${genId}/attachments`,
      { headers: { 'x-admin-token': 'test-admin-token' } }
    );
    const res = await getAttachments(req, { params: Promise.resolve({ id: genId }) });
    const body = (await res.json().catch(() => null)) as any;
    expect(res.status).toBe(200);
    expect(body?.count).toBe(0);
    expect(body?.attachments).toEqual([]);
  });
});
