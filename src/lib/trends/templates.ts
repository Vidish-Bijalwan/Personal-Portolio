/**
 * Pixaura — trend templates (Phase 2 of the TalkPix/VEED roadmap).
 *
 * A template is a CURATED PROMPT PRESET over Pixaura's real services — not a
 * separate AI model. Every template maps 1:1 to a catalog product, so the
 * price shown on /trends is the exact price charged in the composer.
 *
 * Adding a template later = appending one object to TEMPLATES (and bumping
 * TRENDS_UPDATED). No code changes needed. The validateTemplate() gate keeps
 * bad data out; the vitest suite enforces it.
 */
import { priceOf } from "@/lib/pricing/catalog";
import type { AspectRatio } from "@/lib/vilish/types";

export const TREND_THEMES = [
  "Cinematic",
  "Products",
  "Pets",
  "Celebrations",
  "Fun",
  "Fantasy",
] as const;

export type TrendTheme = (typeof TREND_THEMES)[number];

/** Services a template can target. Must all exist in the price catalog. */
export type TemplateServiceId =
  | "single-image"
  | "pack-4"
  | "product-photo"
  | "clip-5s";

export const TEMPLATE_SERVICES: readonly TemplateServiceId[] = [
  "single-image",
  "pack-4",
  "product-photo",
  "clip-5s",
] as const;

const VALID_ASPECTS: readonly AspectRatio[] = [
  "1:1",
  "4:5",
  "9:16",
  "16:9",
] as const;

export interface Template {
  /** kebab-case, unique across TEMPLATES. Used in ?template= deep links. */
  id: string;
  name: string;
  theme: TrendTheme;
  /** One-line scene description shown on the card. */
  description: string;
  /** Real Pixaura service — price comes from the catalog, never hardcoded. */
  service: TemplateServiceId;
  /** Pre-filled composer prompt. */
  prompt: string;
  aspect: AspectRatio;
  /**
   * Human labels for the photos the template wants, e.g. ["Your photo"].
   * Empty array = text prompt only (video templates).
   */
  photoSlots: string[];
  /** ISO date (YYYY-MM-DD) the template was added. Drives "newest" order. */
  addedOn: string;
  badge?: "New" | "Popular" | "Staff pick";
}

/** Honest "last updated" stamp shown on /trends. Bump when adding templates. */
export const TRENDS_UPDATED = "2026-10-06";

