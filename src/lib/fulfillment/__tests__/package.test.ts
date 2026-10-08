/**
 * Etch Phase 2 — contract §7: the AI PACKAGE template.
 *
 * buildAiPackage(job, order, references, parent?) must render every §7
 * section; remake/edit jobs must include PREVIOUS RESULT + ORIGINAL PROMPT +
 * CUSTOMER REVISION; internal fields (operatorNotes / qcNotes / estCostPaise)
 * must NEVER leak into the text — verified both at the unit level and
 * through GET /api/admin/fulfillment/[id]/package with sentinel-laden rows.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
import {
  buildAiPackage,
  extractRevision,
  REVISION_MARKER,
  type PackageJobInput,
  type PackageOrderInput,
  type PackageReferenceInput,
  type PackageParentInput,
} from '../package';

delete process.env.DATABASE_URL;

function jobInput(overrides: Partial<PackageJobInput> = {}): PackageJobInput {
  return {
    task: 'text_to_image',
    jobKind: 'generation',
    prompt: 'a brass diya floating on still water at dusk',
    aspectRatio: '1:1',
    quality: 'studio',
    style: 'photorealistic',
    genre: null,
    constraints: 'no text overlays, no watermark',
    durationSeconds: null,
    ...overrides,
  };
}

const orderInput: PackageOrderInput = { code: 'VLSH-PKG001' };

const refInput: PackageReferenceInput[] = [
  { filename: 'diya-ref-1.png' },
  { filename: 'diya-ref-2.png' },
];

describe('buildAiPackage — contract §7 template', () => {
  it('renders every §7 section for a plain generation job', () => {
    const text = buildAiPackage(jobInput(), orderInput, refInput, null);

    const required = [
      'Etch FULFILLMENT JOB',
      'ORDER:',
      'VLSH-PKG001',
      'TYPE:',
      'Text to image',
      'CUSTOMER REQUEST:',
      '"a brass diya floating on still water at dusk"',
      'OUTPUT:',
      'Image',
      'DURATION:',
      'n/a',
      'ASPECT:',
      '1:1',
      'QUALITY:',
      'studio',
      'STYLE:',
      'photorealistic',
      'REFERENCE ASSETS:',
      '1. diya-ref-1.png',
      '2. diya-ref-2.png',
      'IMPORTANT CUSTOMER CONSTRAINTS:',
      'no text overlays, no watermark',
      'DELIVERABLE:',
      'PNG',
      '1024x1024',
      'CREATE THE FINAL RESULT ONLY AFTER FOLLOWING THESE CONSTRAINTS.',
    ];
    for (const section of required) {
      expect(text, `missing section: ${section}`).toContain(section);
    }

    // remake/edit-only sections must be absent for a plain generation job
    for (const s of [
      'PREVIOUS RESULT:',
      'ORIGINAL PROMPT:',
      'CUSTOMER REVISION:',
    ]) {
      expect(text, `should not contain: ${s}`).not.toContain(s);
    }
  });

  it('humanizes image_to_image and renders "none" / "—" fallbacks', () => {
    const text = buildAiPackage(
      jobInput({
        task: 'image_to_image',
        style: null,
        genre: null,
        constraints: null,
      }),
      orderInput,
      [],
      null
    );
    expect(text).toContain('Image to image');
    expect(text).toContain('none');
    expect(text).toContain('—');
  });

  it('edit jobs get the EDIT prefix + previous result + original prompt + revision', () => {
    const parent: PackageParentInput = {
      prompt: 'a brass diya floating on still water at dusk',
      revision: 'make the flame brighter and the water darker',
      previousResultLabel: 'Take 02',
      previousResultUrl: 'https://storage.example/take2.png',
    };
    const text = buildAiPackage(
      jobInput({ jobKind: 'edit', task: 'image_to_image' }),
      orderInput,
      refInput,
      parent
    );
    expect(text).toContain('EDIT —');
    expect(text).toContain('Image to image');
    const required = [
      'PREVIOUS RESULT:',
      'Take 02',
      'https://storage.example/take2.png',
      'ORIGINAL PROMPT:',
      '"a brass diya floating on still water at dusk"',
      'CUSTOMER REVISION:',
      '"make the flame brighter and the water darker"',
    ];
    for (const s of required) {
      expect(text, `missing section: ${s}`).toContain(s);
    }
  });

  it('remake jobs include previous result + original prompt + revision (no EDIT prefix)', () => {
    const parent: PackageParentInput = {
      prompt: 'original prompt here',
      revision: 'customer revision here',
      previousResultLabel: 'Take 01',
      previousResultUrl: null,
    };
    const text = buildAiPackage(
      jobInput({ jobKind: 'remake' }),
      orderInput,
      refInput,
      parent
    );
    expect(text).not.toContain('EDIT —');
    for (const s of [
      'PREVIOUS RESULT:',
      'ORIGINAL PROMPT:',
      'CUSTOMER REVISION:',
    ]) {
      expect(text, `missing section: ${s}`).toContain(s);
    }
  });

  it('renders duration + video output + deliverable + resolution hint for video jobs', () => {
    const text = buildAiPackage(
      jobInput({
        task: 'text_to_video',
        aspectRatio: '9:16',
        durationSeconds: 8,
      }),
      orderInput,
      [],
      null
    );
    expect(text).toContain('Video');
    expect(text).toContain('MP4');
    expect(text).toContain('1080x1920 where supported');
    expect(text).toMatch(/DURATION:\s*\n?8/);
    expect(text).not.toContain('n/a');
  });

  it('extractRevision pulls only the marked revision line from operatorNotes', () => {
    const notes = [
      'internal chatter the customer must never see',
      `${REVISION_MARKER} make the flame brighter`,
      'more internal notes',
    ].join('\n');
    expect(extractRevision(notes)).toBe('make the flame brighter');
    expect(extractRevision('no marker here')).toBeNull();
    expect(extractRevision(null)).toBeNull();
  });
});

const PACKAGE_ROUTE = resolve(
  process.cwd(),
  'app/api/admin/fulfillment/[id]/package/route.ts'
);

describe.runIf(existsSync(PACKAGE_ROUTE))(
  'GET /api/admin/fulfillment/[id]/package — no internal leak',
  () => {
    let GET: (
      req: NextRequest,
      ctx: { params: Promise<{ id: string }> }
    ) => Promise<Response>;
    let jobId: string;
    const OP_SENTINEL = 'INTERNAL-OPERATOR-NOTES-SENTINEL-9f3k';
    const QC_SENTINEL = 'INTERNAL-QC-NOTES-SENTINEL-7h2m';

    beforeAll(async () => {
      process.env.ADMIN_TOKEN = 'test-admin-token-package';
      const client = await import('@/lib/db/client');
      const schema = await import('@/lib/db/schema');
      const db = client.getDb();
      await client.runMigrations();
      ({ GET } = await import(pathToFileURL(PACKAGE_ROUTE).href));

      const [user] = await db
        .insert(schema.users)
        .values({ name: 'Package User', email: 'package@vidish.dev' })
        .returning();
      const [project] = await db
        .insert(schema.projects)
        .values({ userId: user.id, name: 'Package project' })
        .returning();
      const [job] = await db
        .insert(schema.generationJobs)
        .values({
          userId: user.id,
          projectId: project.id,
          task: 'text_to_image',
          prompt: 'a brass diya floating on still water at dusk',
          aspectRatio: '1:1',
          quality: 'studio',
          customerPrice: 2900,
          state: 'APPROVED_FOR_GENERATION',
          fulfillmentMode: 'operator',
          jobKind: 'generation',
          operatorNotes: `${OP_SENTINEL}\ninternal only`,
          qcNotes: QC_SENTINEL,
          idempotencyKey: crypto.randomUUID(),
        } as Record<string, unknown>)
        .returning();
      jobId = job.id;
      await db.insert(schema.orders).values({
        code: 'VLSH-PKG999',
        jobId: job.id,
        userId: user.id,
        provider: 'manual_upi',
        amountPaise: 2900,
        status: 'PAYMENT_VERIFIED',
        expiresAt: new Date(Date.now() + 3600_000),
      });
    }, 120_000);

    it('returns { text } with all §7 sections and no internal fields', async () => {
      const req = new NextRequest(
        `http://localhost/api/admin/fulfillment/${jobId}/package`,
        { headers: { 'x-admin-token': 'test-admin-token-package' } }
      );
      const res = await GET(req, { params: Promise.resolve({ id: jobId }) });
      expect(res.status).toBe(200);
      const { text } = (await res.json()) as { text: string };
      expect(text).toContain('Etch FULFILLMENT JOB');
      expect(text).toContain('VLSH-PKG999');
      expect(text).toContain('a brass diya floating on still water at dusk');
      // internal fields must not leak
      expect(text).not.toContain(OP_SENTINEL);
      expect(text).not.toContain(QC_SENTINEL);
      expect(text).not.toContain('estCostPaise');
    });

    it('401s without x-admin-token', async () => {
      const req = new NextRequest(
        `http://localhost/api/admin/fulfillment/${jobId}/package`
      );
      const res = await GET(req, { params: Promise.resolve({ id: jobId }) });
      expect(res.status).toBe(401);
    });
  }
);
