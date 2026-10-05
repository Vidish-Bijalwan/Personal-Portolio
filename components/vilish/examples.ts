/**
 * /examples data model + mapping onto the shared Lightbox item shape.
 * JSX-free so the thumbnail-click → lightbox data flow is unit-testable.
 */
import type { LightboxItem } from "./lightbox-logic";

export type ExampleCategory = "image" | "video" | "edit" | "ad";

export interface ExampleItem {
  src: string;
  prompt: string;
  price: string;
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

/**
 * Map an /examples manifest item onto the shared Lightbox item shape.
 * The prompt becomes the caption, the category becomes the secondary badge.
 */
export function toLightboxItem(item: ExampleItem): LightboxItem {
  return {
    src: item.src,
    caption: item.prompt,
    price: item.price,
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
