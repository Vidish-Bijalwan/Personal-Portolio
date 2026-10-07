export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import { UNLOCK_PRICE_PAISE } from '@/lib/free/policy';
import { getOwnedGeneration } from '@/lib/free/access';
import { createGenerationOrder, findPendingOrderLink } from '@/lib/free/orders';
import { verifyOrderAdminBypass } from '@/lib/payments/manual-upi';
import {
  VIDEO_DURATION_MIN_S,
  videoClipPricePaise,
} from '@/lib/pricing/engine';

/**
 * POST /api/gen/[id]/unlock
 * Owner-gated. Generate-first unlock for TWO generation kinds:
 *
 * - FREE-TIER IMAGES (tier='free', mediaType='image'): the image previewed
 *   first; unlock mints a ₹19 (1900 paise) manual-UPI order with
 *   purpose='unlock'.
 * - PAID VIDEOS (tier='paid', mediaType='video'): the clip previewed first;
 *   unlock mints the order with purpose='video' at the server-side price
 *   videoClipPricePaise(durationSeconds) taken from the row's stored
 *   duration_seconds — the client never sets the price.
 *
 * Requires status=done and unlocked=false. Idempotent: a still-pending
 * unlock/video order is resumed instead of duplicated. Returns { id,
 * payment } in the payment-modal shape so the existing UPI/Cashfree flow
 * works unchanged; the verify hook (runUnlockHooks) flips
 * generations.unlocked.
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

  const isFreeImage = gen.tier === 'free' && gen.mediaType === 'image';
  const isPaidVideo = gen.tier === 'paid' && gen.mediaType === 'video';
  if (!isFreeImage && !isPaidVideo) {
    return NextResponse.json(
      {
        code: 'NOT_UNLOCKABLE',
        error: 'Unlock orders are for free-tier images and paid videos only',
      },
      { status: 400 }
    );
  }
  if (gen.status !== 'done') {
    return NextResponse.json(
      { code: 'NOT_DELIVERED', error: 'It is not delivered yet' },
      { status: 409 }
    );
  }
  if (gen.unlocked) {
    return NextResponse.json(
      { code: 'ALREADY_UNLOCKED', error: 'Already unlocked' },
      { status: 409 }
    );
  }

  // Paid video: price from the row's stored duration — server-side, never
  // the client's word. purpose='video' is what runUnlockHooks flips on
  // PAYMENT_VERIFIED, and resuming a still-pending order keeps the flow
  // idempotent (also covers rows queued before the generate-first change).
  let amountPaise: number;
  let purpose: 'unlock' | 'video';
  let stubPrompt: string;
  if (isPaidVideo) {
    const durationSeconds = gen.durationSeconds ?? VIDEO_DURATION_MIN_S;
    amountPaise = videoClipPricePaise(durationSeconds);
    purpose = 'video';
    stubPrompt = `Paid ${durationSeconds}s video unlock for generation ${gen.id}`;
  } else {
    amountPaise = UNLOCK_PRICE_PAISE;
    purpose = 'unlock';
    stubPrompt = `Free-tier unlock for generation ${gen.id}`;
  }

  const resumed = await findPendingOrderLink(gen.id, purpose);
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
      amountPaise,
      purpose,
      stubPrompt,
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
