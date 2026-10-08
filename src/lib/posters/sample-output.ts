/**
 * Poster Studio "sample output" mock — render-decision helpers.
 *
 * Pure functions (no DOM, no React) that interpret a template's style
 * direction string and palette swatches into render decisions for the
 * client-side sample-output mock shown in the gallery demo preview and the
 * template customizer. Unit-testable in a node environment.
 */

export interface StyleFlags {
  /** elegant script/italic headline treatment (café, travel, beauty) */
  script: boolean;
  /** refined serif headline, non-script */
  serif: boolean;
  /** aggressive diagonal energy — tilt the headline + badge */
  slanted: boolean;
  /** airy layout — generous whitespace, smaller headline */
  airy: boolean;
  /** badge rendered as a circular sticker (vs. a ribbon/bar) */
  roundBadge: boolean;
}

/**
 * Interpret the template's free-form style direction into layout flags.
 * Keyword matching is intentionally conservative: unknown phrasing falls
 * back to the default bold-condensed treatment.
 */
export function styleFlags(style: string): StyleFlags {
  const s = style.toLowerCase();
  const script = s.includes("script");
  return {
    script,
    serif: !script && s.includes("serif"),
    slanted: s.includes("slant") || s.includes("diagonal"),
    airy: s.includes("whitespace"),
    roundBadge:
      s.includes("circular") ||
      s.includes("round") ||
      s.includes("starburst") ||
      s.includes("sticker"),
  };
}

function channels(hex: string): [number, number, number] {
  const m = hex.trim().replace(/^#/, "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) throw new Error(`bad hex: ${hex}`);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => v / 255);
  const f = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Readable ink color on the given background hex: warm near-black on light
 * backgrounds, white on dark ones.
 */
export function contrastText(hex: string): string {
  try {
    return luminance(hex) > 0.45 ? "#17130E" : "#FFFFFF";
  } catch {
    return "#FFFFFF";
  }
}

/** Mix a hex color toward black by `amount` (0 = unchanged, 1 = black). */
export function shade(hex: string, amount: number): string {
  const t = Math.min(1, Math.max(0, amount));
  try {
    const [r, g, b] = channels(hex).map((v) => Math.round(v * (1 - t)));
    return (
      "#" +
      [r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  } catch {
    return hex;
  }
}
