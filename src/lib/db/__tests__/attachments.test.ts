/**
 * Vidish Studio — generation_attachments bytea tests.
 * Runs against in-process PGlite (same migration path as dev);
 * production uses node-postgres where bytea behaves identically.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { eq } from 'drizzle-orm';

let schema: typeof import('../schema');
let client: typeof import('../client');

beforeAll(
  async () => {
    // Force the PGlite fallback path before client.ts evaluates.
    delete process.env.DATABASE_URL;
    schema = await import('../schema');
    client = await import('../client');
    await client.runMigrations();
  },
  120_000,
);

async function makeJob(db: ReturnType<typeof client.getDb>) {
  const [job] = await db
    .insert(schema.generationJobs)
    .values({
      task: 'text_to_image',
      prompt: 'attachment test prompt',
      aspectRatio: '1:1',
      quality: 'studio',
      customerPrice: 2900,
      idempotencyKey: crypto.randomUUID(),
    })
    .returning();
  return job;
}

function asBuffer(v: unknown): Buffer {
  return Buffer.isBuffer(v) ? v : Buffer.from(v as Uint8Array);
}

describe('generation_attachments bytea storage', () => {
  it('migrates the table and stores/reads binary bytes', async () => {
    const db = client.getDb();
    const job = await makeJob(db);

    const payload = Buffer.from(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff],
    );
    const [row] = await db
      .insert(schema.generationAttachments)
      .values({
        generationId: job.id,
        filename: 'ref.png',
        mimeType: 'image/png',
        byteSize: payload.byteLength,
        data: payload,
      })
      .returning();
    expect(row.id).toBeTruthy();
    expect(row.filename).toBe('ref.png');
    expect(row.byteSize).toBe(payload.byteLength);

    const found = await db
      .select()
      .from(schema.generationAttachments)
      .where(eq(schema.generationAttachments.id, row.id))
      .limit(1);
    expect(found).toHaveLength(1);
    expect(asBuffer(found[0].data).equals(payload)).toBe(true);
    expect(found[0].mimeType).toBe('image/png');
  });

  it('stores multiple attachments per job in creation order', async () => {
    const db = client.getDb();
    const job = await makeJob(db);
    await db.insert(schema.generationAttachments).values([
      {
        generationId: job.id,
        filename: 'a.pdf',
        mimeType: 'application/pdf',
        byteSize: 3,
        data: Buffer.from([1, 2, 3]),
      },
      {
        generationId: job.id,
        filename: 'b.txt',
        mimeType: 'text/plain',
        byteSize: 2,
        data: Buffer.from([4, 5]),
      },
    ]);
    const rows = await db
      .select({
        filename: schema.generationAttachments.filename,
        byteSize: schema.generationAttachments.byteSize,
      })
      .from(schema.generationAttachments)
      .where(eq(schema.generationAttachments.generationId, job.id))
      .orderBy(schema.generationAttachments.createdAt);
    expect(rows.map((r) => r.filename)).toEqual(['a.pdf', 'b.txt']);
    expect(rows.map((r) => r.byteSize)).toEqual([3, 2]);
  });

  it('cascades: deleting the job removes its attachments', async () => {
    const db = client.getDb();
    const job = await makeJob(db);
    await db.insert(schema.generationAttachments).values({
      generationId: job.id,
      filename: 'orphan.png',
      mimeType: 'image/png',
      byteSize: 1,
      data: Buffer.from([9]),
    });
    await db
      .delete(schema.generationJobs)
      .where(eq(schema.generationJobs.id, job.id));
    const leftovers = await db
      .select({ id: schema.generationAttachments.id })
      .from(schema.generationAttachments)
      .where(eq(schema.generationAttachments.generationId, job.id));
    expect(leftovers).toHaveLength(0);
  });

  it('round-trips a full 8MB payload', async () => {
    const db = client.getDb();
    const job = await makeJob(db);
    const big = Buffer.alloc(8 * 1024 * 1024, 0xab);
    const [row] = await db
      .insert(schema.generationAttachments)
      .values({
        generationId: job.id,
        filename: 'big.png',
        mimeType: 'image/png',
        byteSize: big.byteLength,
        data: big,
      })
      .returning();
    const found = await db
      .select()
      .from(schema.generationAttachments)
      .where(eq(schema.generationAttachments.id, row.id))
      .limit(1);
    expect(found[0].byteSize).toBe(big.byteLength);
    expect(asBuffer(found[0].data).equals(big)).toBe(true);
  }, 60_000);
});
