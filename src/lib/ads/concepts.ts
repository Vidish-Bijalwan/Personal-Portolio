/**
 * Etch Ad Studio — concept bank loader.
 *
 * The "Ad Concept Memory" knowledge base ships with the code under
 * src/data/ad-concepts/ (concepts.json, palettes.json, typography.json,
 * layouts.json). These loaders statically import those files and normalize
 * them into typed records.
 *
 * Graceful fallback: every parse function validates the raw shape and
 * returns [] for missing/corrupt/invalid input instead of throwing, so the
 * /ads UI can render an honest empty state rather than crash.
 */

import rawConcepts from "@/data/ad-concepts/concepts.json";
import rawPalettes from "@/data/ad-concepts/palettes.json";
import rawTypography from "@/data/ad-concepts/typography.json";
import rawLayouts from "@/data/ad-concepts/layouts.json";
import { composerServiceById, type ComposerServiceId } from "@/lib/pricing/catalog";
import { enhancePrompt } from "@/data/prompt-bank/builder";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ConceptMedia = "image" | "video";

export interface Concept {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt_template: string;
  best_for: string;
  media: ConceptMedia;
  source: string;
}

export interface Palette {
  name: string;
  /** 4–5 hex colors, background → accent order. */
  colors: string[];
  mood: string;
  best_for: string;
  source: string;
}

export interface TypographyPairing {
  name: string;
  /** Headline font style-class description. */
  headline: string;
  /** Body font style-class description. */
  body: string;
  mood: string;
  best_for: string;
  source: string;
}

export interface LayoutPattern {
  name: string;
  description: string;
  /** Reading order the composition honors, e.g. "Product → headline → CTA". */
  eye_path: string;
  best_for: string;
  source: string;
}

/* ------------------------------------------------------------------ */
/* Shape validation — corrupt data degrades to [] per file             */
/* ------------------------------------------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function isConcept(v: unknown): v is Concept {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.name === "string" &&
    v.name.length > 0 &&
    typeof v.prompt_template === "string" &&
    v.prompt_template.length > 0 &&
    (v.media === "image" || v.media === "video")
  );
}

function isPalette(v: unknown): v is Palette {
  if (!isRecord(v)) return false;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    Array.isArray(v.colors) &&
    v.colors.length > 0 &&
    v.colors.every((c) => typeof c === "string")
  );
}

function isTypographyPairing(v: unknown): v is TypographyPairing {
  if (!isRecord(v)) return false;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    typeof v.headline === "string" &&
    v.headline.length > 0 &&
    typeof v.body === "string" &&
    v.body.length > 0
  );
}

function isLayoutPattern(v: unknown): v is LayoutPattern {
  if (!isRecord(v)) return false;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    typeof v.eye_path === "string" &&
    v.eye_path.length > 0
  );
}

/** Normalize one raw concept record; never throws. */
export function parseConcept(raw: unknown): Concept | null {
  if (!isConcept(raw)) return null;
  return {
    id: raw.id as string,
    name: raw.name as string,
    category: str(raw.category),
    description: str(raw.description),
    prompt_template: raw.prompt_template as string,
    best_for: str(raw.best_for),
    media: raw.media as ConceptMedia,
    source: str(raw.source),
  };
}

