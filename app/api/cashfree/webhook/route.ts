export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import {
  getCashfreeConfig,
  markCashfreeOrderPaid,
  verifyCashfreeWebhookSignature,
} from '@/lib/payments/cashfree';

/**
 * POST /api/cashfree/webhook
 *
 * Cashfree server-to-server event delivery. Every request is authenticated
 * by HMAC-SHA256 signature over (x-webhook-timestamp + RAW body) — bad
 * signatures get 401 and are discarded without inspection.
 *
 * Idempotent: markCashfreeOrderPaid no-ops on already-verified orders, so
 * duplicate deliveries and the return-URL race are both safe.
 */
export async function POST(req: NextRequest) {
  // Raw body — NEVER parsed-then-reserialized (that breaks the signature).
  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');

  let secret: string;
  try {
    secret = getCashfreeConfig().clientSecret;
  } catch {
    return NextResponse.json(
      { code: 'CASHFREE_NOT_CONFIGURED' },
      { status: 500 }
    );
  }

  if (
    !verifyCashfreeWebhookSignature({ signature, timestamp, rawBody, secret })
  ) {
    return NextResponse.json({ code: 'BAD_SIGNATURE' }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: {
      order?: { order_id?: string };
      payment?: { cf_payment_id?: string; payment_amount?: number };
    };
  } | null = null;
  try {
    event = JSON.parse(rawBody);
  } catch {
    event = null;
  }
  if (!event) return NextResponse.json({ ok: true });

  const type = event.type ?? '';
  if (type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'ORDER_PAID_WEBHOOK') {
    const cashfreeOrderId = event.data?.order?.order_id;
    const cfPaymentId = event.data?.payment?.cf_payment_id ?? null;
    const amountRupees = event.data?.payment?.payment_amount;
    if (!cashfreeOrderId || typeof amountRupees !== 'number') {
      return NextResponse.json({ ok: true });
    }
    const result = await markCashfreeOrderPaid({
      cashfreeOrderId,
      cfPaymentId,
      paidAmountPaise: Math.round(amountRupees * 100),
      rawPayload: event,
    });
    return NextResponse.json({ ok: true, verified: result.ok });
  }

  // PAYMENT_FAILED_WEBHOOK / PAYMENT_USER_DROPPED_WEBHOOK and others:
  // acknowledge; the order stays PAYMENT_PENDING so the user can retry.
  return NextResponse.json({ ok: true });
}
