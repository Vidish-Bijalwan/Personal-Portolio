/**
 * Etch — canonical price catalog.
 *
 * ONE source of truth for every price shown anywhere on the site
 * (/pricing, /create composer estimates, /create teaser, /video-studio).
 * Amounts are integer paise. Any UI that shows a price must derive from
 * this list — the pricing-consistency test fails if a product is missing
 * or an amount drifts.
 */

export interface PriceEntry {
  /** Stable id, used as the key for per-page metadata. */
  id:
    | "single-image"
    | "pack-4"
    | "product-photo"
    | "clip-5s"
    | "video-studio"
    | "remake"
    | "tool-basic"
    | "tool-plus";
  label: string;
  /** Integer paise. */
  paise: number;
}

export const PRICE_CATALOG: readonly PriceEntry[] = [
  { id: "single-image", label: "Single image", paise: 1500 },
  { id: "pack-4", label: "4-pack", paise: 4900 },
  { id: "product-photo", label: "Product photo", paise: 2900 },
  { id: "clip-5s", label: "5s clip", paise: 4500 },
  { id: "video-studio", label: "Video Studio", paise: 2900 },
  { id: "remake", label: "Remake", paise: 500 },
  // Utility tool tiers (Video Studio "Real processing" tools, Oct 2026
  // price drop): trivial converters at ₹5, heavier jobs at ₹10. The AI
  // tools (voice-over, captions) stay on the "video-studio" product.
  { id: "tool-basic", label: "Basic tool job", paise: 500 },
  { id: "tool-plus", label: "Plus tool job", paise: 1000 },
] as const;

export function priceOf(id: PriceEntry["id"]): number {
  const entry = PRICE_CATALOG.find((p) => p.id === id);
  if (!entry) throw new Error(`Unknown price id: ${id}`);
  return entry.paise;
}

/* ------------------------------------------------------------------ */
/* Composer service selector                                           */
/*                                                                     */
/* The image composer offers a subset of the catalog as selectable     */
/* services. Every service maps 1:1 to a catalog product (so the        */
/* estimate can never drift) and to a pricing-engine ladder key (so    */
/* the server-side quote prices the same product the user picked).     */
/* ------------------------------------------------------------------ */

/** Services selectable in the image composer. */
export type ComposerServiceId = "single-image" | "pack-4" | "product-photo";

export interface ComposerService {
  id: ComposerServiceId;
  /** Short label for the segmented control. */
  label: string;
  /** One-line explainer shown under the selector. */
  blurb: string;
  /** Pricing-engine ladder key used by /api/generation/quote. */
  ladderKey: "singleImage" | "fourPack" | "productPhoto";
  /** Deep-link value for /create?service=. */
  deepLink: string;
}

export const COMPOSER_SERVICES: readonly ComposerService[] = [
  {
    id: "single-image",
    label: "Single image",
    blurb: "One finished image at your chosen quality and ratio.",
    ladderKey: "singleImage",
    deepLink: "single-image",
  },
  {
    id: "pack-4",
    label: "4-pack",
    blurb: "Four images on one concept — iterate without paying four times.",
    ladderKey: "fourPack",
    deepLink: "pack-4",
  },
  {
    id: "product-photo",
    label: "Product photo",
    blurb: "Studio-grade product shot from a description or reference.",
    ladderKey: "productPhoto",
    deepLink: "product-photo",
  },
] as const;

export function composerServiceById(
  id: string | null | undefined
): ComposerService | null {
  if (!id) return null;
  return COMPOSER_SERVICES.find((s) => s.id === id || s.deepLink === id) ?? null;
}

/** Live catalog price (paise) for a composer service. Never hardcode. */
export function servicePricePaise(id: ComposerServiceId): number {
  return priceOf(id);
}
