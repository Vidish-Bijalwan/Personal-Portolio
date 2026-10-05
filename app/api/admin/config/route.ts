export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { adminConfig } from '@/lib/db/schema';
import { adminAuthFail, auditAdmin } from '@/lib/fulfillment/guards';
import {
  FULFILLMENT_CONFIG_KEYS,
  getFulfillmentConfig,
  normalizeConfigValue,
} from '@/lib/fulfillment/config';

/**
 * GET /api/admin/config — whitelisted fulfillment keys (effective values:
 * DB > env > defaults).
 */
export async function GET(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  const cfg = await getFulfillmentConfig();
  const out: Record<string, string | number | null> = {};
  for (const k of FULFILLMENT_CONFIG_KEYS) {
    const v = cfg[k];
    out[k] = typeof v === 'boolean' ? String(v) : v;
  }
  return NextResponse.json({ config: out }, { status: 200 });
}

/**
 * PUT /api/admin/config {key, value} — keys whitelisted to the 4 fulfillment keys.
 */
export async function PUT(req: NextRequest) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  const body = await req.json().catch(() => null);
  const key = typeof body?.key === 'string' ? body.key : '';
  if (!(FULFILLMENT_CONFIG_KEYS as readonly string[]).includes(key)) {
    return NextResponse.json({ error: 'INVALID_KEY' }, { status: 400 });
  }
  let value: string | null;
  try {
    value = normalizeConfigValue(key, body?.value);
  } catch (e) {
    return NextResponse.json(
      { error: 'INVALID_VALUE', message: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
  await db
    .insert(adminConfig)
    .values({ key, value })
    .onConflictDoUpdate({
      target: adminConfig.key,
      set: { value, updatedAt: new Date() },
    });
  await auditAdmin('fulfillment.config_update', { key, value });
  return NextResponse.json({ ok: true, key, value }, { status: 200 });
}
