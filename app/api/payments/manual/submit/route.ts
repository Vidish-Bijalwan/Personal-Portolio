export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { PaymentHttpError, submitPaymentUtr } from '@/lib/payments/manual-upi';

/** POST {code, utrReference, screenshotAssetId?} → PAYMENT_SUBMITTED. */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    const { code, utrReference, screenshotAssetId } = body ?? {};
    if (typeof code !== 'string' || !code) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
    }
    if (typeof utrReference !== 'string' || !utrReference) {
      return NextResponse.json({ error: 'INVALID_UTR' }, { status: 400 });
    }
    const result = await submitPaymentUtr({
      code,
      utrReference,
      screenshotAssetId:
        typeof screenshotAssetId === 'string' ? screenshotAssetId : undefined,
      userId: user.id,
    });
    return NextResponse.json(
      {
        status: result.status,
        duplicateFlag: result.duplicateFlag,
        message:
          'Payment submitted — waiting for confirmation. Your creation enters the generation queue after confirmation.',
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
