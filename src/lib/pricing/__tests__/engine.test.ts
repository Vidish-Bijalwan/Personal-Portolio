/**
 * Pricing engine tests. Pure functions only — NO network, NO DB, NO env reads.
 * Money is integer paise everywhere; totals round UP to whole rupees.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FEE_BPS,
  PRICE_LADDER,
  ladderPrice,
  paymentFeePaise,
  quotePrice,
  remakePrice,
} from '../engine';

describe('PRICE_LADDER', () => {
  it('matches the October 2026 price-drop ladder (paise)', () => {
    expect(PRICE_LADDER).toEqual({
      singleImage: 1500,
      fourPack: 4900,
      productPhoto: 2900,
      clip5s: 4500,
      remake: 500,
    });
  });

  it('gateway default is manual UPI (0 bps)', () => {
    expect(DEFAULT_FEE_BPS).toBe(0);
  });
});

describe('quotePrice', () => {
  it('₹19-image economics: providerCost 27paise quotes far under the ₹19 ladder with healthy margin', () => {
    const q = quotePrice({ providerCostPaise: 27, feeBps: 0 });
    // marginTarget = ceil(27*6000*55/1_000_000) = ceil(8.91) = 9 -> min-margin floor 100
    // total = 27 + 50 + 0 + 0 + 100 = 177 -> rounds UP to 200 (₹2)
    expect(q.currency).toBe('INR');
    expect(q.margin).toBe(100);
    expect(q.margin).toBeGreaterThanOrEqual(q.providerCost);
    expect(q.total).toBe(200);
    expect(q.total).toBeLessThan(PRICE_LADDER.singleImage);
  });

  it('worked example: providerCostPaise=27, feeBps=0 breaks down exactly', () => {
    const q = quotePrice({ providerCostPaise: 27, feeBps: 0 });
    expect(q).toEqual({
      providerCost: 27,
      infraCost: 50,
      paymentFee: 0,
      taxBuffer: 0,
      margin: 100,
      total: 200,
      currency: 'INR',
    });
  });

  it('floor fuzz: total >= providerCost + fee + minMargin across cost magnitudes', () => {
    for (const cost of [1, 27, 250, 2500, 25000, 100000]) {
      for (const feeBps of [0, 236]) {
        const q = quotePrice({ providerCostPaise: cost, feeBps });
        const fee = paymentFeePaise(cost, feeBps);
        expect(q.total).toBeGreaterThanOrEqual(cost + fee + 100);
      }
    }
  });

  it('feeBps 0 vs 236 changes the total correctly', () => {
    const noFee = quotePrice({ providerCostPaise: 2500, feeBps: 0 });
    const withFee = quotePrice({ providerCostPaise: 2500, feeBps: 236 });
    // fee = ceil(2500*236/10000) = ceil(59) = 59
    expect(noFee.paymentFee).toBe(0);
    expect(withFee.paymentFee).toBe(59);
    expect(withFee.total - noFee.total).toBeGreaterThan(0);
    // both still floor-protected
    expect(noFee.total).toBeGreaterThanOrEqual(2500 + 0 + 100);
    expect(withFee.total).toBeGreaterThanOrEqual(2500 + 59 + 100);
  });

  it('regionMultiplier 1.0 vs 0.55 changes the margin', () => {
    const inMarket = quotePrice({ providerCostPaise: 100000, regionMultiplier: 0.55 });
    const global = quotePrice({ providerCostPaise: 100000, regionMultiplier: 1.0 });
    // target = ceil(100000*6000*mult100/1_000_000) -> 33000 vs 60000
    expect(inMarket.margin).toBe(33000);
    expect(global.margin).toBe(60000);
    expect(global.margin).toBeGreaterThan(inMarket.margin);
    expect(global.total).toBeGreaterThan(inMarket.total);
  });

  it('custom taxBuffer is added exactly', () => {
    const q = quotePrice({ providerCostPaise: 2500, feeBps: 0, taxBufferBps: 500 }); // 5%
    expect(q.taxBuffer).toBe(125); // ceil(2500*500/10000)
    expect(q.total).toBeGreaterThan(quotePrice({ providerCostPaise: 2500, feeBps: 0 }).total);
  });

  it('all totals are whole rupees (paise % 100 === 0) and all fields are integers', () => {
    for (const cost of [1, 27, 250, 2500, 25000, 100000]) {
      for (const feeBps of [0, 236]) {
        const q = quotePrice({ providerCostPaise: cost, feeBps });
        expect(q.total % 100).toBe(0);
        for (const v of [q.providerCost, q.infraCost, q.paymentFee, q.taxBuffer, q.margin, q.total]) {
          expect(Number.isInteger(v)).toBe(true);
        }
      }
    }
  });

  it('rejects negative or non-integer costs', () => {
    expect(() => quotePrice({ providerCostPaise: -5 })).toThrow(RangeError);
    expect(() => quotePrice({ providerCostPaise: 27.5 })).toThrow(RangeError);
  });
});

describe('remakePrice', () => {
  it('L1 and L2 are cheaper than the original retail quote and both floor-protected', () => {
    const original = quotePrice({ providerCostPaise: 2500, feeBps: 0 });
    const l1 = remakePrice({ providerCostPaise: 2500, level: 1, feeBps: 0 });
    const l2 = remakePrice({ providerCostPaise: 2500, level: 2, feeBps: 0 });
    // fee = 0 (manual UPI)
    // L1: margin = max(50, ceil(2500*15/100) = 375); total = 2500+50+0+375 = 2925 -> 3000
    expect(l1.totalPaise).toBe(3000);
    // L2: margin = max(25, ceil(2500*5/100) = 125); total = 2500+50+0+125 = 2675 -> 2700
    expect(l2.totalPaise).toBe(2700);
    expect(l1.totalPaise).toBeLessThan(original.total);
    expect(l2.totalPaise).toBeLessThan(original.total);
    expect(l2.totalPaise).toBeLessThan(l1.totalPaise);
    // floor: total >= cost + fee + 25
    expect(l1.totalPaise).toBeGreaterThanOrEqual(2500 + 0 + 25);
    expect(l2.totalPaise).toBeGreaterThanOrEqual(2500 + 0 + 25);
  });

  it('minimum margins apply for tiny costs and totals stay whole rupees', () => {
    const l1 = remakePrice({ providerCostPaise: 10, level: 1, feeBps: 0 });
    const l2 = remakePrice({ providerCostPaise: 10, level: 2, feeBps: 0 });
    // fee = 0; L1 total = 10+50+0+50 = 110 -> 200; L2 total = 10+50+0+25 = 85 -> 100
    expect(l1.totalPaise).toBe(200);
    expect(l2.totalPaise).toBe(100);
    expect(l1.totalPaise % 100).toBe(0);
    expect(l2.totalPaise % 100).toBe(0);
  });

  it('remake floor holds across magnitudes with a real gateway fee too', () => {
    for (const cost of [1, 27, 250, 2500, 25000, 100000]) {
      for (const level of [1, 2] as const) {
        const r = remakePrice({ providerCostPaise: cost, level, feeBps: 236 });
        const fee = paymentFeePaise(cost, 236);
        expect(r.totalPaise % 100).toBe(0);
        expect(r.totalPaise).toBeGreaterThanOrEqual(cost + fee + 25);
      }
    }
  });

  it('rejects invalid level', () => {
    expect(() => remakePrice({ providerCostPaise: 100, level: 3 as 1 | 2 })).toThrow(RangeError);
  });
});

describe('ladderPrice', () => {
  it('returns the ladder price when it covers the floor (manual UPI default)', () => {
    expect(ladderPrice('singleImage', 25)).toBe(1500);
    expect(ladderPrice('fourPack', 100)).toBe(4900);
    expect(ladderPrice('remake', 25)).toBe(500);
    expect(ladderPrice('clip5s', 25, 0)).toBe(4500);
  });

  it('never returns below the floor even when provider cost dwarfs the ladder', () => {
    // Simulates a lowered-ladder world: cost 100000 -> floor > every ladder rung
    const cost = 100000;
    const floor = cost + paymentFeePaise(cost, 0) + 100; // 100000 + 0 + 100
    expect(floor).toBe(100100);
    for (const product of Object.keys(PRICE_LADDER) as (keyof typeof PRICE_LADDER)[]) {
      expect(ladderPrice(product, cost)).toBe(floor);
      expect(ladderPrice(product, cost)).toBeGreaterThanOrEqual(floor);
    }
  });

  it('floor always wins at the boundary', () => {
    // cost 1500, feeBps 0: floor = 1500 + 0 + 100 = 1600 > singleImage 1500
    expect(ladderPrice('singleImage', 1500)).toBe(1600);
    // cost 1300, feeBps 0: floor = 1300 + 0 + 100 = 1400 < 1500 -> ladder wins
    expect(ladderPrice('singleImage', 1300)).toBe(1500);
  });

  it('feeBps parameter shifts the floor', () => {
    // cost 1200: fee 0 -> floor 1300 < 1500 ladder (ladder wins); fee 236 -> 1200+29+100 = 1329 (ladder still wins)
    expect(ladderPrice('singleImage', 1200, 0)).toBe(1500);
    expect(ladderPrice('singleImage', 1200, 236)).toBe(1500);
    // cost 2000: fee 0 -> floor 2100 > 1500 ladder (floor wins); fee 236 -> 2000+48+100 = 2148
    expect(ladderPrice('singleImage', 2000, 0)).toBe(2100);
    expect(ladderPrice('singleImage', 2000, 236)).toBe(2148);
    // cost 5000: feeBps 0 -> floor 5100 > ladder; feeBps 236 -> 5000+118+100 = 5218
    expect(ladderPrice('singleImage', 5000, 0)).toBe(5100);
    expect(ladderPrice('singleImage', 5000, 236)).toBe(5218);
  });
});
