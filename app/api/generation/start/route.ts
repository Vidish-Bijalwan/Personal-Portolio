export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import {
  canonicalMimeFor,
  validateUploads,
} from '@/lib/vilish/attachments';
import { verifyUploadContents } from '@/lib/muse/uploads';
import {
  effectivePrompt,
  resolveProjectRef,
} from '@/lib/muse/wiring';
import { getFulfillmentConfig } from '@/lib/fulfillment/config';
import { isAdminOverride } from '@/lib/fulfillment/guards';
import { MISSING_REFERENCE_MESSAGE, needsReferencePhoto } from '@/lib/person-reference';
import { isAdminEmail } from '@/lib/admin';
import { queueGenerationTrigger } from '@/lib/fast-gen/trigger';

/** Start of the current day in Asia/Kolkata, as a UTC Date. */
function istDayStart(now: Date): Date {
  const IST_MS = 5.5 * 3600 * 1000;
  const ist = new Date(now.getTime() + IST_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_MS);
}

/** Count operator-mode jobs created today with state NOT IN DRAFT. */
async function countOperatorJobsToday(): Promise<number> {
  const dayStart = istDayStart(new Date());
  const res = (await db.execute(
    sql`select count(*)::int as n from generation_jobs
        where fulfillment_mode = 'operator'
          and state <> 'DRAFT'
          and created_at >= ${dayStart}`
  )) as unknown;
  if (Array.isArray(res)) return Number((res[0] as { n?: unknown })?.n ?? 0);
  const rows = (res as { rows?: { n?: unknown }[] })?.rows;
  return Number(rows?.[0]?.n ?? 0);
}