export const TEMPLATES: readonly Template[] = [
  /* ── Cinematic ─────────────────────────────────────────────── */
  {
    id: "neon-noir-portrait",
    name: "Neon Noir Portrait",
    theme: "Cinematic",
    description:
      "Rain-slicked street, neon reflections, teal-and-orange cinematic grade.",
    service: "single-image",
    prompt:
      "Cinematic portrait of the person in the reference photo, standing on a rain-slicked city street at night, neon signs reflecting in puddles, teal-and-orange color grade, shallow depth of field, film still quality",
    aspect: "4:5",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-06",
    badge: "New",
  },
  {
    id: "epic-movie-poster",
    name: "Epic Movie Poster",
    theme: "Cinematic",
    description:
      "You as the lead of an epic film poster, dramatic sky behind you.",
    service: "single-image",
    prompt:
      "Epic movie poster starring the person in the reference photo, dramatic stormy sky with volumetric light behind them, heroic low-angle composition, bold cinematic typography space at the top, blockbuster key art",
    aspect: "4:5",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-04",
  },
  {
    id: "slow-dance-rain-clip",
    name: "Slow Dance in the Rain",
    theme: "Cinematic",
    description:
      "A slow cinematic orbit around two figures dancing in gentle rain.",
    service: "clip-5s",
    prompt:
      "Slow cinematic orbit around two people slow-dancing in gentle rain under a single streetlamp at night, 5 seconds, moody film lighting",
    aspect: "9:16",
    photoSlots: [],
    addedOn: "2026-10-03",
  },
  /* ── Products ──────────────────────────────────────────────── */
  {
    id: "studio-product-shot",
    name: "Studio Product Shot",
    theme: "Products",
    description:
      "Clean studio product photo on a seamless background, soft key light.",
    service: "product-photo",
    prompt:
      "Professional studio product photograph of the item in the reference photo, seamless light-grey background, soft diffused key light, subtle reflection under the product, e-commerce hero shot",
    aspect: "1:1",
    photoSlots: ["Your product"],
    addedOn: "2026-10-06",
    badge: "Popular",
  },
  {
    id: "product-splash",
    name: "Product Splash",
    theme: "Products",
    description:
      "Your product plunging into crystal water, frozen splash, glossy pedestal.",
    service: "product-photo",
    prompt:
      "Dynamic advertising shot of the product in the reference photo plunging into crystal-clear water, frozen splash crown, rising onto a glossy black pedestal, high-speed photography, dramatic studio lighting",
    aspect: "1:1",
    photoSlots: ["Your product"],
    addedOn: "2026-10-05",
    badge: "New",
  },
  {
    id: "product-hero-clip",
    name: "Product Hero Clip",
    theme: "Products",
    description:
      "Five-second product hero: slow rotation on a pedestal, studio light.",
    service: "clip-5s",
    prompt:
      "Product hero video: the product rotating slowly on a glossy pedestal, dramatic studio lighting sweeping across it, dark background, 5 seconds, premium commercial feel",
    aspect: "9:16",
    photoSlots: [],
    addedOn: "2026-10-02",
  },
  /* ── Pets ──────────────────────────────────────────────────── */
  {
    id: "royal-pet-portrait",
    name: "Royal Pet Portrait",
    theme: "Pets",
    description:
      "Your pet as renaissance nobility — velvet throne, tiny crown.",
    service: "single-image",
    prompt:
      "Regal renaissance oil-painting portrait of the pet in the reference photo, seated on a velvet throne, ermine cape, tiny golden crown, dark museum background, classical lighting",
    aspect: "4:5",
    photoSlots: ["Your pet"],
    addedOn: "2026-10-05",
    badge: "Popular",
  },
  {
    id: "superhero-pet-duo",
    name: "Superhero Pet Duo",
    theme: "Pets",
    description:
      "You and your pet as a superhero duo on a moonlit rooftop — 4 takes.",
    service: "pack-4",
    prompt:
      "You and your pet as a superhero duo in matching silver capes, dramatic landing pose on a moonlit city rooftop at night, cinematic wide shot, 4 variations",
    aspect: "1:1",
    photoSlots: ["You", "Your pet"],
    addedOn: "2026-10-04",
  },
  {
    id: "pet-dream-sequence",
    name: "Pet Dream Sequence",
    theme: "Pets",
    description:
      "Inside your sleeping pet's dream: a sky raining tennis balls and treats.",
    service: "single-image",
    prompt:
      "Dreamlike illustration of the pet in the reference photo sleeping peacefully while above it floats a dream bubble showing a magical sky raining tennis balls and dog treats, soft pastel colors, storybook style",
    aspect: "16:9",
    photoSlots: ["Your pet"],
    addedOn: "2026-10-01",
  },
  /* ── Celebrations ──────────────────────────────────────────── */
  {
    id: "birthday-glow-up",
    name: "Birthday Glow-Up",
    theme: "Celebrations",
    description:
      "Birthday portrait with confetti in the air and warm party lights.",
    service: "single-image",
    prompt:
      "Festive birthday portrait of the person in the reference photo, confetti frozen mid-air, warm golden party lights bokeh in the background, joyful expression, celebratory atmosphere",
    aspect: "4:5",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-03",
  },
  {
    id: "diwali-night",
    name: "Diwali Night",
    theme: "Celebrations",
    description:
      "Diwali night portrait — diyas glowing, fireworks bokeh, 4 takes.",
    service: "pack-4",
    prompt:
      "Beautiful Diwali night portrait of the person in the reference photo, rows of glowing diyas in the foreground, colorful fireworks bokeh in the night sky, warm festive light on the face, 4 variations",
    aspect: "4:5",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-06",
    badge: "New",
  },
  /* ── Fun ───────────────────────────────────────────────────── */
  {
    id: "action-figure-box",
    name: "Action Figure Box",
    theme: "Fun",
    description:
      "You as a boxed collectible action figure, accessories in the blister.",
    service: "single-image",
    prompt:
      "The person in the reference photo as a collectible action figure in a retail box, blister pack with miniature accessories beside them, toy-photography style, crisp studio lighting",
    aspect: "1:1",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-02",
    badge: "Popular",
  },
  {
    id: "plushie-shelf",
    name: "Plushie Shelf",
    theme: "Fun",
    description: "You as a chubby felt plush toy sitting on a wooden shelf.",
    service: "single-image",
    prompt:
      "The person in the reference photo reimagined as a chubby handmade felt plush toy with visible stitching, sitting on a wooden shelf among books, cozy warm lighting, adorable",
    aspect: "1:1",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-01",
  },
  /* ── Fantasy ───────────────────────────────────────────────── */
  {
    id: "dragon-rider",
    name: "Dragon Rider",
    theme: "Fantasy",
    description: "Soaring over snowy peaks at sunrise on an emerald dragon.",
    service: "single-image",
    prompt:
      "The person in the reference photo riding on the back of a majestic emerald dragon, soaring over snowy mountain peaks at sunrise, epic fantasy landscape, dramatic clouds, cinematic",
    aspect: "16:9",
    photoSlots: ["Your photo"],
    addedOn: "2026-10-04",
    badge: "Staff pick",
  },
  {
    id: "moonwalk-duo",
    name: "Moonwalk Duo",
    theme: "Fantasy",
    description:
      "You and your pet in spacesuits on the Moon, Earth rising — 4 takes.",
    service: "pack-4",
    prompt:
      "You and your pet wearing detailed spacesuits walking on the surface of the Moon, Earth rising in the black sky behind you, footprints in lunar dust, 4 variations, photorealistic",
    aspect: "16:9",
    photoSlots: ["You", "Your pet"],
    addedOn: "2026-10-05",
  },
] as const;

