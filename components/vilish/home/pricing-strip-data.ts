/**
 * Pricing-strip data (JSX-free so the derivation gate is unit-testable).
 *
 * NOTE (2026-10-10): the Oct 8 catalog has no "poster" product id, so the
 * strip lists only catalog-backed products. The 4-pack row replaces the
 * originally planned "poster" row — inventing a poster price would violate
 * the no-fake-claims rule. When a poster product id lands in the catalog,
 * swap it back in here.
 */
export interface PricingStripItem {
  /** Real catalog product id — the displayed price is derived from this. */
  id: "single-image" | "pack-4" | "product-photo" | "clip-5s";
  /** Physical framing: what the price buys. */
  label: string;
}

export const PRICING_STRIP_ITEMS: PricingStripItem[] = [
  { id: "clip-5s", label: "one finished 5s clip" },
  { id: "single-image", label: "one image" },
  { id: "product-photo", label: "one product photo" },
  { id: "pack-4", label: "four images, one concept" },
];
