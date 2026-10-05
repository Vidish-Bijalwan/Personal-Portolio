/**
 * Pure (DOM-free) logic for the shared Lightbox. Kept in a JSX-free module
 * so the keyboard navigation and index math are unit-testable in the node
 * vitest environment.
 */

export interface LightboxItem {
  /** Image or video URL (public path). */
  src: string;
  /** Caption shown under the image and used for the dialog label/alt fallback. */
  caption: string;
  /** Price pill text, e.g. "₹29". */
  price: string;
  /** Optional extra detail line (e.g. the model name on /examples). */
  model?: string;
  /** Optional secondary badge chip (e.g. the /examples category label). */
  badge?: string;
  /** Optional alt text; falls back to caption when omitted. */
  alt?: string;
  /** "video" for AI video example items — renders a <video>, not next/Image. */
  kind?: "image" | "video";
  /** Poster image for video items (shown while loading and under reduced motion). */
  poster?: string;
}

/** Wrap-around navigation for the lightbox arrows. dir: 1 = next, -1 = prev. */
export function nextLightboxIndex(index: number, count: number, dir: 1 | -1): number {
  if (count <= 0) return index;
  return (index + dir + count) % count;
}

/**
 * Pure keyboard handling for the lightbox (extracted so it is unit-testable
 * without a DOM). The component wires this to a window keydown listener:
 * Escape closes; arrows move within the set (wrap-around), only when the set
 * has more than one item.
 */
export function handleLightboxKey(
  key: string,
  index: number,
  count: number,
  onClose: () => void,
  onIndex: (next: number) => void,
): void {
  if (key === "Escape") {
    onClose();
  } else if (key === "ArrowRight" && count > 1) {
    onIndex(nextLightboxIndex(index, count, 1));
  } else if (key === "ArrowLeft" && count > 1) {
    onIndex(nextLightboxIndex(index, count, -1));
  }
}
