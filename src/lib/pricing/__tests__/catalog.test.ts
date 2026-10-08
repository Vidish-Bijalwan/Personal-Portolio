import { describe, expect, it } from "vitest";
import {
  PRICE_CATALOG,
  VIDEO_CLIP_5S_PRICE_RUPEES,
  priceOf,
  COMPOSER_SERVICES,
  composerServiceById,
  servicePricePaise,
} from "@/lib/pricing/catalog";
import {
  PRICE_LADDER,
  VIDEO_BLOCK_SECONDS,
  VIDEO_DURATION_MAX_S,
  VIDEO_DURATION_MIN_S,
  videoBlockPricePaise,
  videoClipPricePaise,
} from "@/lib/pricing/engine";
import { formatINR } from "@/lib/vilish/types";

/** Canonical 5s clip price in paise — derived from the single constant. */
const CLIP_5S_PAISE = VIDEO_CLIP_5S_PRICE_RUPEES * 100;

/**
 * Pricing consistency guard: every product the business sells must appear
 * exactly once in the catalog at its canonical price. Pages render from
 * this catalog, so a drift here (or a missing product) fails loudly
 * instead of shipping a wrong price to customers.
 */
describe("price catalog", () => {
  it("contains every sellable product exactly once", () => {
    const ids = PRICE_CATALOG.map((p) => p.id);
    expect(ids).toEqual([
      "single-image",
      "pack-4",
      "product-photo",
      "clip-5s",
      "video-studio",
      "remake",
      "tool-basic",
      "tool-plus",
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("matches the canonical prices", () => {
    expect(priceOf("single-image")).toBe(1500);
    expect(priceOf("pack-4")).toBe(4900);
    expect(priceOf("product-photo")).toBe(2900);
    expect(priceOf("clip-5s")).toBe(CLIP_5S_PAISE);
    expect(priceOf("video-studio")).toBe(2900);
    expect(priceOf("remake")).toBe(500);
    expect(priceOf("tool-basic")).toBe(500);
    expect(priceOf("tool-plus")).toBe(1000);
  });

  it("prices the 5s clip at the canonical ₹19 constant (no hardcoded 45)", () => {
    // Vidish's decision (2026-10-08): the 5s clip costs ₹19. This test pins
    // the decided value AND the structural invariant — the catalog entry is
    // the constant in paise, so a future price change touches exactly one
    // line and every surface follows.
    expect(VIDEO_CLIP_5S_PRICE_RUPEES).toBe(19);
    expect(priceOf("clip-5s")).toBe(VIDEO_CLIP_5S_PRICE_RUPEES * 100);
    expect(formatINR(priceOf("clip-5s"))).toBe("₹19");
  });

  it("equals exactly the current price catalog", () => {
    expect(PRICE_CATALOG.map((p) => [p.id, p.paise])).toEqual([
      ["single-image", 1500],
      ["pack-4", 4900],
      ["product-photo", 2900],
      ["clip-5s", CLIP_5S_PAISE],
      ["video-studio", 2900],
      ["remake", 500],
      ["tool-basic", 500],
      ["tool-plus", 1000],
    ]);
  });

  it("throws on unknown ids instead of returning a wrong price", () => {
    // @ts-expect-error — intentionally invalid id
    expect(() => priceOf("nonsense")).toThrow();
  });
});

describe("video clip duration pricing", () => {
  it("exposes the duration bounds and block size", () => {
    expect(VIDEO_DURATION_MIN_S).toBe(5);
    expect(VIDEO_DURATION_MAX_S).toBe(60);
    expect(VIDEO_BLOCK_SECONDS).toBe(5);
  });

  it("derives the block price from the live clip-5s catalog price", () => {
    expect(videoBlockPricePaise()).toBe(priceOf("clip-5s"));
    expect(videoBlockPricePaise()).toBe(CLIP_5S_PAISE);
  });

  it("prices exact 5s blocks at one block price each", () => {
    expect(videoClipPricePaise(5)).toBe(CLIP_5S_PAISE); // ₹19
    expect(videoClipPricePaise(10)).toBe(CLIP_5S_PAISE * 2); // ₹38
    expect(videoClipPricePaise(30)).toBe(CLIP_5S_PAISE * 6); // ₹114
    expect(videoClipPricePaise(60)).toBe(CLIP_5S_PAISE * 12); // ₹228
  });

  it("rounds partial blocks UP to the next whole block", () => {
    expect(videoClipPricePaise(6)).toBe(CLIP_5S_PAISE * 2); // 2 blocks
    expect(videoClipPricePaise(7)).toBe(CLIP_5S_PAISE * 2);
    expect(videoClipPricePaise(59)).toBe(CLIP_5S_PAISE * 12); // 12 blocks
  });

  it("returns whole-rupee integer paise", () => {
    for (let s = 5; s <= 60; s++) {
      const p = videoClipPricePaise(s);
      expect(Number.isInteger(p)).toBe(true);
      expect(p % 100).toBe(0);
    }
  });

  it("keeps the 5s default equal to the catalog clip price", () => {
    expect(videoClipPricePaise(5)).toBe(priceOf("clip-5s"));
  });

  it("rejects out-of-range and non-integer durations", () => {
    expect(() => videoClipPricePaise(4)).toThrow(RangeError);
    expect(() => videoClipPricePaise(61)).toThrow(RangeError);
    expect(() => videoClipPricePaise(5.5)).toThrow(RangeError);
    expect(() => videoClipPricePaise(0)).toThrow(RangeError);
    expect(() => videoClipPricePaise(NaN)).toThrow(RangeError);
  });
});

describe("composer service selector", () => {
  it("offers exactly the paid image services", () => {
    expect(COMPOSER_SERVICES.map((s) => s.id)).toEqual([
      "single-image",
      "pack-4",
      "product-photo",
    ]);
  });

  it("every service maps to a catalog product at the same live price", () => {
    for (const s of COMPOSER_SERVICES) {
      // The estimate shown in the composer MUST equal the catalog price —
      // this is the structural fix for "pricing shows ₹19 for everything".
      expect(servicePricePaise(s.id)).toBe(priceOf(s.id));
      expect(formatINR(servicePricePaise(s.id))).toBe(formatINR(priceOf(s.id)));
    }
  });

  it("every service maps to a valid pricing-engine ladder key", () => {
    for (const s of COMPOSER_SERVICES) {
      expect(s.ladderKey in PRICE_LADDER).toBe(true);
      // Ladder default matches the catalog price (floor-protected at worst).
      expect(PRICE_LADDER[s.ladderKey]).toBe(priceOf(s.id));
    }
  });

  it("deep links resolve to services; garbage resolves to null", () => {
    expect(composerServiceById("single-image")?.id).toBe("single-image");
    expect(composerServiceById("pack-4")?.id).toBe("pack-4");
    expect(composerServiceById("product-photo")?.id).toBe("product-photo");
    expect(composerServiceById("nonsense")).toBeNull();
    expect(composerServiceById(null)).toBeNull();
    expect(composerServiceById(undefined)).toBeNull();
    // deep links are unique
    const links = COMPOSER_SERVICES.map((s) => s.deepLink);
    expect(new Set(links).size).toBe(links.length);
  });
});
