export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { PaymentHttpError, claimPaymentPaid } from '@/lib/payments/manual-upi';

/**
 * POST /api/orders/[code]/claim-paid
 * Owner-gated. The user paid in their UPI app and tapped "I've paid" —
 * no UTR, no screenshot. Moves PAYMENT_PENDING → PAYMENT_AWAITING_OWNER
 * (idempotent) and the phone-ping watcher takes it from there.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { user, response: authResponse } = await requireSession();
    if (!user) return authResponse;
    const { code } = await params;
    if (typeof code !== 'string' || !code) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
    }
    const result = await claimPaymentPaid({ code, userId: user.id });
    return NextResponse.json(
      {
        ok: true,
        status: result.status,
        shortCode: result.shortCode ?? null,
        message:
          'Payment claimed — the studio owner has been notified and will confirm shortly.',
      },
      { status: 200 }
    );
  } catch (e) {
    if (e instanceof PaymentHttpError) {
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
