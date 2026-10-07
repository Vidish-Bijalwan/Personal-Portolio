export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { generationOrders, generations, orders } from '@/lib/db/schema';
import { orderItemLabel } from '@/lib/me/profile';

const HISTORY_LIMIT = 50;

export interface MyOrderItem {
  code: string;
  amountPaise: number;
  status: string;
  provider: string;
  createdAt: string;
  itemLabel: string;
  /** linked generation (for re-download); null when not applicable */
  generationId: string | null;
  /** clean download; only when the linked generation is unlocked */
  downloadUrl: string | null;
}

/**
 * GET /api/me/orders
 * The signed-in user's purchase history: newest first.
 * Strictly owner-scoped — userId is always the session user.
 * downloadUrl is only present when the linked generation is unlocked,
 * so a locked item can never be fetched through this list.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const rows = await db
    .select({
      code: orders.code,
      amountPaise: orders.amountPaise,
      status: orders.status,
      provider: orders.provider,
      createdAt: orders.createdAt,
      purpose: generationOrders.purpose,
      generationId: generationOrders.generationId,
      mediaType: generations.mediaType,
      unlocked: generations.unlocked,
    })
    .from(orders)
    .leftJoin(generationOrders, eq(generationOrders.orderId, orders.id))
    .leftJoin(generations, eq(generations.id, generationOrders.generationId))
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(HISTORY_LIMIT);

  const items: MyOrderItem[] = rows.map((r) => ({
    code: r.code,
    amountPaise: r.amountPaise,
    status: r.status,
    provider: r.provider,
    createdAt: r.createdAt.toISOString(),
    itemLabel: orderItemLabel(r.purpose, r.mediaType),
    generationId: r.generationId,
    downloadUrl:
      r.generationId && r.unlocked ? `/api/gen/${r.generationId}/clean` : null,
  }));

  return NextResponse.json({ items });
}
