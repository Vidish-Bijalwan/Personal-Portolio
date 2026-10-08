/**
 * Etch Poster Studio — prompt composer.
 *
 * Pure functions: template + field values + palette + free-text changes
 * become a single image-generation prompt. The blueprint encodes the design
 * patterns (bold condensed display type, color blocking, 4:5 portrait,
 * sticker badges, minimal-text discipline) and forces exact-text rendering
 * by quoting every text element.
 */

import type { PosterPalette, PosterTemplate } from "@/data/poster-templates/templates";

export interface ComposeInput {
  /** Field values keyed by field.key; missing keys fall back to defaults. */
  fields: Record<string, string>;
  /** Selected palette id; falls back to the template's first palette. */
  paletteId?: string;
  /** Free-text "describe what to change" box. */
  freeText?: string;
}

/** Strip quotes/newlines and clamp to the field's max length. */
export function sanitizeFieldValue(raw: string, maxLength: number): string {
  const cleaned = (raw ?? "")
    .replace(/[""'«»„“]/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, Math.max(1, maxLength));
}

function fieldValue(
  template: PosterTemplate,
  fields: Record<string, string>,
  key: string,
): string {
  const def = template.fields.find((f) => f.key === key);
  const maxLength = def?.maxLength ?? 40;
  const raw = fields[key];
  if (raw == null || raw.trim() === "") return def?.default ?? "";
  return sanitizeFieldValue(raw, maxLength);
}

export function paletteFor(
  template: PosterTemplate,
  paletteId?: string,
): PosterPalette {
  return (
    template.palettes.find((p) => p.id === paletteId) ?? template.palettes[0]
  );
}

/**
 * Build the final generation prompt. Every text element is quoted so the
 * image model renders it exactly; free text is appended as a style override.
 */
export function composePosterPrompt(
  template: PosterTemplate,
  input: ComposeInput,
): string {
  const palette = paletteFor(template, input.paletteId);
  const values: Record<string, string> = {};
  for (const f of template.fields) {
    values[f.key] = fieldValue(template, input.fields, f.key);
  }

  const textLines = template.fields
    .map((f) => `- "${values[f.key]}"`)
    .join("\n");

  const freeText = (input.freeText ?? "").trim().slice(0, 500);

  const parts = [
    "Professional advertising poster design, vertical 4:5 portrait format, print-quality.",
    `BACKGROUND AND COLORS: ${palette.prompt}.`,
    `HERO IMAGE: ${template.hero}.`,
    "TYPOGRAPHY — render the following text EXACTLY as written, in bold display lettering. Do not add, remove, or change any word:",
    textLines,
    `LAYOUT AND STYLE: ${template.style}`,
    "TEXT DISCIPLINE: only the quoted text above may appear on the poster. Crisp, perfectly legible lettering — no garbled, misspelled, or extra words. No watermark, no logo, no signature.",
  ];
  if (freeText) {
    parts.push(`STYLE ADJUSTMENT REQUESTED BY THE USER: ${freeText}.`);
  }
  return parts.join("\n");
}

/** Short preview of the composed prompt for the UI. */
export function composePromptPreview(
  template: PosterTemplate,
  input: ComposeInput,
  maxChars = 220,
): string {
  const full = composePosterPrompt(template, input);
  return full.length > maxChars ? full.slice(0, maxChars) + "…" : full;
}
