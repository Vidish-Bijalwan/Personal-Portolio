/**
 * Etch — pricing engine (pure functions, no I/O, no env reads).
 *
 * LAW: money is INTEGER PAISE everywhere (₹1 = 100). Never floats in output.
 * All rounding uses integer ceiling arithmetic; totals always round UP to
 * whole rupees. Every price is floor-protected: the platform can never sell
 * a creation for less than provider cost + payment fee + minimum margin.
 */

import type { PriceBreakdown } from '../vilish/types';
import { priceOf } from './catalog';

/**
 * Retail ladder (paise), derived from the canonical PRICE_CATALOG.
 * Never hardcode — the catalog is the single source of truth.
 */
export const PRICE_LADDER = {
  singleImage: priceOf('single-image'),
  fourPack: priceOf('pack-4'),
  productPhoto: priceOf('product-photo'),
  clip5s: priceOf('clip-5s'),
  remake: priceOf('remake'),
} as const;

/* ------------------------------------------------------------------ */
/* Video clip duration pricing                                         */
/*                                                                     */
/* Video clips are priced by DURATION, not as catalog entries beyond    */
/* the 5s base. The formula is deliberately simple and honest:         */
/*                                                                     */
/*   price_paise = ceil(duration_seconds / 5) × BLOCK_PRICE_PAISE      */
/*                                                                     */
/* where BLOCK_PRICE_PAISE is the "clip-5s" catalog price
 * (VIDEO_CLIP_5S_PRICE_RUPEES = ₹19). Every 5-second block — or part of
 * one — costs one block. So:
 *   5s  → 1 block → ₹19
 *   6s  → 2 blocks → ₹38
 *   60s → 12 blocks → ₹228
/* The result is rounded UP to whole rupees per engine rules (a no-op  */
/* today since the block price is already whole rupees, but it keeps   */
/* the invariant if the catalog price ever changes).                   */
/* ------------------------------------------------------------------ */

/** One pricing block = 5 seconds of video. */
export const VIDEO_BLOCK_SECONDS = 5;
/** Shortest selectable clip duration (the catalog "clip-5s" product). */
export const VIDEO_DURATION_MIN_S = 5;
/** Longest selectable clip duration (1 minute). */
export const VIDEO_DURATION_MAX_S = 60;

/** The 5s block price in paise — always the live catalog clip price. */
export function videoBlockPricePaise(): number {
  return priceOf('clip-5s');
}

/**
 * Price (integer paise) for a video clip of `durationSeconds`.
 * Throws on non-integer, <5 or >60 durations — the API validates first.
 */
export function videoClipPricePaise(durationSeconds: number): number {
  if (!Number.isInteger(durationSeconds)) {
    throw new RangeError(
      `durationSeconds must be an integer, got ${durationSeconds}`
    );
  }
  if (durationSeconds < VIDEO_DURATION_MIN_S || durationSeconds > VIDEO_DURATION_MAX_S) {
    throw new RangeError(
      `durationSeconds must be ${VIDEO_DURATION_MIN_S}..${VIDEO_DURATION_MAX_S}, got ${durationSeconds}`
    );
  }
  const blocks = Math.ceil(durationSeconds / VIDEO_BLOCK_SECONDS);
  const raw = blocks * videoBlockPricePaise();
  return roundUpToRupee(raw);
}

/** Default payment gateway cost basis: 0 bps — manual UPI has no gateway fee.
 * Any bps value is allowed for future providers (e.g. 236 was Razorpay's
 * 2% + GST). Configurable per call via feeBps; never hardcode a provider. */
export const DEFAULT_FEE_BPS = 0;
/** Default fixed infra cost per creation (logging, queue, storage refs): ₹0.50. */
export const DEFAULT_INFRA_PAISE = 50;
/** Default margin target: 60% of provider cost = 6000 bps. */
export const DEFAULT_MARGIN_BPS = 6000;
/** Default India region margin multiplier. */
export const DEFAULT_REGION_MULTIPLIER = 0.55;
/** Default absolute minimum margin: ₹1. */
export const DEFAULT_MIN_MARGIN_PAISE = 100;
/** Default tax buffer: 0 bps (kept explicit for future GST tiers). */
export const DEFAULT_TAX_BUFFER_BPS = 0;
/** Integer ceiling division for positive integers: ceil(a / b). */
function ceilDiv(a: number, b: number): number {
  return Math.floor((a + b - 1) / b);
}

