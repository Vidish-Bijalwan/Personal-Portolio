import { describe, expect, it } from "vitest";
import { PRICE_CATALOG, priceOf } from "@/lib/pricing/catalog";

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