/** Parse a raw concepts.json payload → Concept[]. Never throws. */
export function parseConceptsFile(raw: unknown): Concept[] {
  try {
    const list = isRecord(raw) && Array.isArray(raw.concepts) ? raw.concepts : raw;
    if (!Array.isArray(list)) return [];
    const out: Concept[] = [];
    const seen = new Set<string>();
    for (const item of list) {
      const c = parseConcept(item);
      if (c && !seen.has(c.id)) {
        seen.add(c.id);
        out.push(c);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Parse a raw palettes.json payload → Palette[]. Never throws. */
export function parsePalettesFile(raw: unknown): Palette[] {
  try {
    const list = isRecord(raw) && Array.isArray(raw.palettes) ? raw.palettes : raw;
    if (!Array.isArray(list)) return [];
    const out: Palette[] = [];
    for (const item of list) {
      if (!isPalette(item)) continue;
      out.push({
        name: item.name,
        colors: item.colors.filter((c): c is string => typeof c === "string"),
        mood: str(item.mood),
        best_for: str(item.best_for),
        source: str(item.source),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Parse a raw typography.json payload → TypographyPairing[]. Never throws. */
export function parseTypographyFile(raw: unknown): TypographyPairing[] {
  try {
    const list = isRecord(raw) && Array.isArray(raw.pairings) ? raw.pairings : raw;
    if (!Array.isArray(list)) return [];
    const out: TypographyPairing[] = [];
    for (const item of list) {
      if (!isTypographyPairing(item)) continue;
      out.push({
        name: item.name,
        headline: item.headline,
        body: item.body,
        mood: str(item.mood),
        best_for: str(item.best_for),
        source: str(item.source),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Parse a raw layouts.json payload → LayoutPattern[]. Never throws. */
export function parseLayoutsFile(raw: unknown): LayoutPattern[] {
  try {
    const list = isRecord(raw) && Array.isArray(raw.layouts) ? raw.layouts : raw;
    if (!Array.isArray(list)) return [];
    const out: LayoutPattern[] = [];
    for (const item of list) {
      if (!isLayoutPattern(item)) continue;
      out.push({
        name: item.name,
        description: str(item.description),
        eye_path: item.eye_path,
        best_for: str(item.best_for),
        source: str(item.source),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Loaders                                                             */
/* ------------------------------------------------------------------ */

/** All ad concepts (image + video). [] when the bank is missing/corrupt. */
export function getConcepts(): Concept[] {
  return parseConceptsFile(rawConcepts);
}

/** All color palettes. [] when the file is missing/corrupt. */
export function getPalettes(): Palette[] {
  return parsePalettesFile(rawPalettes);
}

/** All typography pairings. [] when the file is missing/corrupt. */
export function getTypography(): TypographyPairing[] {
  return parseTypographyFile(rawTypography);
}

/** All layout patterns. [] when the file is missing/corrupt. */
export function getLayouts(): LayoutPattern[] {
  return parseLayoutsFile(rawLayouts);
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

/**
 * Filter concepts by a vertical keyword and media pipeline.
 * The keyword matches against category, best_for and description
 * (case-insensitive). An empty keyword returns every concept for the
 * requested media.
 */
export function matchConcepts(
  vertical: string,
  media: ConceptMedia,
  concepts: Concept[] = getConcepts()
): Concept[] {
  const q = vertical.trim().toLowerCase();
  return concepts.filter((c) => {
    if (c.media !== media) return false;
    if (!q) return true;
    return (
      c.category.toLowerCase().includes(q) ||
      c.best_for.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });
}

/* ------------------------------------------------------------------ */
/* Prompt composition                                                  */
/* ------------------------------------------------------------------ */

/** Look up helpers — null when the named option doesn't exist. */
export function paletteByName(name: string, palettes: Palette[] = getPalettes()): Palette | null {
  return palettes.find((p) => p.name === name) ?? null;
}

export function typographyByName(
  name: string,
  pairings: TypographyPairing[] = getTypography()
): TypographyPairing | null {
  return pairings.find((t) => t.name === name) ?? null;
}

export function layoutByName(name: string, layouts: LayoutPattern[] = getLayouts()): LayoutPattern | null {
  return layouts.find((l) => l.name === name) ?? null;
}

/**
 * Compose the final generation prompt:
 *  1. concept.prompt_template with {product} replaced by the product text,
 *     or — when no concept is selected (freeform path) — a neutral premium
 *     base template built from the product description alone.
 *  2. appended style tokens for the chosen palette (mood + hex colors),
 *     typography pairing (headline/body style + mood) and layout (eye path)
 * Unknown option names are skipped silently; an empty product with no
 * concept yields "" (the UI treats that as "no prompt yet").
 */
export function buildFinalPrompt(
  concept: Concept | null | undefined,
  product: string,
  paletteName?: string,
  typographyName?: string,
  layoutName?: string
): string {
  const productText = product.trim();
  let prompt: string;
  if (concept && typeof concept.prompt_template === "string") {
    prompt = concept.prompt_template
      .split("{product}")
      .join(productText || "{product}");
  } else {
    // Freeform path: no predefined concept — describe the product directly.
    if (!productText) return "";
    prompt =
      `Premium advertising photograph of ${productText}, professional commercial ` +
      `product photography, studio quality, photorealistic, ultra detailed`;
  }

  const tokens: string[] = [];
  if (paletteName) {
    const p = paletteByName(paletteName);
    if (p) {
      tokens.push(
        `Color palette: ${p.mood || p.name} (${p.colors.join(", ")})`
      );
    }
  }
  if (typographyName) {
    const t = typographyByName(typographyName);
    if (t) {
      tokens.push(
        `Typography: ${t.headline} headline with ${t.body} body, ${t.mood || "clean"} feel`
      );
    }
  }
  if (layoutName) {
    const l = layoutByName(layoutName);
    if (l) {
      tokens.push(`Layout: ${l.name} — eye path ${l.eye_path}`);
    }
  }

  if (tokens.length > 0) prompt += ". " + tokens.join(". ");
  // Cinema-grade foundation: the assembled ad prompt stays verbatim and
  // leads; the prompt bank appends cinematic craft (lighting, optics,
  // composition, quality). Dedup keeps the deep-link into /create from
  // stacking terms twice when the prompt is interpreted again there.
  return enhancePrompt(prompt, { maxLength: 2000 }).enhanced;
}

/* ------------------------------------------------------------------ */
/* /create deep-link service mapping                                   */
/* ------------------------------------------------------------------ */

/**
 * Which image-composer service a concept deep-links to.
 * Poster-style concepts (sale/promotional) fit the single-image service;
 * everything photographic fits product-photo. Video concepts return null —
 * they deep-link with ?media=video instead.
 */
export function conceptService(concept: Concept): ComposerServiceId | null {
  if (concept.media === "video") return null;
  const posterish = ["promotional", "social-proof", "stylized"];
  const id: ComposerServiceId = posterish.includes(concept.category)
    ? "single-image"
    : "product-photo";
  return composerServiceById(id) ? id : null;
}
