export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationJobs, orders, users } from '@/lib/db/schema';

function unauthorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN;
}

/** GET — orders awaiting manual verification. Admin token auth. */
export async function GET(req: NextRequest) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const rows = await db
    .select({
      code: orders.code,
      shortCode: orders.shortCode,
      userEmail: users.email,
      jobPrompt: generationJobs.prompt,
      amountPaise: orders.amountPaise,
      utrReference: orders.utrReference,
      duplicateFlag: orders.duplicateFlag,
      submittedAt: orders.updatedAt,
      status: orders.status,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(generationJobs, eq(orders.jobId, generationJobs.id))
    .where(inArray(orders.status, ['PAYMENT_SUBMITTED', 'PAYMENT_AWAITING_OWNER']))
    .orderBy(desc(orders.updatedAt));
  return NextResponse.json(rows, { status: 200 });
}
