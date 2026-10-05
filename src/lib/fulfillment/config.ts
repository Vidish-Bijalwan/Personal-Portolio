/**
 * VILISH Studio — fulfillment config helper (Phase 2 contract §4).
 *
 * Reads adminConfig (DB) first, falls back to env, then hardcoded defaults.
 * DB wins over env. Money: N/A (strings / nullable cap).
 */
import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { adminConfig } from '@/lib/db/schema';

export const FULFILLMENT_CONFIG_KEYS = [
  'FULFILLMENT_MODE',
  'ORDERS_ACCEPTING',
  'MAX_OPERATOR_ORDERS_PER_DAY',
  'OPERATOR_ESTIMATED_TURNAROUND',
] as const;

export type FulfillmentConfigKey = (typeof FULFILLMENT_CONFIG_KEYS)[number];

const DEFAULTS: Record<FulfillmentConfigKey, string | null> = {
  FULFILLMENT_MODE: 'operator',
  ORDERS_ACCEPTING: 'true',
  MAX_OPERATOR_ORDERS_PER_DAY: null, // no cap when null
  OPERATOR_ESTIMATED_TURNAROUND:
    'Typical processing time: 30 minutes – several hours',
};

const ENV_FALLBACK: Record<FulfillmentConfigKey, string | undefined> = {
  FULFILLMENT_MODE: process.env.FULFILLMENT_MODE,
  ORDERS_ACCEPTING: process.env.ORDERS_ACCEPTING,
  MAX_OPERATOR_ORDERS_PER_DAY: process.env.MAX_OPERATOR_ORDERS_PER_DAY,
  OPERATOR_ESTIMATED_TURNAROUND: process.env.OPERATOR_ESTIMATED_TURNAROUND,
};

export interface FulfillmentConfig {
  FULFILLMENT_MODE: 'operator' | 'provider';
  ORDERS_ACCEPTING: boolean;
  /** null = no cap */
  MAX_OPERATOR_ORDERS_PER_DAY: number | null;
  OPERATOR_ESTIMATED_TURNAROUND: string;
}

function asString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  return String(v);
}

function rawValue(
  key: FulfillmentConfigKey,
  dbValues: Map<string, unknown>
): string | null {
  if (dbValues.has(key)) return asString(dbValues.get(key));
  const env = ENV_FALLBACK[key];
  if (env !== undefined && env !== '') return env;
  return DEFAULTS[key];
}

/**
 * Load the effective fulfillment config. DB (admin_config) > env > defaults.
 */
export async function getFulfillmentConfig(): Promise<FulfillmentConfig> {
  const rows = await db
    .select({ key: adminConfig.key, value: adminConfig.value })
    .from(adminConfig)
    .where(
      inArray(adminConfig.key, [...FULFILLMENT_CONFIG_KEYS] as string[])
    );
  const dbValues = new Map<string, unknown>(
    rows.map((r) => [r.key, r.value])
  );

  const modeRaw = (
    rawValue('FULFILLMENT_MODE', dbValues) ?? 'operator'
  ).toLowerCase();
  const mode: 'operator' | 'provider' =
    modeRaw === 'provider' ? 'provider' : 'operator';

  const acceptingRaw = (rawValue('ORDERS_ACCEPTING', dbValues) ?? 'true')
    .trim()
    .toLowerCase();
  const accepting = acceptingRaw !== 'false' && acceptingRaw !== '0';

  const capRaw = rawValue('MAX_OPERATOR_ORDERS_PER_DAY', dbValues);
  let cap: number | null = null;
  if (capRaw !== null && capRaw.trim() !== '') {
    const n = Number(capRaw);
    cap = Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  }

  return {
    FULFILLMENT_MODE: mode,
    ORDERS_ACCEPTING: accepting,
    MAX_OPERATOR_ORDERS_PER_DAY: cap,
    OPERATOR_ESTIMATED_TURNAROUND:
      rawValue('OPERATOR_ESTIMATED_TURNAROUND', dbValues) ??
      (DEFAULTS.OPERATOR_ESTIMATED_TURNAROUND as string),
  };
}

/** Validate a PUT value for a whitelisted key. Returns the normalized value or throws. */
export function normalizeConfigValue(
  key: string,
  value: unknown
): string | null {
  if (!(FULFILLMENT_CONFIG_KEYS as readonly string[]).includes(key)) {
    throw new Error(`INVALID_KEY: ${key}`);
  }
  if (value === null || value === undefined || value === '') return null;
  const s = String(value).trim();
  switch (key) {
    case 'FULFILLMENT_MODE': {
      const m = s.toLowerCase();
      if (m !== 'operator' && m !== 'provider') {
        throw new Error('FULFILLMENT_MODE must be operator|provider');
      }
      return m;
    }
    case 'ORDERS_ACCEPTING': {
      const b = s.toLowerCase();
      if (b === 'true' || b === '1') return 'true';
      if (b === 'false' || b === '0') return 'false';
      throw new Error('ORDERS_ACCEPTING must be true|false');
    }
    case 'MAX_OPERATOR_ORDERS_PER_DAY': {
      const n = Number(s);
      if (!Number.isFinite(n) || n < 0) {
        throw new Error('MAX_OPERATOR_ORDERS_PER_DAY must be a non-negative number or null');
      }
      return String(Math.floor(n));
    }
    default:
      return s;
  }
}
