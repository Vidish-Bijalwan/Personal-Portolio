export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthFail } from '@/lib/fulfillment/guards';
import { loadFulfillmentDetail } from '@/lib/fulfillment/detail';

/** GET /api/admin/fulfillment/[id] — full job detail per contract §5. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  const { id } = await params;
  const detail = await loadFulfillmentDetail(id);
  if (!detail) {
    return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 });
  }
  return NextResponse.json(detail, { status: 200 });
}
