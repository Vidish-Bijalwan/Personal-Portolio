export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { adminConfig } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

const KEYS = [
  'OPERATOR_ESTIMATED_TURNAROUND',
  'ORDERS_ACCEPTING',
  'FULFILLMENT_MODE',
] as const;

const DEFAULT_TURNAROUND = 'Typical processing time: 30 minutes – several hours';
const DEFAULT_ORDERS_ACCEPTING = true;
const DEFAULT_FULFILLMENT_MODE = 'operator';

/**
 * GET /api/config/public
 * Public, unauthenticated. Returns the customer-facing fulfillment config.
 * Reads admin_config (DB wins), falls back to env, then hardcoded defaults —
 * the same precedence as getFulfillmentConfig() in the contract.
 */
export async function GET() {
  const values: Record<string, unknown> = {};
  try {
    const rows = await db
      .select({ key: adminConfig.key, value: adminConfig.value })
      .from(adminConfig)
      .where(inArray(adminConfig.key, [...KEYS]));
    for (const row of rows) values[row.key] = row.value;
  } catch {
    // DB unavailable (or keys not seeded yet) — fall through to env/defaults.
  }

  const pick = (key: (typeof KEYS)[number]): unknown => {
    const v = values[key];
    if (v !== undefined && v !== null && v !== '') return v;
    const env = process.env[key];
    if (env !== undefined && env !== '') return env;
    return undefined;
  };

  const turnaroundRaw = pick('OPERATOR_ESTIMATED_TURNAROUND');
  const turnaround =
    typeof turnaroundRaw === 'string' && turnaroundRaw.trim()
      ? turnaroundRaw
      : DEFAULT_TURNAROUND;

  const ordersRaw = pick('ORDERS_ACCEPTING');
  const ordersAccepting =
    typeof ordersRaw === 'boolean'
      ? ordersRaw
      : ordersRaw === undefined
        ? DEFAULT_ORDERS_ACCEPTING
        : String(ordersRaw).toLowerCase() !== 'false';

  const modeRaw = pick('FULFILLMENT_MODE');
  const fulfillmentMode =
    typeof modeRaw === 'string' && modeRaw.trim()
      ? modeRaw
      : DEFAULT_FULFILLMENT_MODE;

  return NextResponse.json(
    { turnaround, ordersAccepting, fulfillmentMode },
    { headers: { 'cache-control': 'no-store' } },
  );
}
