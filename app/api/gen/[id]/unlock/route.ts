export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { UNLOCK_PRICE_PAISE } from '@/lib/free/policy';
import { getOwnedGeneration } from '@/lib/free/access';
import { createGenerationOrder, findPendingOrderLink } from '@/lib/free/orders';
import { verifyOrderAdminBypass } from '@/lib/payments/manual-upi';

/**
 * POST /api/gen/[id]/unlock
 * Owner-gated. FREE-TIER IMAGES ONLY (tier='free'): paid video rows are
 * rejected — their payment was already taken at /api/video/order time.
 * Requires status=done and unlocked=false. Creates a manual-UPI order
 * for UNLOCK_PRICE_PAISE (the single-image catalog price — read from
 * src/lib/free/policy, never hardcoded) via the existing payment flow
 * and links it with purpose='unlock'. Idempotent: a still-pending unlock
 * instead of duplicated. Returns { id, payment } in the payment-modal
 * shape so the existing UPI → UTR-submit → owner-verify flow works
 * unchanged; the verify hook flips generations.unlocked.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { gen, error } = await getOwnedGeneration(id, user.id);
  if (error) return error;

  if (gen.tier !== 'free' || gen.mediaType !== 'image') {
    return NextResponse.json(
      {
        code: 'NOT_FREE_IMAGE',
        error: 'Unlock orders are for free-tier images only',
      },
      { status: 400 }
    );
  }
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
      return NextResponse.json({ id: gen.id, unlocked: true, adminBypass: true });
    }
    return NextResponse.json({
      id: gen.id,
      resumed: true,
      payment: resumed.payment,
    });
  }

  let order;
  try {
    order = await createGenerationOrder({
      generationId: gen.id,
      userId: user.id,
      amountPaise: UNLOCK_PRICE_PAISE,
      purpose: 'unlock',
      stubPrompt: `Free-tier unlock for generation ${gen.id}`,
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
      { id: gen.id, unlocked: true, adminBypass: true },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { id: gen.id, payment: order.payment },
    { status: 201 }
  );
}
