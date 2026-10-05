export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { createManualPaymentOrder } from '@/lib/payments/manual-upi';
import { canTransition } from '@/lib/vilish/types';
import {
  canonicalMimeFor,
  validateUploads,
} from '@/lib/vilish/attachments';
import { getFulfillmentConfig } from '@/lib/fulfillment/config';
import { isAdminOverride } from '@/lib/fulfillment/guards';

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
 * INTL_PAYMENTS_COMING_SOON. Creates a manual-UPI payment order, persists
 * it, and moves the job QUOTED -> PAYMENT_PENDING. The customer pays in
 * their UPI app, submits the UTR, and an admin verifies it before the job
 * queues. No Razorpay anywhere in this flow.
 *
 * Reference files (optional): validated against the shared attachment
 * policy (8MB/file, 20MB total, max 5, allowlisted types only) and stored
 * as bytea on generation_attachments for the operator to download.
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
  if (job.state !== 'QUOTED') {
    return NextResponse.json(
      { code: 'INVALID_STATE', error: `Job is ${job.state}, expected QUOTED` },
      { status: 409 }
    );
  }

  // Phase 2 contract §5: capacity gates BEFORE order creation.
  // Valid x-admin-token bypasses both.
  const fulfillmentCfg = await getFulfillmentConfig();
  const fulfillmentMode = fulfillmentCfg.FULFILLMENT_MODE;
  if (fulfillmentMode === 'operator' && !isAdminOverride(req)) {
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

  let payment: {
    code: string;
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    amountPaise: number;
    expiresAt: string;
  };
  try {
    payment = await createManualPaymentOrder({
      jobId: job.id,
      userId: user.id,
      amountPaise: quote.totalPaise,
    });
  } catch {
    return NextResponse.json(
      { code: 'PAYMENT_ORDER_FAILED', error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  if (!canTransition(job.state, 'PAYMENT_PENDING')) {
    return NextResponse.json(
      { code: 'INVALID_STATE', error: 'Job cannot move to PAYMENT_PENDING' },
      { status: 409 }
    );
  }

  // Persist validated reference files on the job (bytea — works on both
  // PGlite and Postgres). Stored only now that the payment order exists,
  // so no orphan attachments survive a failed start.
  if (files.length > 0) {
    const rows = [];
    for (const f of files) {
      const data = Buffer.from(await f.arrayBuffer());
      rows.push({
        generationId: job.id,
        filename: f.name,
        // Never trust the browser-reported MIME; the extension is the gate.
        mimeType: canonicalMimeFor(f.name) ?? 'application/octet-stream',
        byteSize: data.byteLength,
        data,
      });
    }
    await db.insert(schema.generationAttachments).values(rows);
  }

  await db
    .update(schema.generationJobs)
    // fulfillmentMode is stamped at job start (contract §5). Cast: the
    // Phase-2 column types land with the parallel schema migration.
    .set({
      state: 'PAYMENT_PENDING',
      updatedAt: new Date(),
      fulfillmentMode,
    } as never)
    .where(eq(schema.generationJobs.id, job.id));

  return NextResponse.json({
    jobId: job.id,
    payment: {
      code: payment.code,
      upiUri: payment.upiUri,
      ...(payment.qrDataUri ? { qrDataUri: payment.qrDataUri } : {}),
      ...(payment.qrImageUrl ? { qrImageUrl: payment.qrImageUrl } : {}),
      vpa: payment.vpa,
      payeeName: payment.payeeName,
      amountPaise: payment.amountPaise,
      expiresAt: payment.expiresAt,
    },
  });
}
