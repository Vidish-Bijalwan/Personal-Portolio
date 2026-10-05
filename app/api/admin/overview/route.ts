export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/admin/overview
 * Gated by the x-admin-token header (401 otherwise). Returns aggregate
 * counts for the admin dashboard: jobs by state, orders by status,
 * payments awaiting UTR verification, verified revenue, recent jobs.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = req.headers.get('x-admin-token');
  if (!expected || provided !== expected) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', error: 'Invalid admin token' },
      { status: 401 }
    );
  }

  const jobs = await db.select().from(schema.generationJobs);
  const orders = await db.select().from(schema.orders);

  const jobsByState: Record<string, number> = {};
  for (const j of jobs as Array<{ state: string }>) {
    jobsByState[j.state] = (jobsByState[j.state] ?? 0) + 1;
  }

  const ordersByStatus: Record<string, number> = {};
  let verifiedRevenuePaise = 0;
  let pendingVerification = 0;
  for (const o of orders as Array<{
    status: string;
    amountPaise: number;
  }>) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    if (o.status === 'PAYMENT_VERIFIED') {
      verifiedRevenuePaise += o.amountPaise ?? 0;
    }
    if (o.status === 'PAYMENT_SUBMITTED') {
      pendingVerification += 1;
    }
  }

  const recentJobs = await db
    .select({
      id: schema.generationJobs.id,
      state: schema.generationJobs.state,
      customerPrice: schema.generationJobs.customerPrice,
      createdAt: schema.generationJobs.createdAt,
    })
    .from(schema.generationJobs)
    .orderBy(desc(schema.generationJobs.createdAt))
    .limit(10);

  return NextResponse.json({
    jobs: { total: jobs.length, byState: jobsByState },
    orders: { total: orders.length, byStatus: ordersByStatus },
    pendingVerification,
    verifiedRevenuePaise,
    recentJobs,
  });
}
