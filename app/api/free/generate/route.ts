export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { freeGenerationAttachments, generations } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import {
  FREE_DAILY_CAP,
  PROMPT_MAX,
  isValidPrompt,
} from '@/lib/free/policy';
import { countFreeImagesToday } from '@/lib/free/access';
import {
  canonicalMimeFor,
  validateUploads,
} from '@/lib/vilish/attachments';
import { needsReferencePhoto } from '@/lib/person-reference';

/**
 * POST /api/free/generate
 * Body (JSON): { prompt, quality?, aspectRatio?, media_type? }
 * Body (multipart/form-data): prompt, quality?, aspectRatio?,
 *   media_type?/mediaType?, files (0-5 reference files)
 * Free-tier IMAGES only — media_type=video is rejected (use /api/video/order).
 * Auth required. Prompt 1..2000 chars. 3 free images / user / IST day
 * (failed rows don't consume cap) → 429 FREE_CAP_REACHED beyond that.
 *
 * Reference files (optional, multipart only): validated against the shared
 * attachment policy (8MB/file, 20MB total, max 5, allowlisted types only) —
 * the same caps as the paid flow — and stored as bytea on
 * free_generation_attachments linked to the generations row. The
 * generation watcher fetches them via
 * GET /api/admin/fulfillment/generations/[id]/attachments (x-admin-token).
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  // Accept JSON (classic) or multipart (with reference files).
  let prompt: unknown;
  let quality = 'studio';
  let aspectRatio = '1:1';
  let mediaType = 'image';
  let files: File[] = [];
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json(
        { code: 'INVALID_REQUEST', error: 'Could not read form data' },
        { status: 400 }
      );
    }
    const p = form.get('prompt');
    prompt = typeof p === 'string' ? p : null;
    const q = form.get('quality');
    if (typeof q === 'string' && q.length > 0 && q.length <= 32) quality = q;
    const ar = form.get('aspectRatio');
    if (typeof ar === 'string' && ar.length > 0 && ar.length <= 16)
      aspectRatio = ar;
    const mt = form.get('media_type') ?? form.get('mediaType');
    if (typeof mt === 'string' && mt.trim()) mediaType = mt.trim();
    files = form
      .getAll('files')
      .filter((v): v is File => v instanceof File && v.size > 0);
  } else {
    const body = await req.json().catch(() => null);
    prompt = body?.prompt;
    if (typeof body?.quality === 'string' && body.quality.length <= 32) {
      quality = body.quality;
    }
    if (typeof body?.aspectRatio === 'string' && body.aspectRatio.length <= 16) {
      aspectRatio = body.aspectRatio;
    }
    mediaType = body?.media_type ?? body?.mediaType ?? 'image';
  }

  if (!isValidPrompt(prompt)) {
    return NextResponse.json(
      {
        code: 'INVALID_PROMPT',
        error: `prompt must be ${1}..${PROMPT_MAX} characters`,
      },
      { status: 400 }
    );
  }

  if (mediaType === 'video') {
    return NextResponse.json(
      {
        code: 'VIDEO_NOT_ALLOWED',
        error: 'Video goes through /api/video/order, not the free tier',
      },
      { status: 400 }
    );
  }
  if (mediaType !== 'image') {
    return NextResponse.json(
      { code: 'INVALID_MEDIA_TYPE', error: 'media_type must be image' },
      { status: 400 }
    );
  }

  // Server-side attachment policy: same rules as the paid flow.
  if (files.length > 0) {
    const check = validateUploads(
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    if (!check.ok) {
      return NextResponse.json(
        { code: 'INVALID_ATTACHMENTS', error: check.message },
        { status: 400 }
      );
    }
  }

  // Pre-generation reference-photo check: a prompt that asks for a specific
  // person needs their photo attached — fail fast here instead of after the
  // queue wait. Runs before the cap check so it never consumes the cap.
  if (needsReferencePhoto(prompt) && files.length === 0) {
    return NextResponse.json(
      {
        code: 'MISSING_REFERENCE',
        error: 'This prompt asks for a specific person — attach their photo first.',
      },
      { status: 400 }
    );
  }

  const used = await countFreeImagesToday(user.id);
  // Owner/admin testing bypass: no daily cap (audit-logged server-side).
  // Safety/moderation filters below still apply to everyone.
  const admin = isAdminEmail(user.email);
  if (admin) console.info(`[admin] cap bypass: free generate for ${user.id}`);
  if (!admin && used >= FREE_DAILY_CAP) {
    return NextResponse.json(
      {
        code: 'FREE_CAP_REACHED',
        error: `Daily free limit reached (${FREE_DAILY_CAP} images/day). Try again tomorrow.`,
      },
      { status: 429 }
    );
  }

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt: prompt.trim(),
      quality,
      aspectRatio,
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
    })
    .returning({ id: generations.id });

  // Persist validated reference files on the generation (bytea). If the
  // insert fails, remove the just-created row so no attachment-less orphan
  // consumes the user's daily cap.
  if (files.length > 0) {
    try {
      const rows = [];
      for (const f of files) {
        const data = Buffer.from(await f.arrayBuffer());
        rows.push({
          generationId: row.id,
          filename: f.name,
          // Never trust the browser-reported MIME; the extension is the gate.
          mimeType: canonicalMimeFor(f.name) ?? 'application/octet-stream',
          byteSize: data.byteLength,
          data,
        });
      }
      await db.insert(freeGenerationAttachments).values(rows);
    } catch {
      await db
        .delete(generations)
        .where(eq(generations.id, row.id))
        .catch(() => {});
      return NextResponse.json(
        {
          code: 'ATTACHMENT_SAVE_FAILED',
          error: 'Could not save your reference files. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ id: row.id }, { status: 201 });
}
