import { describe, expect, it } from "vitest";
import {
  PRICE_CATALOG,
  priceOf,
  COMPOSER_SERVICES,
  composerServiceById,
  servicePricePaise,
} from "@/lib/pricing/catalog";
import { PRICE_LADDER } from "@/lib/pricing/engine";
import { formatINR } from "@/lib/vilish/types";

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
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("matches the canonical prices", () => {
    expect(priceOf("single-image")).toBe(2900);
    expect(priceOf("pack-4")).toBe(7900);
    expect(priceOf("product-photo")).toBe(4900);
    expect(priceOf("clip-5s")).toBe(9900);
    expect(priceOf("video-studio")).toBe(4900);
    expect(priceOf("remake")).toBe(1900);
  });

  it("throws on unknown ids instead of returning a wrong price", () => {
    // @ts-expect-error — intentionally invalid id
    expect(() => priceOf("nonsense")).toThrow();
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
      // this is the structural fix for "pricing shows ₹29 for everything".
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