/** Round a paise amount UP to the nearest whole rupee. */
function roundUpToRupee(paise: number): number {
  return Math.ceil(paise / 100) * 100;
}

function assertIntegerPaise(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer paise amount, got ${value}`);
  }
}

export interface QuoteInput {
  providerCostPaise: number;
  /** e.g. 'IN'. Reserved for future region-specific rules; margin is via regionMultiplier. */
  region?: string;
  /** Payment fee in basis points. Default 0 (manual UPI); any bps allowed for future providers. */
  feeBps?: number;
  /** Fixed infra cost per creation. Default 50. */
  infraPaise?: number;
  /** Margin target in basis points of provider cost. Default 6000. */
  marginBps?: number;
  /** Absolute minimum margin floor. Default 100. */
  minMarginPaise?: number;
  /** Tax buffer in basis points of provider cost. Default 0. */
  taxBufferBps?: number;
  /** Region margin multiplier. Default 0.55 for IN. */
  regionMultiplier?: number;
}

/**
 * Full retail quote for a creation.
 * total = providerCost + infra + fee + taxBuffer + margin, rounded UP to whole rupees.
 */
export function quotePrice(input: QuoteInput): PriceBreakdown {
  const {
    providerCostPaise,
    feeBps = DEFAULT_FEE_BPS,
    infraPaise = DEFAULT_INFRA_PAISE,
    marginBps = DEFAULT_MARGIN_BPS,
    minMarginPaise = DEFAULT_MIN_MARGIN_PAISE,
    taxBufferBps = DEFAULT_TAX_BUFFER_BPS,
    regionMultiplier = DEFAULT_REGION_MULTIPLIER,
  } = input;

  assertIntegerPaise(providerCostPaise, 'providerCostPaise');
  if (!Number.isInteger(feeBps) || feeBps < 0)
    throw new RangeError(`feeBps must be a non-negative integer, got ${feeBps}`);
  if (!Number.isInteger(infraPaise) || infraPaise < 0)
    throw new RangeError(`infraPaise must be a non-negative integer, got ${infraPaise}`);
  if (!Number.isInteger(marginBps) || marginBps < 0)
    throw new RangeError(`marginBps must be a non-negative integer, got ${marginBps}`);
  if (!Number.isInteger(minMarginPaise) || minMarginPaise < 0)
    throw new RangeError(`minMarginPaise must be a non-negative integer, got ${minMarginPaise}`);
  if (!Number.isInteger(taxBufferBps) || taxBufferBps < 0)
    throw new RangeError(`taxBufferBps must be a non-negative integer, got ${taxBufferBps}`);
  if (!(regionMultiplier > 0))
    throw new RangeError(`regionMultiplier must be positive, got ${regionMultiplier}`);

  const fee = ceilDiv(providerCostPaise * feeBps, 10_000);
  // Integer-safe margin target: ceil(cost * marginBps * regionMultiplier / 10000).
  // regionMultiplier is decimal (0.55), so express it as an integer fraction
  // mult100/100 and fold into the divisor: ceil(cost*marginBps*mult100/1_000_000).
  // Float math would corrupt the ceil on large costs (e.g. 330000000.00000006).
  const mult100 = Math.round(regionMultiplier * 100);
  const marginTarget = ceilDiv(providerCostPaise * marginBps * mult100, 1_000_000);
  const margin = Math.max(minMarginPaise, marginTarget);
  const taxBuffer = ceilDiv(providerCostPaise * taxBufferBps, 10_000);

  const rawTotal = providerCostPaise + infraPaise + fee + taxBuffer + margin;
  const total = roundUpToRupee(rawTotal);

  // Floor: total >= providerCost + fee + minMargin. Impossible to breach by
  // construction (infra >= 0 and margin >= minMargin are both included), so a
  // breach here means a code defect — fail loudly rather than underprice.
  const floor = providerCostPaise + fee + minMarginPaise;
  if (total < floor) {
    throw new Error(
      `Pricing floor breached: total=${total} < floor=${floor} (cost=${providerCostPaise}, fee=${fee}, minMargin=${minMarginPaise})`
    );
  }

  return {
    providerCost: providerCostPaise,
    infraCost: infraPaise,
    paymentFee: fee,
    taxBuffer,
    margin,
    total,
    currency: 'INR',
  };
}

export interface RemakeInput {
  providerCostPaise: number;
  /** 1 = full regeneration; 2 = light touch-up / same-scene tweak. */
  level: 1 | 2;
  feeBps?: number;
  infraPaise?: number;
}

/**
 * Cheaper "make it right" price for remakes.
 * Level 1 margin: max(50, 15% of provider cost).
 * Level 2 margin: max(25, 5% of provider cost).
 * Floor-protected: total >= providerCost + fee + 25.
 */
export function remakePrice(input: RemakeInput): { totalPaise: number } {
  const {
    providerCostPaise,
    level,
    feeBps = DEFAULT_FEE_BPS,
    infraPaise = DEFAULT_INFRA_PAISE,
  } = input;

  assertIntegerPaise(providerCostPaise, 'providerCostPaise');
  if (level !== 1 && level !== 2)
    throw new RangeError(`remake level must be 1 or 2, got ${level}`);
  if (!Number.isInteger(feeBps) || feeBps < 0)
    throw new RangeError(`feeBps must be a non-negative integer, got ${feeBps}`);
  if (!Number.isInteger(infraPaise) || infraPaise < 0)
    throw new RangeError(`infraPaise must be a non-negative integer, got ${infraPaise}`);

  const fee = ceilDiv(providerCostPaise * feeBps, 10_000);
  const margin =
    level === 1
      ? Math.max(50, ceilDiv(providerCostPaise * 15, 100))
      : Math.max(25, ceilDiv(providerCostPaise * 5, 100));

  const rawTotal = providerCostPaise + infraPaise + fee + margin;
  const total = roundUpToRupee(rawTotal);

  // Floor uses the level-2 minimum margin (25) as the absolute floor so both
  // levels share one invariant. By construction margin >= 25 and infra >= 0,
  // so breach is impossible; throw if it ever happens.
  const floor = providerCostPaise + fee + 25;
  if (total < floor) {
    throw new Error(
      `Remake pricing floor breached: total=${total} < floor=${floor} (cost=${providerCostPaise}, fee=${fee}, level=${level})`
    );
  }

  return { totalPaise: total };
}

/** Payment-fee helper: ceil(cost * feeBps / 10000). */
export function paymentFeePaise(providerCostPaise: number, feeBps = DEFAULT_FEE_BPS): number {
  assertIntegerPaise(providerCostPaise, 'providerCostPaise');
  if (!Number.isInteger(feeBps) || feeBps < 0)
    throw new RangeError(`feeBps must be a non-negative integer, got ${feeBps}`);
  return ceilDiv(providerCostPaise * feeBps, 10_000);
}

/**
 * Retail ladder price for a product. The ladder is a retail DEFAULT — the
 * floor always wins: never returns less than providerCost + fee(feeBps) + 100.
 * feeBps defaults to the manual-UPI default (0); pass a provider's bps for
 * future gateways.
 */
export function ladderPrice(
  product: keyof typeof PRICE_LADDER,
  providerCostPaise: number,
  feeBps = DEFAULT_FEE_BPS
): number {
  assertIntegerPaise(providerCostPaise, 'providerCostPaise');
  if (!Number.isInteger(feeBps) || feeBps < 0)
    throw new RangeError(`feeBps must be a non-negative integer, got ${feeBps}`);
  const ladder = PRICE_LADDER[product];
  if (ladder === undefined) throw new RangeError(`Unknown ladder product: ${product}`);
  const floor = providerCostPaise + paymentFeePaise(providerCostPaise, feeBps) + 100;
  return Math.max(ladder, floor);
}
