/**
 * Pixaura — canonical price catalog.
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
    | "remake";
  label: string;
  /** Integer paise. */
  paise: number;
}

export const PRICE_CATALOG: readonly PriceEntry[] = [
  { id: "single-image", label: "Single image", paise: 2900 },
  { id: "pack-4", label: "4-pack", paise: 7900 },
  { id: "product-photo", label: "Product photo", paise: 4900 },
  { id: "clip-5s", label: "5s clip", paise: 9900 },
  { id: "video-studio", label: "Video Studio", paise: 4900 },
  { id: "remake", label: "Remake", paise: 1900 },
] as const;

export function priceOf(id: PriceEntry["id"]): number {
  const entry = PRICE_CATALOG.find((p) => p.id === id);
  if (!entry) throw new Error(`Unknown price id: ${id}`);
  return entry.paise;
}
