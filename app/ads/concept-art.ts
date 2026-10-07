/**
 * Etch Ad Studio — concept thumbnail art mapping.
 *
 * Shared by the step-2 concept grid (ads-flow.tsx) and the customize-step
 * concept accordion section (ads-customize.tsx): per-concept thumbnails when
 * they exist, falling back to category art, then a site-wide default.
 */

import conceptArtRaw from "@/data/ad-concepts/concept-art.json";

/* Per-concept card art: unique thumbnails generated for every concept
   (public/pro/ads-concepts/<id>.jpg). Falls back to the category art
   when a concept has no dedicated thumbnail yet. */
const CONCEPT_ART: Record<string, string> = Object.fromEntries(
  Object.entries(conceptArtRaw as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" && (v as string).length > 0)
    .map(([k, v]) => [k, `/pro/${v as string}`])
);

/* Card art: reuse the shipped pro hero images as decorative style
   references, mapped by concept category family. */
const CATEGORY_ART: Record<string, string> = {
  beauty: "/pro/ad-skincare.jpg",
  fashion: "/pro/ad-apparel.jpg",
  studio: "/pro/hero-perfume.jpg",
  "technical-showcase": "/pro/hero-watch-exploded.jpg",
  tech: "/pro/hero-watch-exploded.jpg",
  premium: "/pro/hero-watch-exploded.jpg",
  unboxing: "/pro/hero-watch-exploded.jpg",
  lifestyle: "/pro/hero-watch-box.jpg",
  promotional: "/pro/hero-watch-box.jpg",
  seasonal: "/pro/hero-watch-box.jpg",
  festive: "/pro/hero-watch-box.jpg",
  "social-proof": "/pro/hero-watch-box.jpg",
  food: "/pro/ad-burger.jpg",
  dynamic: "/pro/ad-shoe.jpg",
  urban: "/pro/ad-shoe.jpg",
  stylized: "/pro/ad-apparel.jpg",
  transformation: "/pro/ad-skincare.jpg",
  video: "/pro/hero-headphones.jpg",
};

export function artForConcept(c: { id: string; category: string }): string {
  return CONCEPT_ART[c.id] ?? CATEGORY_ART[c.category] ?? "/pro/hero-headphones.jpg";
}

export function artForCategory(category: string): string {
  return CATEGORY_ART[category] ?? "/pro/hero-headphones.jpg";
}
