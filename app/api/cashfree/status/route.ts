export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  derivePaymentStatus,
  listRecentCashfreeOrders,
  resolvePostPaymentDestination,
  type PaymentStatusOrderLite,
} from '@/lib/payments/cashfree';

/**
 * GET /api/cashfree/status
 *
 * For the logged-in user: their recent cashfree orders (newest first)
 * with the post-payment destination resolved, plus the derived page state.
 * Polled by /payment/status while a payment is confirming.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const rows = await listRecentCashfreeOrders(user.id);
  const orders: PaymentStatusOrderLite[] = await Promise.all(
    rows.map(async (r) => ({
      code: r.code,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      destination: await resolvePostPaymentDestination(r.id).catch(
        () => '/payment/status'
      ),
    }))
  );
  return NextResponse.json({
    state: derivePaymentStatus(orders, Date.now()),
    orders,
  });
}
