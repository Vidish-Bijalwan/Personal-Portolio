/**
 * Convert a stored aspect-ratio label ("16:9", "9:16", "1:1", "4:5")
 * into a CSS aspect-ratio value ("16 / 9"). Unknown/empty input falls
 * back to 16 / 9 so players never collapse.
 */
export function cssAspectRatio(ar: string | null | undefined): string {
  const m = /^(\d+(?:\.\d+)?)\s*[:/x×]\s*(\d+(?:\.\d+)?)$/.exec(
    (ar ?? "").trim()
  );
  if (!m) return "16 / 9";
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
    return "16 / 9";
  return `${w} / ${h}`;
}
