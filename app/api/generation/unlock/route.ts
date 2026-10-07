export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { getOwnedGeneration } from '@/lib/free/access';
import {
  createGenerationOrder,
  findPendingOrderLink,
} from '@/lib/free/orders';
import { verifyOrderAdminBypass } from '@/lib/payments/manual-upi';
import { servicePricePaise, type ComposerServiceId } from '@/lib/pricing/catalog';

const PAID_IMAGE_PRODUCTS: readonly string[] = [
  'single-image',
  'pack-4',
  'product-photo',
];

/**
 * Server-side unlock price for a paid image generation.
 * The job's customerPrice is the quoted price the user agreed to at
 * Generate time (set server-side by /api/generation/quote) — it wins.
 * Fallback is the live catalog price for the job's product; the catalog
 * is the price table, never a hardcoded number, never the client.
 */
function unlockPricePaise(job: {
  customerPrice: number | null;
  product: string | null;
}): number {
  if (typeof job.customerPrice === 'number' && job.customerPrice > 0) {
    return job.customerPrice;
  }
  const product = PAID_IMAGE_PRODUCTS.includes(job.product ?? '')
    ? (job.product as ComposerServiceId)
    : 'single-image';
  return servicePricePaise(product);
}

async function loadPaidImageGeneration(generationId: string, userId: string) {
  const { gen, error } = await getOwnedGeneration(generationId, userId);
  if (error) return { error };
  if (gen.mediaType !== 'image' || gen.tier !== 'paid' || !gen.jobId) {
    return {
      error: NextResponse.json(
        {
          code: 'NOT_PAID_IMAGE',
          error: 'Unlock orders are for paid image generations only',
        },
        { status: 400 }
      ),
    };
  }
  const jobRows = await db
    .select()
    .from(schema.generationJobs)
    .where(eq(schema.generationJobs.id, gen.jobId))
    .limit(1);
  const job = jobRows[0];
  if (!job || job.userId !== userId) {
    return {
      error: NextResponse.json(
        { code: 'JOB_NOT_FOUND', error: 'Pricing job not found' },
        { status: 404 }
      ),
    };
  }
  return { gen, job };
}

/**
 * GET /api/generation/unlock?generationId=<uuid>
 * Owner-gated. Returns the server-side unlock price for a finished paid
 * image generation so the watch room can render
 * "Download clean HD — ₹X" truthfully. 409 unless status=done and not
 * already unlocked.
 */
export async function GET(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const generationId = req.nextUrl.searchParams.get('generationId') ?? '';
  if (!generationId) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'generationId is required' },
      { status: 400 }
    );
  }

  const loaded = await loadPaidImageGeneration(generationId, user.id);
  if (loaded.error) return loaded.error;
  const { gen, job } = loaded;

  if (gen.status !== 'done') {
    return NextResponse.json(
      { code: 'NOT_DELIVERED', error: 'Image is not delivered yet' },
      { status: 409 }
    );
  }
  if (gen.unlocked) {
    return NextResponse.json(
      { code: 'ALREADY_UNLOCKED', error: 'Already unlocked' },
      { status: 409 }
    );
  }

  return NextResponse.json({
    generationId: gen.id,
    pricePaise: unlockPricePaise(job),
    unlocked: false,
  });
}

/**
 * POST /api/generation/unlock
 * Body: { generationId: string }
 * Owner-gated. Creates the unlock payment order for a finished paid image
 * generation — the order is created HERE (at "Download clean HD" click
 * time), never at Generate time. Amount comes from the server-side pricing
 * job, never from the client.
 *
 * Requires status=done and unlocked=false. Idempotent: a still-pending
 * unlock order is resumed instead of duplicated. Returns { generationId,
 * payment } in the payment-modal shape; the existing PAYMENT_VERIFIED →
 * runUnlockHooks flow flips generations.unlocked (Cashfree webhook and
 * manual-UPI confirm both feed it).
 *
 * Owner/admin testing bypass: isAdminEmail verifies immediately — no
 * payment UI, the clean download opens straight away.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const generationId =
    typeof body?.generationId === 'string' ? body.generationId : '';
  if (!generationId) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'generationId is required' },
      { status: 400 }
    );
  }

  const loaded = await loadPaidImageGeneration(generationId, user.id);
  if (loaded.error) return loaded.error;
  const { gen, job } = loaded;

  if (gen.status !== 'done') {
    return NextResponse.json(
      { code: 'NOT_DELIVERED', error: 'Image is not delivered yet' },
      { status: 409 }
    );
  }
  if (gen.unlocked) {
    return NextResponse.json(
      { code: 'ALREADY_UNLOCKED', error: 'Already unlocked' },
      { status: 409 }
    );
  }

  const resumed = await findPendingOrderLink(gen.id, 'unlock');
  if (resumed) {
    // Owner/admin testing bypass: verify the pending order immediately.
    if (isAdminEmail(user.email)) {
      await verifyOrderAdminBypass({
        code: resumed.payment.code,
        adminUserId: user.id,
      });
      return NextResponse.json({
        generationId: gen.id,
        unlocked: true,
        adminBypass: true,
      });
    }
    return NextResponse.json({
      generationId: gen.id,
      resumed: true,
      payment: resumed.payment,
    });
  }

  let order;
  try {
    order = await createGenerationOrder({
      generationId: gen.id,
      userId: user.id,
      amountPaise: unlockPricePaise(job),
      purpose: 'unlock',
      stubPrompt: `Paid image unlock for generation ${gen.id}`,
      aspectRatio: gen.aspectRatio,
      quality: gen.quality,
    });
  } catch {
    return NextResponse.json(
      { code: 'PAYMENT_ORDER_FAILED', error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  // Owner/admin testing bypass: no payment needed — verify immediately so
  // the clean download opens. Fully audit-logged as payment.admin_bypass.
  if (isAdminEmail(user.email)) {
    await verifyOrderAdminBypass({
      code: order.payment.code,
      adminUserId: user.id,
    });
    return NextResponse.json(
      { generationId: gen.id, unlocked: true, adminBypass: true },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { generationId: gen.id, payment: order.payment },
    { status: 201 }
  );
}
