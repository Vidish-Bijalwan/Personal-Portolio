/**
 * Pricing strip — catalog-driven price derivation gate.
 * Every price on the strip must resolve to a real catalog product via
 * priceOf() + formatINR(); the source must carry zero hardcoded ₹ strings.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_STRIP_ITEMS } from "../pricing-strip-data";
import { PRICE_CATALOG, priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";

const here = dirname(fileURLToPath(import.meta.url));
const stripSrc = readFileSync(join(here, "..", "pricing-strip.tsx"), "utf8");
const pageSrc = readFileSync(
  join(here, "..", "..", "..", "..", "app", "page.tsx"),
  "utf8",
);

describe("pricing strip", () => {
  it("lists exactly the physical-framing rows", () => {
    expect(PRICING_STRIP_ITEMS.map((i) => i.id)).toEqual([
      "clip-5s",
      "single-image",
      "product-photo",
      "pack-4",
    ]);
    for (const item of PRICING_STRIP_ITEMS) {
      expect(item.label.length).toBeGreaterThan(0);
    }
  });

  it("every row price is catalog-derived", () => {
    const ids = new Set(PRICE_CATALOG.map((p) => p.id));
    for (const item of PRICING_STRIP_ITEMS) {
      expect(ids.has(item.id)).toBe(true);
      expect(() => priceOf(item.id)).not.toThrow();
      expect(formatINR(priceOf(item.id))).toMatch(/^₹\d/);
    }
  });

  it("source carries zero hardcoded ₹ amounts", () => {
    expect(stripSrc).not.toMatch(/₹\s?\d/);
  });

  it("renders between <Hero> and <TrustStrip> on the homepage", () => {
    const hero = pageSrc.indexOf("<Hero");
    const strip = pageSrc.indexOf("<PricingStrip");
    const trust = pageSrc.indexOf("<TrustStrip");
    expect(hero).toBeGreaterThan(-1);
    expect(strip).toBeGreaterThan(-1);
    expect(trust).toBeGreaterThan(-1);
    expect(strip).toBeGreaterThan(hero);
    expect(strip).toBeLessThan(trust);
  });
});
