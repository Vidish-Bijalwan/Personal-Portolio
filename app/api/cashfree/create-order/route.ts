export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import {
  buildCashfreeOrderPayload,
  createCashfreeOrder,
  getCashfreeConfig,
  isValidIndianPhone,
  CashfreeHttpError,
} from '@/lib/payments/cashfree';

/**
 * POST /api/cashfree/create-order
 * Body: { orderCode, customerPhone }
 *
 * Owner-gated. Creates a Cashfree PG order for an existing internal
 * PAYMENT_PENDING order (created by /api/gen/[id]/unlock or /api/video/order)
 * and returns { paymentSessionId, mode } for the hosted checkout.
 *
 * LAW: amount comes from the server-side order row — never from the client.
 * The client only supplies which order and the payer's phone number
 * (required by Cashfree's API).
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  // Admin bypass: the owner never sees payment UI — nothing to create.
  if (isAdminEmail(user.email)) {
    return NextResponse.json({ adminBypass: true });
  }

  const body = await req.json().catch(() => null);
  const orderCode =
    typeof body?.orderCode === 'string' ? body.orderCode.trim() : '';
  const customerPhone =
    typeof body?.customerPhone === 'string' ? body.customerPhone.trim() : '';
  if (!orderCode) {
    return NextResponse.json(
      { code: 'INVALID_ORDER', error: 'orderCode is required' },
      { status: 400 }
    );
  }
  if (!isValidIndianPhone(customerPhone)) {
    return NextResponse.json(
      {
        code: 'INVALID_PHONE',
        error: 'Enter a valid 10-digit Indian mobile number',
      },
      { status: 400 }
    );
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.code, orderCode))
    .limit(1);
  if (!order) {
    return NextResponse.json(
      { code: 'ORDER_NOT_FOUND', error: 'Order not found' },
      { status: 404 }
    );
  }
  if (order.userId !== user.id) {
    return NextResponse.json(
      { code: 'FORBIDDEN', error: 'Not your order' },
      { status: 403 }
    );
  }
  if (order.status !== 'PAYMENT_PENDING') {
    return NextResponse.json(
      { code: 'ORDER_NOT_PAYABLE', error: `Order is ${order.status}` },
      { status: 409 }
    );
  }

  let cfg;
  try {
    cfg = getCashfreeConfig();
  } catch {
    return NextResponse.json(
      { code: 'CASHFREE_NOT_CONFIGURED', error: 'Online payments are not configured yet' },
      { status: 503 }
    );
  }

  // Unique per attempt: a retry mints a fresh gateway order; abandoned ones expire.
  const cashfreeOrderId = `etch_${order.code}_${Date.now().toString(36)}`;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tryetch.online';
  let payload;
  try {
    payload = buildCashfreeOrderPayload({
      cashfreeOrderId,
      amountPaise: order.amountPaise,
      customerId: user.id,
      customerEmail: user.email ?? undefined,
      customerPhone,
      returnUrl: `${siteUrl}/api/cashfree/return`,
      notifyUrl: `${siteUrl}/api/cashfree/webhook`,
    });
  } catch (e) {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: e instanceof Error ? e.message : 'Bad request' },
      { status: 400 }
    );
  }

  try {
    const result = await createCashfreeOrder(payload, cfg);
    await db
      .update(orders)
      .set({ cashfreeOrderId: result.cashfreeOrderId, provider: 'cashfree' })
      .where(eq(orders.id, order.id));
    return NextResponse.json({
      ok: true,
      paymentSessionId: result.paymentSessionId,
      cashfreeOrderId: result.cashfreeOrderId,
      mode: cfg.checkoutMode,
    });
  } catch (e) {
    if (e instanceof CashfreeHttpError) {
      return NextResponse.json(
        { code: e.code, error: e.message },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
