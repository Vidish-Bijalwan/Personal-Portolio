/**
 * Etch Phase 2 — contract §5 bundle:
 * GET /api/admin/fulfillment/[id]/bundle → ZIP `VLSH-XXXXXX.zip` containing
 * `<orderCode>/order.json`, `<orderCode>/prompt.txt`,
 * `<orderCode>/references/<file>` with correct contents.
 *
 * Skips gracefully until the API agent lands the route. Storage uses the
 * local driver in a temp dir (no external services, no mocks needed).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

delete process.env.DATABASE_URL;

const ROUTE_FILE = resolve(
  process.cwd(),
  'app/api/admin/fulfillment/[id]/bundle/route.ts'
);
const HAS_ROUTE = existsSync(ROUTE_FILE);

const ADMIN_TOKEN = 'test-admin-token-bundle';

describe.runIf(HAS_ROUTE)('fulfillment bundle ZIP — contract §5', () => {
  let GET: (
    req: NextRequest,
    ctx: { params: Promise<{ id: string }> }
  ) => Promise<Response>;
  let db: ReturnType<typeof import('@/lib/db/client').getDb>;
  let schema: typeof import('@/lib/db/schema');
  let jobId: string;
  let orderCode: string;

  const REF_BYTES_1 = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02, 0x03,
  ]);
  const REF_BYTES_2 = Buffer.from([0xff, 0xd8, 0xff, 0x04, 0x05, 0x06]);
  const REF_KEY_1 = 'refs/peacock-feather-1.png';
  const REF_KEY_2 = 'refs/peacock-feather-2.jpg';
  const PROMPT = 'a peacock feather macro in morning light';

  beforeAll(async () => {
    process.env.ADMIN_TOKEN = ADMIN_TOKEN;
    const client = await import('@/lib/db/client');
    schema = await import('@/lib/db/schema');
    db = client.getDb();
    await client.runMigrations();
    ({ GET } = await import(pathToFileURL(ROUTE_FILE).href));

    const storageDir = await mkdtemp(join(tmpdir(), 'vilish-bundle-'));
    process.env.STORAGE_DRIVER = 'local';
    process.env.STORAGE_DIR = storageDir;
    const { getStorage } = await import('@/lib/storage');
    const storage = getStorage();
    await storage.put(REF_KEY_1, REF_BYTES_1, 'image/png');
    await storage.put(REF_KEY_2, REF_BYTES_2, 'image/jpeg');

    const [user] = await db
      .insert(schema.users)
      .values({ name: 'Bundle User', email: 'bundle@vidish.dev' })
      .returning();
    const [project] = await db
      .insert(schema.projects)
      .values({ userId: user.id, name: 'Bundle project' })
      .returning();

    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        userId: user.id,
        projectId: project.id,
        task: 'text_to_image',
        prompt: PROMPT,
        aspectRatio: '1:1',
        quality: 'studio',
        customerPrice: 2900,
        state: 'OPERATOR_QC',
        fulfillmentMode: 'operator',
        idempotencyKey: crypto.randomUUID(),
      } as Record<string, unknown>)
      .returning();
    jobId = job.id;

    orderCode = `VLSH-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    await db.insert(schema.orders).values({
      code: orderCode,
      jobId: job.id,
      userId: user.id,
      provider: 'manual_upi',
      amountPaise: 2900,
      status: 'PAYMENT_VERIFIED',
      expiresAt: new Date(Date.now() + 3600_000),
    });

    // References attach to the job through the project (kind='reference'),
    // per loadFulfillmentDetail.
    await db.insert(schema.assets).values({
      userId: user.id,
      projectId: project.id,
      kind: 'reference',
      url: `/storage/${REF_KEY_1}`,
      mimeType: 'image/png',
      sizeBytes: REF_BYTES_1.length,
    });
    await db.insert(schema.assets).values({
      userId: user.id,
      projectId: project.id,
      kind: 'reference',
      url: `/storage/${REF_KEY_2}`,
      mimeType: 'image/jpeg',
      sizeBytes: REF_BYTES_2.length,
    });
  }, 120_000);

  function authedGet() {
    const req = new NextRequest(
      `http://localhost/api/admin/fulfillment/${jobId}/bundle`,
      { headers: { 'x-admin-token': ADMIN_TOKEN } }
    );
    return GET(req, { params: Promise.resolve({ id: jobId }) });
  }

  async function loadZip() {
    const res = await authedGet();
    expect(res.status).toBe(200);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buf);
    return { res, zip };
  }

  it('returns a ZIP download named <orderCode>.zip', async () => {
    const { res } = await loadZip();
    expect(res.headers.get('content-type')).toMatch(/zip/i);
    expect(res.headers.get('content-disposition')).toContain(
      `${orderCode}.zip`
    );
  });

  it('rejects unauthenticated requests with 401', async () => {
    const req = new NextRequest(
      `http://localhost/api/admin/fulfillment/${jobId}/bundle`
    );
    const res = await GET(req, { params: Promise.resolve({ id: jobId }) });
    expect(res.status).toBe(401);
  });

  it('contains <order>/order.json with the correct order', async () => {
    const { zip } = await loadZip();
    const entry = zip.file(`${orderCode}/order.json`);
    expect(entry, 'order.json entry').not.toBeNull();
    const parsed = JSON.parse(await entry!.async('string'));
    expect(parsed.orderCode).toBe(orderCode);
    expect(parsed.amountPaise).toBe(2900);
    expect(parsed.jobId).toBe(jobId);
  });

  it('contains <order>/prompt.txt with the customer prompt', async () => {
    const { zip } = await loadZip();
    const entry = zip.file(`${orderCode}/prompt.txt`);
    expect(entry, 'prompt.txt entry').not.toBeNull();
    const text = await entry!.async('string');
    expect(text).toContain(PROMPT);
  });

  it('contains <order>/references/<file> with byte-identical contents', async () => {
    const { zip } = await loadZip();
    const name1 = `${orderCode}/references/${basename(REF_KEY_1)}`;
    const name2 = `${orderCode}/references/${basename(REF_KEY_2)}`;
    const e1 = zip.file(name1);
    const e2 = zip.file(name2);
    expect(e1, name1).not.toBeNull();
    expect(e2, name2).not.toBeNull();
    const b1 = await e1!.async('nodebuffer');
    const b2 = await e2!.async('nodebuffer');
    expect(Buffer.compare(b1, REF_BYTES_1)).toBe(0);
    expect(Buffer.compare(b2, REF_BYTES_2)).toBe(0);
  });
});
