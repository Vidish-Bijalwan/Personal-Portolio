export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PaymentHttpError, rejectOrderPayment } from '@/lib/payments/manual-upi';

function unauthorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN;
}

/**
 * POST /api/admin/payments/[code]/unclaim
 * Admin/owner only (x-admin-token). The owner replied NO to the phone ping
 * (payment not received): the order goes back to PAYMENT_PENDING so the
 * user can check their UPI app and tap "I've paid" again.
 * Accepts the full order code or the 4-char short code from the ping.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { code } = await params;
  try {
    const result = await rejectOrderPayment({ code });
    return NextResponse.json({ ok: true, status: result.status });
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
