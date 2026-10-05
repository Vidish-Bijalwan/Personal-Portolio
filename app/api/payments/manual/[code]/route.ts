export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { ManualUpiProvider } from '@/lib/payments/manual-upi';

/** GET /api/payments/manual/[code] — owner or admin. Payment details while PENDING. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;
  const { code } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.code, code))
    .limit(1);
  if (!order) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }
  const isAdmin = (user as { role?: string }).role === 'admin';
  if (!isAdmin && order.userId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  const payload: Record<string, unknown> = {
    code: order.code,
    status: order.status,
    amountPaise: order.amountPaise,
    expiresAt: order.expiresAt,
    duplicateFlag: order.duplicateFlag,
  };
  if (order.status === 'PAYMENT_PENDING') {
    // Rebuild the checkout server-side (VPA/amount from env + order row).
    const checkout = await new ManualUpiProvider().createCheckout({
      code: order.code,
      amountPaise: order.amountPaise,
    });
    payload.upiUri = checkout.upiUri;
    payload.vpa = checkout.vpa;
    if (checkout.qrDataUri) payload.qrDataUri = checkout.qrDataUri;
    if (checkout.qrImageUrl) payload.qrImageUrl = checkout.qrImageUrl;
  }
  return NextResponse.json(payload, { status: 200 });
}