/**
 * POST /api/generation/start
 * Body (JSON): { quoteId: string, country?: string }
 * Body (multipart/form-data): quoteId, country?, files (0-5 reference files)
 * Auth required. India (UPI) only: any other country -> 400
 * INTL_PAYMENTS_COMING_SOON.
 *
 * GENERATE-FIRST: no payment order is created here. The quoted job starts
 * generating immediately — a `generations` row (tier='paid',
 * media_type='image') is queued for the generation queue, which produces
 * the watermarked preview. The job stays QUOTED as the pricing record;
 * the unlock order is created later, when the user clicks "Download clean
 * HD" (POST /api/generation/unlock), with the amount read server-side
 * from the job — never from the client.
 *
 * Reference files (optional): validated against the shared attachment
 * policy (8MB/file, 20MB total, max 5, allowlisted types only) and stored
 * as bytea on free_generation_attachments (the generations-row attachment
 * table the watcher reads) linked to the new generations row.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  // Accept JSON (classic) or multipart (with reference files).
  let quoteId: string | null = null;
  let country = 'IN';
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
    const q = form.get('quoteId');
    quoteId = typeof q === 'string' ? q : null;
    const c = form.get('country');
    if (typeof c === 'string' && c.trim()) country = c.trim().toUpperCase();
    files = form
      .getAll('files')
      .filter((v): v is File => v instanceof File && v.size > 0);
  } else {
    const body = await req.json().catch(() => null);
    quoteId = typeof body?.quoteId === 'string' ? body.quoteId : null;
    country =
      typeof body?.country === 'string' && body.country.trim()
        ? body.country.trim().toUpperCase()
        : 'IN';
  }

  if (!quoteId) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'quoteId is required' },
      { status: 400 }
    );
  }

  // Server-side attachment policy: same rules as the composer UI.
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
    // Madam Muse: magic-byte sniffing — reject files whose bytes don't
    // match their claimed type (e.g. an .exe renamed to .png). Additive:
    // never widens what the extension gate accepts.
    const contentError = await verifyUploadContents(files);
    if (contentError) {
      return NextResponse.json(
        { code: 'INVALID_ATTACHMENTS', error: contentError },
        { status: 400 }
      );
    }
  }

  if (country !== 'IN') {
    return NextResponse.json(
      {
        code: 'INTL_PAYMENTS_COMING_SOON',
        message:
          'International payments coming soon — India (UPI) only for now',
      },
      { status: 400 }
    );
  }

  const quoteRows = await db
    .select()
    .from(schema.quotes)
    .where(eq(schema.quotes.id, quoteId))
    .limit(1);
  const quote = quoteRows[0];
  if (!quote || !quote.jobId) {
    return NextResponse.json(
      { code: 'QUOTE_NOT_FOUND', error: 'Quote not found' },
      { status: 404 }
    );
  }
  if (new Date(quote.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { code: 'QUOTE_EXPIRED', error: 'Quote expired' },
      { status: 410 }
    );
  }

  const jobRows = await db
    .select()
    .from(schema.generationJobs)
    .where(eq(schema.generationJobs.id, quote.jobId))
    .limit(1);
  const job = jobRows[0];
  if (!job) {
    return NextResponse.json(
      { code: 'JOB_NOT_FOUND', error: 'Job not found' },
      { status: 404 }
    );
  }
  if (job.userId && job.userId !== user.id) {
    return NextResponse.json(
      { code: 'FORBIDDEN', error: 'Not your quote' },
      { status: 403 }
    );
  }
  if (job.state !== 'QUOTED') {
    return NextResponse.json(
      { code: 'INVALID_STATE', error: `Job is ${job.state}, expected QUOTED` },
      { status: 409 }
    );
  }
  // Quotes are anonymous until Generate-time auth (lazy login): claim an
  // unowned job for the signed-in user so the pricing record, the
  // generations row, and the later unlock order all share one owner.
  if (!job.userId) {
    await db
      .update(schema.generationJobs)
      .set({ userId: user.id, updatedAt: new Date() })
      .where(eq(schema.generationJobs.id, job.id));
  }

  // Pre-generation reference-photo check: a prompt that asks for a specific
  // person needs their photo attached — fail fast here instead of after the
  // queue wait. Runs before the capacity gates so it never consumes the cap.
  if (needsReferencePhoto(job.enhancedPrompt ?? job.prompt) && files.length === 0) {
    return NextResponse.json(
      {
        code: 'MISSING_REFERENCE',
        error: MISSING_REFERENCE_MESSAGE,
      },
      { status: 400 }
    );
  }

  // Phase 2 contract §5: capacity gates BEFORE generation starts.
  // Valid x-admin-token bypasses both, as does the signed-in admin's
  // session (isAdminEmail) — the admin's browser never sends x-admin-token.
  const fulfillmentCfg = await getFulfillmentConfig();
  const fulfillmentMode = fulfillmentCfg.FULFILLMENT_MODE;
  if (
    fulfillmentMode === 'operator' &&
    !isAdminOverride(req) &&
    !isAdminEmail(user.email)
  ) {
    if (!fulfillmentCfg.ORDERS_ACCEPTING) {
      return NextResponse.json({ error: 'ORDERS_PAUSED' }, { status: 403 });
    }
    const cap = fulfillmentCfg.MAX_OPERATOR_ORDERS_PER_DAY;
    if (cap !== null) {
      const today = await countOperatorJobsToday();
      if (today >= cap) {
        return NextResponse.json({ error: 'DAILY_CAP_REACHED' }, { status: 403 });
      }
    }
  }

  // Generate-first: queue a paid generations row for the generation queue.
  // The queue produces the watermarked preview; the clean file unlocks
  // later via POST /api/generation/unlock. No payment order is created.
  // The job stays QUOTED as the pricing record (customerPrice/product were
  // set server-side at quote time).
  //
  // Madam Muse wiring: the project link stamped at quote time is verified
  // against this user here (unowned projects are claimed; another user's
  // project is 403). The generations row carries the compiled prompt when
  // the composer supplied one — that is the ONLY thing about the worker's
  // input that changes; the worker/fulfillment path is untouched.
  const projectRef = await resolveProjectRef(db, job.projectId, user.id);
  if (!projectRef.ok) {
    return NextResponse.json(
      { code: projectRef.code, error: projectRef.error },
      { status: projectRef.status }
    );
  }

  const [genRow] = await db
    .insert(schema.generations)
    .values({
      userId: user.id,
      prompt: effectivePrompt(job.compiledPrompt, job.enhancedPrompt ?? job.prompt),
      quality: job.quality,
      aspectRatio: job.aspectRatio,
      mediaType: 'image',
      tier: 'paid',
      status: 'queued',
      mime: 'image/jpeg',
      jobId: job.id,
      unlocked: false,
      brief: job.brief,
      projectId: projectRef.projectId,
    })
    .returning({ id: schema.generations.id });

  // Persist validated reference files on the generations row (bytea) for
  // the watcher. If the insert fails, remove the just-created row so no
  // attachment-less orphan is queued.
  if (files.length > 0) {
    try {
      const rows = [];
      for (const f of files) {
        const data = Buffer.from(await f.arrayBuffer());
        rows.push({
          generationId: genRow.id,
          filename: f.name,
          // Never trust the browser-reported MIME; the extension is the gate.
          mimeType: canonicalMimeFor(f.name) ?? 'application/octet-stream',
          byteSize: data.byteLength,
          data,
        });
      }
      await db.insert(schema.freeGenerationAttachments).values(rows);
    } catch {
      await db
        .delete(schema.generations)
        .where(eq(schema.generations.id, genRow.id))
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
  await queueGenerationTrigger(genRow.id);

  return NextResponse.json(
    {
      jobId: job.id,
      generationId: genRow.id,
    },
    { status: 201 }
  );
}
