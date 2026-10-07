export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import {
  fetchCashfreeOrder,
  getCashfreeConfig,
  isCashfreePaidStatus,
  markCashfreeOrderPaid,
  resolvePostPaymentDestination,
  CashfreeHttpError,
} from '@/lib/payments/cashfree';

/**
 * GET /api/cashfree/return?order_id=<cashfree order id>[&code=<internal order code>]
 *
 * Where Cashfree sends the customer after checkout (Cashfree appends
 * order_id to the return_url — the URL is kept a static path because
 * appending to a URL that already carries a query string is unreliable).
 * Order lookup prefers Cashfree's order_id via our stored cashfreeOrderId
 * (unique); the legacy code param is a fallback. NEVER trusts the redirect
 * alone: the order status is re-fetched from Cashfree's API, and only
 * order_status === 'PAID' marks the internal order verified (idempotent —
 * safe if the webhook already fired).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get('code') ?? '';
  const cfOrderIdParam = params.get('order_id') ?? '';

  const fail = (dest: string) =>
    NextResponse.redirect(new URL(`${dest}?payment=failed`, req.url));

  let order: typeof orders.$inferSelect | undefined;
  if (cfOrderIdParam) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.cashfreeOrderId, cfOrderIdParam))
      .limit(1);
  }
  if (!order && code) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.code, code))
      .limit(1);
  }
  if (!order) {
    return NextResponse.redirect(new URL('/?payment=error', req.url));
  }
  const dest = await resolvePostPaymentDestination(order.id).catch(
    () => '/?payment=error'
  );

  let cfg;
  try {
    cfg = getCashfreeConfig();
  } catch {
    return fail(dest);
  }
  const cashfreeOrderId = order.cashfreeOrderId ?? cfOrderIdParam;
  if (!cashfreeOrderId) return fail(dest);

  try {
    const status = await fetchCashfreeOrder(cashfreeOrderId, cfg);
    if (!isCashfreePaidStatus(status.orderStatus)) {
      // Not paid (user dropped / failed): back to the order page, order
      // stays PAYMENT_PENDING so they can retry.
      return fail(dest.split('?')[0]);
    }
    await markCashfreeOrderPaid({
      cashfreeOrderId: status.orderId,
      cfPaymentId: null,
      paidAmountPaise: Math.round(status.orderAmount * 100),
      rawPayload: { source: 'return_url', order_status: status.orderStatus },
    });
    return NextResponse.redirect(new URL(dest, req.url));
  } catch (e) {
    if (e instanceof CashfreeHttpError) {
      return fail(dest.split('?')[0]);
    }
    return NextResponse.redirect(new URL('/?payment=error', req.url));
  }
}
