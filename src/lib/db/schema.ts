/**
 * Vidish Studio — Drizzle schema (Postgres).
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
  /** manual_upi | razorpay | stripe */
  provider: text('provider').notNull().default('manual_upi'),
  razorpayOrderId: text('razorpay_order_id').unique(),
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
