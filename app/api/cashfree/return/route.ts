export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import {
  fetchCashfreeOrder,
  findRecentPendingCashfreeOrder,
  getCashfreeConfig,
  isCashfreePaidStatus,
  markCashfreeOrderPaid,
  resolvePostPaymentDestination,
  CashfreeHttpError,
} from '@/lib/payments/cashfree';

type OrderRow = typeof orders.$inferSelect;

const STATUS_PAGE = '/payment/status';

/**
 * GET /api/cashfree/return?order_id=<cashfree order id>[&code=<internal order code>]
 *
 * Where Cashfree sends the customer after checkout (Cashfree appends
 * order_id to the return_url — the URL is kept a static path because
 * appending to a URL that already carries a query string is unreliable).
 *
 * Order identification, in order:
 *  1. Cashfree's `order_id` query param via our stored cashfreeOrderId (unique)
 *  2. The legacy `code` param
 *  3. Session fallback: the logged-in user's most recent PAYMENT_PENDING
 *     cashfree order from the last 60 minutes (the `_self` redirect does
 *     not reliably carry `order_id` — seen in production: paid order, no
 *     usable query params)
 *
 * Identification NEVER fulfils: the order status is re-fetched from
 * Cashfree's API, and only order_status === 'PAID' marks the internal order
 * verified (idempotent — safe if the webhook already fired).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get('code') ?? '';
  const cfOrderIdParam = params.get('order_id') ?? '';

  const fail = (dest: string) =>
    NextResponse.redirect(new URL(`${dest}?payment=failed`, req.url));

  let order: OrderRow | undefined;
  let identifiedBy: 'order_id' | 'code' | 'session' | 'none' = 'none';

  if (cfOrderIdParam) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.cashfreeOrderId, cfOrderIdParam))
      .limit(1);
    if (order) identifiedBy = 'order_id';
  }
  if (!order && code) {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.code, code))
      .limit(1);
    if (order) identifiedBy = 'code';
  }

  // Session fallback when the redirect carries nothing usable.
  if (!order) {
    const { user } = await requireSession();
    if (user) {
      order = await findRecentPendingCashfreeOrder(user.id);
      if (order) identifiedBy = 'session';
    }
    if (!order) {
      // Observability: log WHICH params Cashfree actually sent (names only,
      // no values — no PII) so we can see what the `_self` redirect carries.
      console.warn('[cashfree/return] order unidentified', {
        params: [...params.keys()],
        identifiedBy,
        hasSession: !!user,
      });
      return NextResponse.redirect(new URL(STATUS_PAGE, req.url));
    }
  }

  const dest = await resolvePostPaymentDestination(order.id).catch(
    () => STATUS_PAGE
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
    const marked = await markCashfreeOrderPaid({
      cashfreeOrderId: status.orderId,
      cfPaymentId: null,
      paidAmountPaise: Math.round(status.orderAmount * 100),
      rawPayload: {
        source: 'return_url',
        identifiedBy,
        order_status: status.orderStatus,
      },
    });
    if (!marked.ok) {
      console.warn('[cashfree/return] verify refused', {
        code: order.code,
        reason: marked.reason,
      });
      return NextResponse.redirect(new URL(STATUS_PAGE, req.url));
    }
    return NextResponse.redirect(new URL(dest, req.url));
  } catch (e) {
    if (e instanceof CashfreeHttpError) {
      return fail(dest.split('?')[0]);
    }
    return NextResponse.redirect(new URL(STATUS_PAGE, req.url));
  }
}
