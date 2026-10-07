/**
 * Etch — fulfillment config (phase 2, OPERATOR FULFILLMENT MODE).
 *
 * LAW (contract §4): precedence is adminConfig DB row > env var > hardcoded
 * default. Keys:
 *   FULFILLMENT_MODE              'operator' | 'provider' (default 'operator')
 *   ORDERS_ACCEPTING              'true' | 'false'        (default true)
 *   MAX_OPERATOR_ORDERS_PER_DAY   number-as-string | null (default null = no cap)
 *   OPERATOR_ESTIMATED_TURNAROUND free text               (default below)
 */
import { inArray } from 'drizzle-orm';
import { getDb } from './client';
import { adminConfig } from './schema';

export const FULFILLMENT_CONFIG_KEYS = [
  'FULFILLMENT_MODE',
  'ORDERS_ACCEPTING',
  'MAX_OPERATOR_ORDERS_PER_DAY',
  'OPERATOR_ESTIMATED_TURNAROUND',
] as const;

export const FULFILLMENT_DEFAULTS = {
  FULFILLMENT_MODE: 'operator',
  ORDERS_ACCEPTING: 'true',
  MAX_OPERATOR_ORDERS_PER_DAY: null as string | null,
  OPERATOR_ESTIMATED_TURNAROUND:
    'Typical processing time: 30 minutes – several hours',
} as const;

export interface FulfillmentConfig {
  fulfillmentMode: 'operator' | 'provider';
  ordersAccepting: boolean;
  /** null = no daily cap */
  maxOperatorOrdersPerDay: number | null;
  operatorEstimatedTurnaround: string;
}

/**
 * Resolve one config value by precedence: DB row > env var > default.
 * A DB row that EXISTS wins even when its value is JSON null — null means
 * "unset / no cap", not "fall through".
 */
async function resolveRaw(key: string): Promise<string | null> {
  const dbValues = new Map<string, unknown>();
  try {
    const rows = await getDb()
      .select({ key: adminConfig.key, value: adminConfig.value })
      .from(adminConfig)
      .where(
        inArray(adminConfig.key, [...FULFILLMENT_CONFIG_KEYS])
      );
    for (const row of rows) dbValues.set(row.key, row.value);
  } catch {
    // DB unreachable: fall through to env/defaults so the app still boots,
    // quotes, and serves without a live database.
  }

  if (dbValues.has(key)) {
    const v = dbValues.get(key);
    if (v === null || v === undefined) return null;
    return String(v);
  }

  const env = process.env[key];
  if (env !== undefined) return env;

  const fallback = FULFILLMENT_DEFAULTS[key as keyof typeof FULFILLMENT_DEFAULTS];
  return fallback ?? null;
}

function parseBoolean(raw: string | null, defaultValue: boolean): boolean {
  if (raw === null) return defaultValue;
  const v = raw.trim().toLowerCase();
  if (['false', '0', 'no', 'off'].includes(v)) return false;
  if (['true', '1', 'yes', 'on'].includes(v)) return true;
  return defaultValue;
}

function parseCap(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/** Read the effective fulfillment config (DB wins over env, env over defaults). */
export async function getFulfillmentConfig(): Promise<FulfillmentConfig> {
  const [modeRaw, acceptingRaw, capRaw, turnaroundRaw] = await Promise.all([
    resolveRaw('FULFILLMENT_MODE'),
    resolveRaw('ORDERS_ACCEPTING'),
    resolveRaw('MAX_OPERATOR_ORDERS_PER_DAY'),
    resolveRaw('OPERATOR_ESTIMATED_TURNAROUND'),
  ]);

  return {
    fulfillmentMode: modeRaw === 'provider' ? 'provider' : 'operator',
    ordersAccepting: parseBoolean(acceptingRaw, true),
    maxOperatorOrdersPerDay: parseCap(capRaw),
    operatorEstimatedTurnaround:
      turnaroundRaw ?? FULFILLMENT_DEFAULTS.OPERATOR_ESTIMATED_TURNAROUND,
  };
}

/** Synchronous env/defaults-only read (no DB). Useful where async is unavailable. */
export function getFulfillmentConfigFromEnv(): FulfillmentConfig {
  const modeRaw = process.env.FULFILLMENT_MODE ?? FULFILLMENT_DEFAULTS.FULFILLMENT_MODE;
  const acceptingRaw =
    process.env.ORDERS_ACCEPTING ?? FULFILLMENT_DEFAULTS.ORDERS_ACCEPTING;
  const capRaw =
    process.env.MAX_OPERATOR_ORDERS_PER_DAY ??
    FULFILLMENT_DEFAULTS.MAX_OPERATOR_ORDERS_PER_DAY;
  const turnaroundRaw =
    process.env.OPERATOR_ESTIMATED_TURNAROUND ??
    FULFILLMENT_DEFAULTS.OPERATOR_ESTIMATED_TURNAROUND;
  return {
    fulfillmentMode: modeRaw === 'provider' ? 'provider' : 'operator',
    ordersAccepting: parseBoolean(acceptingRaw, true),
    maxOperatorOrdersPerDay: parseCap(capRaw),
    operatorEstimatedTurnaround: turnaroundRaw,
  };
}
