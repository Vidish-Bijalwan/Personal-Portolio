/**
 * Pixaura — shared contracts.
 * LAW: every parallel agent codes against these exact names/shapes.
 * MONEY: all money fields are INTEGER PAISE (₹1 = 100). Never floats.
 */

export type JobState =
  | 'DRAFT'
  | 'QUOTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'QUEUED'
  | 'SUBMITTED'
  | 'GENERATING'
  | 'POST_PROCESSING'
  | 'READY'
  | 'AWAITING_OPERATOR_REVIEW'
  | 'APPROVED_FOR_GENERATION'
  | 'RESULT_UPLOADED'
  | 'OPERATOR_QC'
  | 'NEEDS_CLARIFICATION'
  | 'REJECTED'
  | 'REFUND_REQUIRED'
  | 'FAILED_PROVIDER'
  | 'FAILED_VALIDATION'
  | 'FAILED_TIMEOUT'
  | 'REFUND_PENDING'
  | 'REFUNDED';

/** Fulfillment mode for a generation job. LAW: default 'operator' (phase 2). */
export type FulfillmentMode = 'operator' | 'provider';

/** Job kind. LAW: 'generation' | 'remake' | 'edit'. Default 'generation'. */
export type JobKind = 'generation' | 'remake' | 'edit';

export type QualityTier = 'quick' | 'studio' | 'cinema';
export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';
/** Vertical slice: images only. Video task types are future work. */
export type TaskType = 'text_to_image' | 'image_to_image';

export interface GenerationRequest {
  task: TaskType;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  quality: QualityTier;
  referenceAssetIds?: string[];
  seed?: number;
}

export interface CreativeSpec extends GenerationRequest {
  genre?: string;
  style?: string;
  platform?: string;
  /** Deterministically enhanced prompt (rule-based now, LLM later). */
  enhancedPrompt: string;
}

/** All fields integer paise. total = providerCost + infraCost + paymentFee + taxBuffer + margin */
export interface PriceBreakdown {
  providerCost: number;
  infraCost: number;
  paymentFee: number;
  taxBuffer: number;
  margin: number;
  total: number;
  currency: 'INR';
}

export interface ProviderQuote {
  providerId: string;
  model: string;
  /** integer paise */
  estimatedCostINR: number;
  etaSeconds: number;
}

export type ProviderStatus =
  | 'READY_FOR_CREDENTIAL'
  | 'AWAITING_PROVIDER_ACCESS'
  | 'CONNECTED';

/**
 * Provider-neutral media interface. App code NEVER names a vendor.
 * Adapters for real vendors are implemented only from verified docs
 * (see PROVIDER_RESEARCH.md); unverified = AWAITING_PROVIDER_ACCESS stub.
 */
export interface MediaProvider {
  readonly id: string;
  readonly displayName: string;
  readonly status: ProviderStatus;
  quote(req: GenerationRequest): Promise<ProviderQuote>;
  generate(req: GenerationRequest): Promise<{ providerJobId: string }>;
  statusOf(
    providerJobId: string
  ): Promise<{
    state: 'queued' | 'generating' | 'ready' | 'failed';
    outputUrl?: string;
    error?: string;
  }>;
  cancel?(providerJobId: string): Promise<void>;
}

export interface RemakePrice {
  /** integer paise, floor-protected */
  totalPaise: number;
  level: 1 | 2;
  eligibleUntil: string;
}

