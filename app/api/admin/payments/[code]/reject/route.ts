export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  PaymentHttpError,
  rejectPaymentOrder,
} from '@/lib/payments/manual-upi';

function unauthorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN;
}

/** POST {reason?} → PAYMENT_REJECTED + audit log. Admin token auth. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { code } = await params;
  try {
    const body = await req.json().catch(() => null);
    const result = await rejectPaymentOrder({
      code,
      adminUserId: 'admin',
      reason: typeof body?.reason === 'string' ? body.reason : undefined,
    });
    return NextResponse.json({ ok: true, status: result.status }, { status: 200 });
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
