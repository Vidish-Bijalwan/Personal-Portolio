export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
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
import { verifyUploadContents } from '@/lib/muse/uploads';
import {
  attachChunkedUploads,
  releaseChunkedUploads,
} from '@/lib/muse/chunked-route';
import {
  effectivePrompt,
  parseMuseBody,
  parseMuseForm,
  resolveProjectRef,
} from '@/lib/muse/wiring';
import { MISSING_REFERENCE_MESSAGE, needsReferencePhoto } from '@/lib/person-reference';
import { queueGenerationTrigger } from '@/lib/fast-gen/trigger';
import { specIsExpired, speculativeHash } from '@/lib/fast-gen/spec';

/**
 * POST /api/free/generate
 * Body (JSON): { prompt, quality?, aspectRatio?, media_type? }
 * Body (multipart/form-data): prompt, quality?, aspectRatio?,
 *   media_type?/mediaType?, files (0-5 reference files),
 *   uploadIds? (finalized chunked-upload file ids for files over 4 MB)
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
  /** Direct multipart files (legacy validation gate applies to these). */
  let directFiles: File[] = [];
  /** Finalized chunked-upload ids, released after the order persists. */
  let chunkedFileIds: string[] = [];
  // Fast-gen (c): speculative hit token from the composer (JSON path only —
  // speculative rows are never created for prompts with attachments).
  let clientSpecHash: string | null = null;
  // Madam Muse: optional brief + compiledPrompt + projectId thread through.
  let museBody: ReturnType<typeof parseMuseBody> | null = null;
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
    // Madam Muse chunked uploads: files over 4 MB travel the chunked
    // pipeline and arrive as `uploadIds`. Resolve them into File objects
    // so they feed the same attachment persistence below.
    const chunked = await attachChunkedUploads(form, user.id, files);
    if (!chunked.ok) {
      return NextResponse.json(
        { code: 'INVALID_CHUNKED_UPLOAD', error: chunked.error },
        { status: chunked.status ?? 400 }
      );
    }
    chunkedFileIds = chunked.chunkedFileIds;
    directFiles = files;
    files = chunked.files;
    museBody = parseMuseForm(form);
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
    if (typeof body?.specHash === 'string' && body.specHash.length > 0) {
      clientSpecHash = body.specHash;
    }
    museBody = parseMuseBody(body);
  }

  if (museBody?.error) {
    return NextResponse.json(
      { code: 'INVALID_MUSE_FIELDS', error: museBody.error },
      { status: 400 }
    );
  }
  const muse = museBody?.fields ?? { brief: null, compiledPrompt: null, projectId: null };

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

  // Server-side attachment policy: same rules as the paid flow. The
  // legacy gate applies to direct multipart files exactly as before;
  // chunked files were validated by the chunk pipeline.
  if (directFiles.length > 0) {
    const check = validateUploads(
      directFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    if (!check.ok) {
      return NextResponse.json(
        { code: 'INVALID_ATTACHMENTS', error: check.message },
        { status: 400 }
      );
    }
    // Madam Muse: magic-byte sniffing — reject files whose bytes don't
    // match their claimed type (e.g. an .exe renamed to .png). Additive:
    // never widens what the extension gate accepts.
    const contentError = await verifyUploadContents(directFiles);
    if (contentError) {
      return NextResponse.json(
        { code: 'INVALID_ATTACHMENTS', error: contentError },
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
        error: MISSING_REFERENCE_MESSAGE,
      },
      { status: 400 }
    );
  }

  // The effective prompt: the compiled Madam Muse prompt when the
  // composer supplied one — this is the only thing about the worker's
  // input that changes. The speculative hash is computed over the same
  // effective prompt, so the UI must hash the compiled prompt too when
  // it uses one (hash over the raw prompt simply misses and falls
  // through to the normal flow — safe, never wrong).
  const finalPrompt = effectivePrompt(muse.compiledPrompt, (prompt as string).trim());

  // Fast-gen (c): speculative hit — the composer pre-rendered this exact
  // prompt+options while the user was typing (tier='speculative', never
  // charged, never counted). The server recomputes the hash from the real
  // inputs and only converts on an exact match; anything else (edited
  // prompt, expired row, someone else's row) falls through to the normal
  // flow below. The free-cap check runs BEFORE conversion, so the cap is
  // charged exactly once, at Generate time — speculative work itself is
  // always free.
  if (clientSpecHash) {
    const expected = speculativeHash({
      prompt: finalPrompt,
      quality,
      aspectRatio,
      mediaType: 'image',
    });
    if (expected === clientSpecHash) {
      const specRows = await db
        .select()
        .from(generations)
        .where(
          and(
            eq(generations.userId, user.id),
            eq(generations.tier, 'speculative'),
            eq(generations.specHash, clientSpecHash),
            inArray(generations.status, ['queued', 'generating', 'done'])
          )
        )
        .orderBy(desc(generations.createdAt))
        .limit(1);
      const spec = specRows[0];
      if (spec && !specIsExpired(spec.specExpiresAt)) {
        const used = await countFreeImagesToday(user.id);
        const admin = isAdminEmail(user.email);
        if (admin) console.info(`[admin] cap bypass: speculative convert for ${user.id}`);
        if (!admin && used >= FREE_DAILY_CAP) {
          return NextResponse.json(
            {
              code: 'FREE_CAP_REACHED',
              error: `Daily free limit reached (${FREE_DAILY_CAP} images/day). Try again tomorrow.`,
            },
            { status: 429 }
          );
        }
        const museProjectRef = await resolveProjectRef(db, muse.projectId, user.id);
        if (!museProjectRef.ok) {
          return NextResponse.json(
            { code: museProjectRef.code, error: museProjectRef.error },
            { status: museProjectRef.status }
          );
        }
        const museProjectId = museProjectRef.projectId;
        await db
          .update(generations)
          .set({
            tier: 'free',
            specHash: null,
            specExpiresAt: null,
            // Madam Muse: the converted row carries the effective prompt
            // (compiled when supplied), brief, and project link.
            prompt: finalPrompt,
            brief: muse.brief as unknown as Record<string, unknown> | null,
            projectId: museProjectId,
            updatedAt: new Date(),
          })
          .where(eq(generations.id, spec.id));
        // If the worker hasn't picked it up yet, wake it immediately.
        if (spec.status === 'queued') {
          await queueGenerationTrigger(spec.id);
        }
        return NextResponse.json({ id: spec.id, speculative: true });
      }
    }
    // Hash mismatch / expired / missing: fall through to the normal flow.
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

  // Madam Muse: verify/claim the project link before queueing.
  const projectRef = await resolveProjectRef(db, muse.projectId, user.id);
  if (!projectRef.ok) {
    return NextResponse.json(
      { code: projectRef.code, error: projectRef.error },
      { status: projectRef.status }
    );
  }

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      prompt: finalPrompt,
      quality,
      aspectRatio,
      mediaType: 'image',
      tier: 'free',
      status: 'queued',
      brief: muse.brief as unknown as Record<string, unknown> | null,
      projectId: projectRef.projectId,
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

  // Fast-gen (b): wake the fulfillment worker immediately — the 1-minute
  // claim poll stays as the fallback if the fast path misses.
  await queueGenerationTrigger(row.id);

  // Chunked uploads are now persisted with the order — release the temp
  // copies (best-effort; the TTL sweep is the backstop).
  await releaseChunkedUploads(chunkedFileIds);

  return NextResponse.json({ id: row.id }, { status: 201 });
}
