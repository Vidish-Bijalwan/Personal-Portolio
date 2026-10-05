/**
 * Vidish Studio — idempotent seed.
 * Safe to run any number of times: rows are inserted only when missing.
 */
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from './client';
import { providers, modelCatalog, adminConfig } from './schema';

const PROVIDER_SEEDS = [
  {
    id: 'fal',
    displayName: 'fal.ai',
    status: 'READY_FOR_CREDENTIAL',
    priority: 1,
    enabled: true,
  },
  {
    id: 'meta',
    displayName: 'Meta',
    status: 'AWAITING_PROVIDER_ACCESS',
    priority: 2,
    enabled: true,
  },
  {
    id: 'mock',
    displayName: 'Dev mock',
    status: 'CONNECTED',
    priority: 3,
    enabled: true,
  },
] as const;

const MODEL_CATALOG_SEED = {
  providerId: 'fal',
  model: 'fal-ai/flux/schnell',
  task: 'text_to_image',
  qualityTier: 'studio',
  costPaisePerUnit: 27,
  capabilities: {
    endpointId: 'fal-ai/flux/schnell',
    usdPerMP: 0.003,
    mpByAspect: { '1:1': 1.0, '4:5': 1.0, '9:16': 1.03, '16:9': 1.0 },
  },
  enabled: true,
};

const ADMIN_CONFIG_SEEDS: Record<string, unknown> = {
  'pricing:infraPaise': 50,
  'pricing:marginBps': 6000,
  'pricing:minMarginPaise': 100,
  'pricing:taxBufferBps': 0,
  'payments:feeBps': 0, // manual UPI default; configurable
  'payments:provider': 'manual_upi',
  'region:multiplier:IN': 0.55,
  ladder: {
    singleImage: 2900,
    fourPack: 7900,
    productPhoto: 4900,
    clip5s: 9900,
    remake: 1900,
  },
  'usd:inr': 88,
  /* ---- phase 2: operator fulfillment (§4) ---- */
  FULFILLMENT_MODE: 'operator',
  ORDERS_ACCEPTING: 'true',
  OPERATOR_ESTIMATED_TURNAROUND:
    'Typical processing time: 30 minutes – several hours',
};

/**
 * MAX_OPERATOR_ORDERS_PER_DAY = NULL (no cap when null), stored as jsonb null.
 * NOT NULL on admin_config.value forbids SQL NULL, and the query builder binds
 * JS null as SQL NULL, so this key is seeded with raw SQL as 'null'::jsonb.
 */
const NULL_CAP_SEED_SQL = sql`INSERT INTO "admin_config" ("key", "value")
  VALUES ('MAX_OPERATOR_ORDERS_PER_DAY', 'null'::jsonb)
  ON CONFLICT ("key") DO NOTHING`;

export async function seed(): Promise<void> {
  const db = getDb();

  // providers — id PK; conflicts mean already seeded
  for (const p of PROVIDER_SEEDS) {
    await db.insert(providers).values(p).onConflictDoNothing();
  }

  // modelCatalog — no natural unique key; check before insert
  const existing = await db
    .select({ id: modelCatalog.id })
    .from(modelCatalog)
    .where(
      and(
        eq(modelCatalog.providerId, MODEL_CATALOG_SEED.providerId),
        eq(modelCatalog.model, MODEL_CATALOG_SEED.model),
        eq(modelCatalog.task, MODEL_CATALOG_SEED.task),
        eq(modelCatalog.qualityTier, MODEL_CATALOG_SEED.qualityTier)
      )
    );
  if (existing.length === 0) {
    await db.insert(modelCatalog).values(MODEL_CATALOG_SEED);
  }

  // adminConfig — key is the PK
  for (const [key, value] of Object.entries(ADMIN_CONFIG_SEEDS)) {
    await db
      .insert(adminConfig)
      .values({ key, value })
      .onConflictDoNothing();
  }
  // MAX_OPERATOR_ORDERS_PER_DAY as jsonb null (see NULL_CAP_SEED_SQL)
  await db.execute(NULL_CAP_SEED_SQL);
}
