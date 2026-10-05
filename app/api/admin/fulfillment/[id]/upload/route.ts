export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { getStorage } from '@/lib/storage';
import {
  assertTransition,
  auditAdmin,
  withAdminTransition,
} from '@/lib/fulfillment/guards';
import {
  getFulfillmentJob,
  getTakes,
  insertTake,
  patchJob,
} from '@/lib/fulfillment/job';

/**
 * POST /api/admin/fulfillment/[id]/upload
 * multipart/form-data: files[] (or files) + fields
 *   { takeLabel?, resultType: 'video'|'image', notes?, toolUsed?,
 *     durationSeconds?, width?, height?, estCostPaise?, generationTimeSeconds? }
 * GENERATING|OPERATOR_QC → RESULT_UPLOADED.
 * Files go through the same storage pipeline as provider media (getStorage),
 * then assets rows + fulfillment_results rows are created.
 * Allowed mime: video/mp4, video/quicktime, video/webm,
 *   image/png, image/jpeg, image/webp. Max 200MB/file.
 */
const MAX_BYTES = 200 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const EXT_BY_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

function num(v: FormDataEntryValue | null): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminTransition(req, async () => {
    const { id } = await params;
    const job = await getFulfillmentJob(id);
    if (!job) {
      return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_FORM', message: 'Expected multipart form-data' },
        { status: 400 }
      );
    }

    const files = [...form.getAll('files[]'), ...form.getAll('files')].filter(
      (f): f is File => f instanceof File
    );
    if (files.length === 0) {
      return NextResponse.json({ error: 'FILES_REQUIRED' }, { status: 400 });
    }

    const resultType = str(form.get('resultType'));
    if (resultType !== 'video' && resultType !== 'image') {
      return NextResponse.json(
        { error: 'INVALID_RESULT_TYPE', message: "resultType must be 'video'|'image'" },
        { status: 400 }
      );
    }

    for (const f of files) {
      const mime = (f.type || '').toLowerCase();
      if (!ALLOWED_MIME.has(mime)) {
        return NextResponse.json(
          {
            error: 'INVALID_FILE_TYPE',
            message: `Not allowed: ${f.name || 'file'} (${mime || 'unknown'})`,
          },
          { status: 413 }
        );
      }
      if (f.size > MAX_BYTES) {
        return NextResponse.json(
          {
            error: 'FILE_TOO_LARGE',
            message: `${f.name || 'file'} exceeds 200MB`,
          },
          { status: 413 }
        );
      }
    }

    // Legal transition checked BEFORE any storage writes.
    assertTransition(job.state, 'RESULT_UPLOADED');

    const notes = str(form.get('notes'));
    const toolUsed = str(form.get('toolUsed'));
    const durationSeconds = num(form.get('durationSeconds'));
    const width = num(form.get('width'));
    const height = num(form.get('height'));
    const estCostPaise = num(form.get('estCostPaise'));
    const generationTimeSeconds = num(form.get('generationTimeSeconds'));

    const existing = await getTakes(job.id);
    const storage = getStorage();
    const created: { takeId: string; takeLabel: string; assetId: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const mime = (f.type || '').toLowerCase();
      const ext = EXT_BY_MIME[mime] ?? 'bin';
      const key = `fulfillment/${job.id}/${crypto.randomUUID()}.${ext}`;
      const buf = Buffer.from(await f.arrayBuffer());

      let url: string;
      try {
        ({ url } = await storage.put(key, buf, mime));
      } catch (e) {
        return NextResponse.json(
          {
            error: 'UPLOAD_FAILED',
            message: e instanceof Error ? e.message : 'storage put failed',
          },
          { status: 502 }
        );
      }

      const [asset] = await db
        .insert(schema.assets)
        .values({
          userId: job.userId,
          projectId: job.projectId,
          kind: 'output',
          url,
          mimeType: mime,
          sizeBytes: f.size,
          width: width !== null ? Math.floor(width) : null,
          height: height !== null ? Math.floor(height) : null,
        })
        .returning();

      const takeLabel =
        str(form.get('takeLabel')) ??
        `Take ${String(existing.length + i + 1).padStart(2, '0')}`;

      const takeId = await insertTake({
        jobId: job.id,
        takeLabel,
        assetId: asset.id,
        resultType,
        notes,
        toolUsed,
        durationSeconds: durationSeconds !== null ? Math.floor(durationSeconds) : null,
        width: width !== null ? Math.floor(width) : null,
        height: height !== null ? Math.floor(height) : null,
        estCostPaise: estCostPaise !== null ? Math.floor(estCostPaise) : null,
        generationTimeSeconds:
          generationTimeSeconds !== null ? Math.floor(generationTimeSeconds) : null,
        uploadedBy: 'admin',
      });
      created.push({ takeId, takeLabel, assetId: asset.id });
    }

    await patchJob(job.id, { state: 'RESULT_UPLOADED' });
    await auditAdmin('fulfillment.upload', {
      jobId: job.id,
      to: 'RESULT_UPLOADED',
      resultType,
      takes: created.map((c) => ({
        takeId: c.takeId,
        takeLabel: c.takeLabel,
        assetId: c.assetId,
      })),
    });

    return NextResponse.json(
      { ok: true, jobId: job.id, state: 'RESULT_UPLOADED', takes: created },
      { status: 200 }
    );
  });
}