/* ── helpers ─────────────────────────────────────────────────── */

export function templateById(id: string | null | undefined): Template | null {
  if (!id) return null;
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Live catalog price (paise) for a template's service. Never hardcode. */
export function templatePricePaise(t: Template): number {
  return priceOf(t.service);
}

/**
 * Deep link that opens the composer with this template pre-loaded.
 * Image templates: /create?service=<id>&template=<id>
 * Video templates: /create?media=video&template=<id> (the composer has no
 * service selector in video mode — media=video is the honest routing).
 */
export function templateHref(t: Template): string {
  if (t.service === "clip-5s") return `/create?media=video&template=${t.id}`;
  return `/create?service=${t.service}&template=${t.id}`;
}

/** "2 photos · You + Your pet" / "Text prompt only" for the card. */
export function templateInputsLabel(t: Template): string {
  if (t.photoSlots.length === 0) return "Text prompt only";
  const n = t.photoSlots.length;
  return `${n} photo${n === 1 ? "" : "s"} · ${t.photoSlots.join(" + ")}`;
}

/** Newest first — the /trends default order. */
export function templatesByNewest(): Template[] {
  return [...TEMPLATES].sort((a, b) => b.addedOn.localeCompare(a.addedOn));
}

/* ── validation gate ─────────────────────────────────────────── */
/**
 * The contract every template must satisfy — enforced by vitest so a bad
 * template can never ship. knownIds = ids of the other templates (for
 * uniqueness checks).
 */
export function validateTemplate(t: Template, knownIds: string[]): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id))
    errors.push(`bad id: ${t.id}`);
  if (knownIds.includes(t.id)) errors.push(`duplicate id: ${t.id}`);
  if (!t.name || t.name.length > 60)
    errors.push(`bad name: ${t.id}`);
  if (!(TREND_THEMES as readonly string[]).includes(t.theme))
    errors.push(`bad theme: ${t.id}`);
  if (!t.description || t.description.length > 140)
    errors.push(`bad description: ${t.id}`);
  if (!(TEMPLATE_SERVICES as readonly string[]).includes(t.service))
    errors.push(`bad service: ${t.id}`);
  if (!t.prompt || t.prompt.length < 20 || t.prompt.length > 2000)
    errors.push(`bad prompt: ${t.id}`);
  if (!(VALID_ASPECTS as readonly string[]).includes(t.aspect))
    errors.push(`bad aspect: ${t.id}`);
  if (!Array.isArray(t.photoSlots))
    errors.push(`bad photoSlots: ${t.id}`);
  else if (t.photoSlots.some((s) => !s || typeof s !== "string"))
    errors.push(`empty photo slot label: ${t.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.addedOn) || Number.isNaN(Date.parse(t.addedOn)))
    errors.push(`bad addedOn: ${t.id}`);
  else if (t.addedOn > TRENDS_UPDATED)
    errors.push(`addedOn after TRENDS_UPDATED: ${t.id}`);
  if (t.badge && !["New", "Popular", "Staff pick"].includes(t.badge))
    errors.push(`bad badge: ${t.id}`);
  // The price must come from the catalog — this throws on unknown ids.
  try {
    templatePricePaise(t);
  } catch {
    errors.push(`service not in price catalog: ${t.id}`);
  }
  return errors;
}
