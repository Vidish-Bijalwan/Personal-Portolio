/**
 * Etch — Drizzle schema (Postgres).
 * LAW: table/column names are fixed; API/payments/auth agents code against these.
 * Money: INTEGER PAISE everywhere.
 */
import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  customType,
} from 'drizzle-orm/pg-core';
import type {
  JobState,
  PaymentOrderState,
  FulfillmentMode,
  JobKind,
} from '../vilish/types';

const id = () =>
  uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull();

/* ---------------- users + Auth.js v5 tables ---------------- */

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  role: text('role').default('user').notNull(), // 'user' | 'admin'
  // bcrypt hash for email+password (credentials) login. NULL for OAuth-only
  // or dev-bypass accounts. Never store plaintext passwords.
  passwordHash: text('password_hash'),
  createdAt: createdAt(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

/* ---------------- core product tables ---------------- */

export const projects = pgTable('projects', {
  id: id(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled project'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const assets = pgTable('assets', {
  id: id(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  kind: text('kind').notNull().default('reference'), // reference | output | mock
  url: text('url').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  width: integer('width'),
  height: integer('height'),
  createdAt: createdAt(),
});

export const generationJobs = pgTable('generation_jobs', {
  id: id(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  state: text('state').notNull().default('DRAFT').$type<JobState>(),
  task: text('task').notNull().default('text_to_image'),
  prompt: text('prompt').notNull().default(''),
  enhancedPrompt: text('enhanced_prompt'),
  negativePrompt: text('negative_prompt'),
  aspectRatio: text('aspect_ratio').notNull().default('1:1'),
  quality: text('quality').notNull().default('studio'),
  providerId: text('provider_id'),
  providerJobId: text('provider_job_id'),
  model: text('model'),
  estimatedCost: integer('estimated_cost').notNull().default(0), // paise
  actualCost: integer('actual_cost'), // paise
  customerPrice: integer('customer_price').notNull().default(0), // paise
  grossMargin: integer('gross_margin'), // paise
  idempotencyKey: text('idempotency_key').unique(),
  outputAssetId: uuid('output_asset_id').references(() => assets.id, {
    onDelete: 'set null',
  }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  parentJobId: uuid('parent_job_id'), // set for remakes
  /* ---- phase 2: operator fulfillment (§4) ---- */
  /** 'operator' | 'provider'. LAW default: 'operator'. */
  fulfillmentMode: text('fulfillment_mode')
    .notNull()
    .default('operator')
    .$type<FulfillmentMode>(),
  /** 'operator' when the result was delivered by the operator pipeline. */
  fulfillmentSource: text('fulfillment_source'),
  /** 'generation' | 'remake' | 'edit'. */
  jobKind: text('job_kind').notNull().default('generation').$type<JobKind>(),
  /** Catalog product id for paid image orders: 'single-image' | 'pack-4' | 'product-photo'.
   *  Written at quote time from the composer service selector; the operator
   *  uses it to know what was sold (4-pack = 4 takes, product-photo = studio brief). */
  product: text('product').notNull().default('single-image'),
  /** Internal operator notes; COPIED to child jobs on remake/edit. */
  operatorNotes: text('operator_notes'),
  /** Customer-visible clarification thread. */
  clarificationRequest: text('clarification_request'),
  clarificationResponse: text('clarification_response'),
  /** Internal QC notes. */
  qcNotes: text('qc_notes'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const generationVersions = pgTable('generation_versions', {
  id: id(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  assetId: uuid('asset_id').references(() => assets.id, {
    onDelete: 'set null',
  }),
  promptVersionId: uuid('prompt_version_id'),
  pricePaise: integer('price_paise').notNull().default(0),
  createdAt: createdAt(),
});

export const promptVersions = pgTable('prompt_versions', {
  id: id(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  spec: jsonb('spec').notNull(),
  createdAt: createdAt(),
});

/* ---- phase 2: operator fulfillment results (§4) ---- */

/** Uploaded operator deliverables ("takes") for a generation job. */
export const fulfillmentResults = pgTable('fulfillment_results', {
  id: id(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  takeLabel: text('take_label').notNull().default('Take 01'),
  assetId: uuid('asset_id').references(() => assets.id, {
    onDelete: 'set null',
  }),
  /** 'video' | 'image' */
  resultType: text('result_type').notNull(),
  notes: text('notes'),
  toolUsed: text('tool_used'),
  durationSeconds: integer('duration_seconds'),
  width: integer('width'),
  height: integer('height'),
  /** internal operator cost, integer paise */
  estCostPaise: integer('est_cost_paise'),
  /** internal operator generation time */
  generationTimeSeconds: integer('generation_time_seconds'),
  uploadedBy: text('uploaded_by'),
  createdAt: createdAt(),
});

/* ---- customer reference attachments (composer uploads) ---- */

/** Postgres bytea column. drizzle-orm 0.45 has no pg `blob` builder, so we
 *  use a custom type. Works on node-postgres (prod) and PGlite (dev/test):
 *  both round-trip binary bytea. Stored with the row on purpose — never the
 *  local filesystem (ephemeral on Vercel). */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

/**
 * Customer-uploaded reference files attached to a generation job.
 * Legacy: the pre-generate-first flow stored these at order-start time
 * (multipart on /api/generation/start). The generate-first flow stores
 * reference files on free_generation_attachments linked to the
 * generations row (the table the watcher reads).
 */
export const generationAttachments = pgTable('generation_attachments', {
  id: id(),
  generationId: uuid('generation_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  byteSize: integer('byte_size').notNull(),
  data: bytea('data').notNull(),
  createdAt: createdAt(),
});

/**
 * Customer-uploaded reference files attached to a FREE-tier generation at
 * /api/free/generate time (multipart). Same caps as the paid flow
 * (8MB/file, 20MB total, 5 max — see @/src/lib/vilish/attachments).
 * Separate table from generation_attachments because the FK target is
 * generations.id, not generation_jobs.id. The generation watcher (which
 * cannot reach Postgres directly) fetches these via
 * GET /api/admin/fulfillment/generations/[id]/attachments (x-admin-token).
 */
export const freeGenerationAttachments = pgTable(
  'free_generation_attachments',
  {
    id: id(),
    generationId: uuid('generation_id')
      .notNull()
      .references(() => generations.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    data: bytea('data').notNull(),
    createdAt: createdAt(),
  }
);

/* ---------------- free-tier images + paid video clips + paid images ---- */

/**
 * Unified generations table for the free-tier image flow, paid video
 * clips, and generate-first paid images. tier='free' + media_type='image':
 * 3/day cap, watermarked preview, clean download unlocks after verify.
 * tier='paid' + media_type='video': per-clip catalog price, no daily cap;
 * the watcher generates immediately on order and the clean mp4 unlocks on
 * payment verify. tier='paid' + media_type='image': generate-first paid
 * images (POST /api/generation/start) — no order at Generate time; the
 * unlock order is created at "Download clean HD" click time
 * (POST /api/generation/unlock) with the job's server-side price.
 */
export const generations = pgTable('generations', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  quality: text('quality').notNull().default('studio'),
  aspectRatio: text('aspect_ratio').notNull().default('1:1'),
  /** queued | generating | done | failed */
  status: text('status').notNull().default('queued'),
  /** operator/watcher progress label for the waiting room */
  stage: text('stage'),
  /** image | video */
  mediaType: text('media_type').notNull().default('image'),
  /** free | paid */
  tier: text('tier').notNull().default('free'),
  /**
   * Generate-first flow: the pricing job this paid image generation was
   * started from (POST /api/generation/start). The job is the system of
   * record for the quoted server-side price — the unlock order created at
   * "Download clean HD" click time reads amountPaise from the job, never
   * from the client. Null for free-tier rows and paid video rows (those
   * carry their own fixed catalog prices).
   */
  jobId: uuid('job_id').references(() => generationJobs.id, {
    onDelete: 'set null',
  }),
  attempts: integer('attempts').notNull().default(0),
  watermarked: bytea('watermarked'),
  clean: bytea('clean'),
  mime: text('mime').notNull().default('image/jpeg'),
  error: text('error'),
  /** advisory failure class: 'content_refused' (provider safety filter)
   *  vs 'technical'. status stays 'failed'; never consumes quota. */
  errorCode: text('error_code'),
  unlocked: boolean('unlocked').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
});

/**
 * Links a manual-UPI order to a generations row. purpose 'unlock': ₹19
 * clean-image download for a free generation. purpose 'video': ₹89 paid
 * clip. The payment-verify hook flips generations.unlocked from this link.
 */
export const generationOrders = pgTable('generation_orders', {
  orderId: uuid('order_id')
    .primaryKey()
    .references(() => orders.id, { onDelete: 'cascade' }),
  generationId: uuid('generation_id')
    .notNull()
    .references(() => generations.id, { onDelete: 'cascade' }),
  /** unlock | video */
  purpose: text('purpose').notNull(),
  createdAt: createdAt(),
});

/**
 * Etch — Video Studio tools.
 *
 * Queue-backed video processing jobs (voice-over/TTS, captions,
 * trim & text, plus the Phase 4 real tools: compress, convert, gif,
 * add-audio, denoise). Mirrors the `generations` queue pattern: rows move
 * queued → processing → done | failed, a watcher (which cannot reach
 * Postgres directly) claims work over the HTTPS admin API, and
 * delivers watermarked + clean bytea via the deliver endpoint.
 * Money: integer PAISE everywhere (price_cents stores paise despite
 * the name — 3900 paise = ₹39).
 */
export const videoJobs = pgTable('video_jobs', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** tts | caption | trim | compress | convert | gif | add-audio | denoise */
  tool: text('tool').notNull(),
  /** queued | processing | done | failed */
  status: text('status').notNull().default('queued'),
  /** watcher progress label for the waiting room */
  stage: text('stage'),
  /** tool-specific params (see src/lib/video/validate.ts) */
  params: jsonb('params'),
  /** uploaded source video bytes (tool input) */
  input: bytea('input'),
  inputMime: text('input_mime'),
  /** second input slot: audio track for add-audio (see 0010_video_tools) */
  input2: bytea('input2'),
  input2Mime: text('input2_mime'),
  attempts: integer('attempts').notNull().default(0),
  watermarked: bytea('watermarked'),
  clean: bytea('clean'),
  mime: text('mime').notNull().default('video/mp4'),
  /** integer paise; 3900 = ₹39 */
  priceCents: integer('price_cents').notNull().default(3900),
  unlocked: boolean('unlocked').notNull().default(false),
  error: text('error'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Links a manual-UPI order to a video_jobs row. purpose
 * 'video_studio': ₹39 clean-video unlock. The payment-verify hook flips
 * video_jobs.unlocked from this link (mirrors generation_orders).
 */
export const videoJobOrders = pgTable('video_job_orders', {
  orderId: uuid('order_id')
    .primaryKey()
    .references(() => orders.id, { onDelete: 'cascade' }),
  videoJobId: uuid('video_job_id')
    .notNull()
    .references(() => videoJobs.id, { onDelete: 'cascade' }),
  /** video_studio */
  purpose: text('purpose').notNull(),
  createdAt: createdAt(),
});

/* ---------------- providers & pricing ---------------- */

/* ---------------- providers & pricing ---------------- */

export const providers = pgTable('providers', {
  id: text('id').primaryKey(), // 'mock' | 'meta' | 'fal' ...
  displayName: text('display_name').notNull(),
  status: text('status').notNull().default('AWAITING_PROVIDER_ACCESS'),
  priority: integer('priority').notNull().default(99),
  enabled: boolean('enabled').notNull().default(true),
});

export const modelCatalog = pgTable('model_catalog', {
  id: id(),
  providerId: text('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'cascade' }),
  model: text('model').notNull(),
  task: text('task').notNull().default('text_to_image'),
  qualityTier: text('quality_tier').notNull().default('studio'),
  costPaisePerUnit: integer('cost_paise_per_unit').notNull().default(0),
  capabilities: jsonb('capabilities'),
  enabled: boolean('enabled').notNull().default(true),
});

export const providerPriceHistory = pgTable('provider_price_history', {
  id: id(),
  modelCatalogId: uuid('model_catalog_id')
    .notNull()
    .references(() => modelCatalog.id, { onDelete: 'cascade' }),
  costPaise: integer('cost_paise').notNull(),
  recordedAt: createdAt(),
});

/* ---------------- commerce ---------------- */

export const quotes = pgTable('quotes', {
  id: id(),
  jobId: uuid('job_id').references(() => generationJobs.id, {
    onDelete: 'cascade',
  }),
  breakdown: jsonb('breakdown').notNull(),
  totalPaise: integer('total_paise').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const orders = pgTable('orders', {
  id: id(),
  /** Human order code, e.g. VLSH-8H4K2P */
  code: text('code').unique().notNull(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  /** manual_upi | cashfree */
  provider: text('provider').notNull().default('manual_upi'),
  razorpayOrderId: text('razorpay_order_id').unique(),
  /** Cashfree PG order id (etch_<code>_<ts>) for online payments. */
  cashfreeOrderId: text('cashfree_order_id').unique(),
  amountPaise: integer('amount_paise').notNull(),
  currency: text('currency').notNull().default('INR'),
  status: text('status')
    .notNull()
    .default('PAYMENT_PENDING')
    .$type<PaymentOrderState>(),
  utrReference: text('utr_reference'),
  duplicateFlag: boolean('duplicate_flag').notNull().default(false),
  screenshotAssetId: uuid('screenshot_asset_id').references(() => assets.id, {
    onDelete: 'set null',
  }),
  /** Payment-claim flow: user tapped "I've paid", owner pinged on phone. */
  ownerPingedAt: timestamp('owner_pinged_at', { withTimezone: true }),
  pingCount: integer('ping_count').notNull().default(0),
  /** 4-char human code shown in the owner's ping (reply YES <code>). */
  shortCode: text('short_code').unique(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedByUserId: text('verified_by_user_id'),
  verifiedAmountPaise: integer('verified_amount_paise'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const payments = pgTable('payments', {
  id: id(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  razorpayPaymentId: text('razorpay_payment_id').unique(),
  /** Cashfree gateway cf_payment_id for online payments. */
  cashfreePaymentId: text('cashfree_payment_id').unique(),
  utrReference: text('utr_reference'),
  amountPaise: integer('amount_paise').notNull(),
  method: text('method'), // upi_manual | upi | card | ...
  status: text('status').notNull().default('pending'), // pending | verified | captured | failed
  rawPayload: jsonb('raw_payload'),
  createdAt: createdAt(),
});

export const refunds = pgTable('refunds', {
  id: id(),
  paymentId: uuid('payment_id').references(() => payments.id, {
    onDelete: 'set null',
  }),
  razorpayRefundId: text('razorpay_refund_id'),
  amountPaise: integer('amount_paise').notNull(),
  status: text('status').notNull().default('pending'),
  reason: text('reason'),
  createdAt: createdAt(),
});

export const remakeEligibility = pgTable('remake_eligibility', {
  id: id(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => generationJobs.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  level: integer('level').notNull(), // 1 | 2
  pricePaise: integer('price_paise').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: createdAt(),
});

/* ---------------- content / growth / ops ---------------- */

export const exports = pgTable('exports', {
  id: id(),
  jobId: uuid('job_id').references(() => generationJobs.id, {
    onDelete: 'cascade',
  }),
  format: text('format').notNull().default('png'),
  aspectRatio: text('aspect_ratio'),
  assetId: uuid('asset_id').references(() => assets.id, {
    onDelete: 'set null',
  }),
  createdAt: createdAt(),
});

export const templates = pgTable('templates', {
  id: id(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  prompt: text('prompt').notNull(),
  task: text('task').notNull().default('text_to_image'),
  aspectRatio: text('aspect_ratio').notNull().default('1:1'),
  quality: text('quality').notNull().default('studio'),
  previewAssetId: uuid('preview_asset_id'),
  enabled: boolean('enabled').notNull().default(true),
});

export const publicCreations = pgTable('public_creations', {
  id: id(),
  jobId: uuid('job_id').references(() => generationJobs.id, {
    onDelete: 'cascade',
  }),
  slug: text('slug').unique().notNull(),
  title: text('title'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: createdAt(),
});

export const referrals = pgTable('referrals', {
  id: id(),
  referrerUserId: text('referrer_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  referredUserId: text('referred_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  status: text('status').notNull().default('pending'),
  rewardPaise: integer('reward_paise').notNull().default(0),
  createdAt: createdAt(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: id(),
  userId: text('user_id'),
  event: text('event').notNull(),
  props: jsonb('props'),
  createdAt: createdAt(),
});

export const moderationEvents = pgTable('moderation_events', {
  id: id(),
  jobId: uuid('job_id').references(() => generationJobs.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id'),
  kind: text('kind').notNull(),
  detail: jsonb('detail'),
  createdAt: createdAt(),
});

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  actorUserId: text('actor_user_id'),
  action: text('action').notNull(),
  target: jsonb('target'),
  createdAt: createdAt(),
});

/** Admin-tunable config: margins, regional multipliers, price floors,
 *  kill switches, seeded price ladder. key is the PK. */
export const adminConfig = pgTable('admin_config', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: updatedAt(),
});
