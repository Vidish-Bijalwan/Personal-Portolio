export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationOrders, orders } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { getOwnedGeneration } from '@/lib/free/access';

/**
 * GET /api/gen/[id]/payment
 * Owner-gated. Returns the latest manual-UPI order linked to this
 * generation (via generation_orders), so the watch room can re-open or
 * resume payment cross-device. { order: null } when no order exists yet.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  const { gen, error } = await getOwnedGeneration(id, user.id);
  if (error) return error;

  const links = await db
    .select()
    .from(generationOrders)
    .where(eq(generationOrders.generationId, gen.id))
    .orderBy(desc(generationOrders.createdAt))
    .limit(1);
  const link = links[0];
  if (!link) {
    return NextResponse.json({ order: null });
  }

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, link.orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order) {
    return NextResponse.json({ order: null });
  }

  return NextResponse.json({
    order: {
      code: order.code,
      status: order.status,
      amountPaise: order.amountPaise,
      purpose: link.purpose,
      expiresAt: order.expiresAt ? order.expiresAt.toISOString() : null,
    },
  });
}