/** Allowed forward transitions of the job state machine. */
export const JOB_TRANSITIONS: Record<JobState, JobState[]> = {
  DRAFT: ['QUOTED', 'FAILED_VALIDATION'],
  QUOTED: ['PAYMENT_PENDING', 'DRAFT'],
  PAYMENT_PENDING: ['PAID', 'FAILED_TIMEOUT'],
  PAID: ['QUEUED', 'AWAITING_OPERATOR_REVIEW', 'REFUND_PENDING'],
  QUEUED: ['SUBMITTED', 'FAILED_PROVIDER'],
  SUBMITTED: ['GENERATING', 'FAILED_PROVIDER'],
  GENERATING: ['POST_PROCESSING', 'RESULT_UPLOADED', 'FAILED_PROVIDER', 'FAILED_TIMEOUT'],
  POST_PROCESSING: ['READY', 'FAILED_PROVIDER'],
  READY: [],
  AWAITING_OPERATOR_REVIEW: [
    'APPROVED_FOR_GENERATION',
    'NEEDS_CLARIFICATION',
    'REJECTED',
    'REFUND_REQUIRED',
  ],
  APPROVED_FOR_GENERATION: ['GENERATING', 'AWAITING_OPERATOR_REVIEW'],
  RESULT_UPLOADED: ['OPERATOR_QC', 'GENERATING'],
  OPERATOR_QC: ['READY', 'GENERATING', 'REJECTED'],
  NEEDS_CLARIFICATION: ['AWAITING_OPERATOR_REVIEW', 'REFUND_REQUIRED'],
  REJECTED: ['REFUND_REQUIRED', 'REFUNDED'],
  REFUND_REQUIRED: ['REFUNDED', 'REFUND_PENDING'],
  FAILED_PROVIDER: ['QUEUED', 'REFUND_PENDING', 'AWAITING_OPERATOR_REVIEW'],
  FAILED_VALIDATION: ['DRAFT'],
  FAILED_TIMEOUT: ['QUEUED', 'REFUND_PENDING', 'AWAITING_OPERATOR_REVIEW'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
};

export function canTransition(from: JobState, to: JobState): boolean {
  return (JOB_TRANSITIONS[from] ?? []).includes(to);
}

/** Format integer paise as ₹ string, e.g. 1900 -> "₹19". */
export function formatINR(paise: number): string {
  return '₹' + (paise / 100).toFixed(paise % 100 === 0 ? 0 : 2);
}

/* ---------------- payments (manual UPI) ---------------- */

export type PaymentOrderState =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_AWAITING_OWNER'
  | 'PAYMENT_VERIFIED'
  | 'GENERATION_QUEUED'
  | 'PAYMENT_REJECTED'
  | 'PAYMENT_EXPIRED'
  | 'AMOUNT_MISMATCH'
  | 'PAYMENT_REFUND_REQUIRED'
  | 'REFUNDED';

/**
 * Payment provider abstraction. Orders/generation never care which
 * provider is active. Server is the sole authority for VPA and amount —
 * never accept amount/vpa/status from the client.
 */
export interface PaymentProvider {
  readonly id: 'manual_upi' | 'razorpay' | 'stripe';
  createCheckout(order: {
    code: string;
    amountPaise: number;
  }): Promise<{
    upiUri: string;
    qrDataUri?: string;
    qrImageUrl?: string;
    vpa: string;
    payeeName: string;
    expiresAt: string;
  }>;
}

const ORDER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars

/** Generate an order code like VLSH-8H4K2P. */
export function newOrderCode(): string {
  let s = '';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes)
    s += ORDER_CODE_ALPHABET[b % ORDER_CODE_ALPHABET.length];
  return `VLSH-${s}`;
}

/**
 * Generate a 4-char human code (e.g. A3F9) shown in the owner's phone ping.
 * The owner replies YES <code> / NO <code>; 31^4 ≈ 923k combos, and
 * createManualPaymentOrder retries on the (rare) collision.
 */
export function newShortCode(): string {
  let s = '';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const b of bytes)
    s += ORDER_CODE_ALPHABET[b % ORDER_CODE_ALPHABET.length];
  return s;
}

/** Standard UPI payment URI. Never invent a proprietary UPI API. */
export function buildUpiUri(input: {
  vpa: string;
  payeeName: string;
  amountPaise: number;
  orderCode: string;
}): string {
  const am = (input.amountPaise / 100).toFixed(2);
  const p = new URLSearchParams({
    pa: input.vpa,
    pn: input.payeeName,
    am,
    cu: 'INR',
    tn: `Pixaura-${input.orderCode}`,
  });
  return `upi://pay?${p.toString()}`;
}

/** Normalize a UTR/reference for comparison. Accepts varying provider formats. */
export function normalizeUtr(utr: string): string {
  return utr.toUpperCase().replace(/[\s-]/g, '');
}

/** Loose UTR validation — never hardcode 12-digit. */
export function isValidUtr(utr: string): boolean {
  return /^[A-Z0-9/_:.]{6,30}$/.test(normalizeUtr(utr));
}
