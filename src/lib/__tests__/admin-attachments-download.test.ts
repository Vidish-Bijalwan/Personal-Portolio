/**
 * W1-BUGFIX empirical probe: GET /api/admin/fulfillment/attachments/[id]
 * streams the stored bytea back with correct headers.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({}));

delete process.env.DATABASE_URL;
process.env.ADMIN_TOKEN = 'test-admin-token';

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) => Promise<Response>;

let GET: Handler;
let schema: typeof import('@/lib/db/schema');
let client: typeof import('@/lib/db/client');

beforeAll(async () => {
  const mod = (await import(
    pathToFileURL(
      resolve(process.cwd(), 'app/api/admin/fulfillment/attachments/[id]/route.ts')
    ).href
  )) as Record<string, unknown>;
  GET = mod.GET as Handler;
  schema = await import('@/lib/db/schema');
  client = await import('@/lib/db/client');
  await client.runMigrations();
}, 180_000);

describe('GET /api/admin/fulfillment/attachments/[id]', () => {
  it('streams stored bytes with safe headers', async () => {
    const db = client.getDb();
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xde, 0xad]);
    const [job] = await db
      .insert(schema.generationJobs)
      .values({ state: 'QUOTED', prompt: 'x' })
      .returning({ id: schema.generationJobs.id });
    const [att] = await db
      .insert(schema.generationAttachments)
      .values({
        generationId: job.id,
        filename: 'ref.png',
        mimeType: 'image/png',
        byteSize: bytes.length,
        data: bytes,
      })
      .returning({ id: schema.generationAttachments.id });

    const req = new NextRequest(
      `http://localhost/api/admin/fulfillment/attachments/${att.id}`,
      { headers: { 'x-admin-token': 'test-admin-token' } }
    );
    const res = await GET(req, { params: Promise.resolve({ id: att.id }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    const out = Buffer.from(await res.arrayBuffer());
    expect(out.equals(bytes)).toBe(true);
  });

  it('401s without the admin token', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/fulfillment/attachments/whatever'
    );
    const res = await GET(req, { params: Promise.resolve({ id: 'whatever' }) });
    expect(res.status).toBe(401);
  });

  it('404s for a missing attachment', async () => {
    const req = new NextRequest(
      'http://localhost/api/admin/fulfillment/attachments/00000000-0000-0000-0000-000000000000',
      { headers: { 'x-admin-token': 'test-admin-token' } }
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }),
    });
    expect(res.status).toBe(404);
  });
});
