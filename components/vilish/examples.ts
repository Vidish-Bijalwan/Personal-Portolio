/**
 * /examples data model + mapping onto the shared Lightbox item shape.
 * JSX-free so the thumbnail-click → lightbox data flow is unit-testable.
 *
 * Pricing rule (Phase 3): every example carries a `service` — a real product
 * id from the price catalog. The displayed price is ALWAYS derived via
 * examplePrice(); no hardcoded ₹ strings live in the manifest or components.
 */
import type { LightboxItem } from "./lightbox-logic";
import { PRICE_CATALOG, priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";

export type ExampleCategory = "image" | "video" | "edit" | "ad";

/** Catalog product ids an example can map to. */
export type ExampleServiceId = (typeof PRICE_CATALOG)[number]["id"];

const VALID_SERVICES = new Set<string>(PRICE_CATALOG.map((p) => p.id));

export interface ExampleItem {
  src: string;
  prompt: string;
  /** Real catalog product — the displayed price is derived from this. */
  service: ExampleServiceId;
  model: string;
  category: ExampleCategory;
  /** Descriptive alt text ("what it shows — AI-generated example"); grid falls back to prompt. */
  alt?: string;
  /** Poster frame for category "video" items. */
  poster?: string;
}

export const CATEGORY_LABEL: Record<ExampleCategory, string> = {
  image: "Image",
  video: "Video",
  edit: "Edit",
  ad: "Ad",
};

/** Exact ₹ cost of the example, derived from the pricing catalog. */
export function examplePrice(item: Pick<ExampleItem, "service">): string {
  return formatINR(priceOf(item.service));
}

/**
 * "Make one like this →" deep link. Image services open the composer with
 * the service preselected; the 5s clip opens the composer in video mode.
 */
export function exampleHref(item: Pick<ExampleItem, "service">): string {
  if (item.service === "clip-5s") return "/create?media=video";
  return `/create?service=${item.service}`;
}

/**
 * Runtime guard for manifest.json entries: every example must resolve to a
 * real catalog product. Used by app/examples/page.tsx when loading the
 * manifest — items with unknown/missing services are dropped, never rendered
 * with a guessed price.
 */
export function isExampleItem(data: unknown): data is ExampleItem {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.src === "string" &&
    typeof d.prompt === "string" &&
    typeof d.service === "string" &&
    VALID_SERVICES.has(d.service) &&
    typeof d.model === "string" &&
    (d.category === "image" ||
      d.category === "video" ||
      d.category === "edit" ||
      d.category === "ad") &&
    (d.alt === undefined || typeof d.alt === "string") &&
    (d.poster === undefined || typeof d.poster === "string")
  );
}

/**
 * Map an /examples manifest item onto the shared Lightbox item shape.
 * The prompt becomes the caption, the category becomes the secondary badge,
 * and the price is derived from the catalog (never the manifest string).
 */
export function toLightboxItem(item: ExampleItem): LightboxItem {
  return {
    src: item.src,
    caption: item.prompt,
    price: examplePrice(item),
    model: item.model,
    badge: CATEGORY_LABEL[item.category],
    alt: item.alt ?? item.prompt,
    kind: item.category === "video" ? "video" : "image",
    poster: item.poster,
  };
}

/**
 * Mirror of ExamplesGrid's render wiring: given the (possibly filtered)
 * items and the clicked thumbnail index, return the lightbox items + the
 * resolved index, or null when the lightbox should stay closed.
 */
export function resolveOpenLightbox(
  items: ExampleItem[],
  openIndex: number | null,
): { items: LightboxItem[]; index: number } | null {
  if (openIndex === null || !items[openIndex]) return null;
  return { items: items.map(toLightboxItem), index: openIndex };
}
