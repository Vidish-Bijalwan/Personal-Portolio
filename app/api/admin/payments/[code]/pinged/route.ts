export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { OWNER_PING_MAX } from '@/lib/payments/manual-upi';

function unauthorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN;
}

/**
 * POST /api/admin/payments/[code]/pinged
 * Admin/owner only (x-admin-token). Records that the owner was phone-pinged
 * about a claimed payment: ownerPingedAt=now, pingCount+1. The payment-watch
 * cron calls this over HTTPS (the watcher sandbox cannot reach Postgres
 * directly). Accepts the full order code or the 4-char short code.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { code } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.code, code))
    .limit(1);
  const target =
    order ??
    (
      await db
        .select()
        .from(orders)
        .where(eq(orders.shortCode, code))
        .limit(1)
    )[0];
  if (!target) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }
  if (target.pingCount >= OWNER_PING_MAX) {
    return NextResponse.json(
      { error: 'PING_LIMIT_REACHED', pingCount: target.pingCount },
      { status: 409 }
    );
  }
  const [updated] = await db
    .update(orders)
    .set({ ownerPingedAt: new Date(), pingCount: target.pingCount + 1 })
    .where(eq(orders.id, target.id))
    .returning({ shortCode: orders.shortCode, pingCount: orders.pingCount });
  return NextResponse.json({ ok: true, ...updated });
}
