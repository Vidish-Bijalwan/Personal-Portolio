/**
 * Waiting-room stage copy — warm and professional, no grill metaphors.
 *
 * The generation pipeline reports free-text stages ("Cooking your
 * creation", "Plating it up", "Rendering frames", …). displayStage()
 * maps the known legacy labels to polished copy and passes anything
 * else through unchanged, so future pipeline stages keep working.
 */

const STAGE_MAP: Array<[RegExp, string]> = [
  [/warming up the grill/i, "Preparing your creation"],
  [/firing up the grill/i, "Preparing your creation"],
  [/cooking your creation/i, "Creating your image"],
  [/plating/i, "Running the quality check"],
  [/rendering frames/i, "Rendering your clip"],
  [/cutting the final/i, "Finalizing your clip"],
  [/setting up the projector/i, "Preparing your clip"],
];

/** Polished display label for a raw pipeline stage string. */
export function displayStage(stage: string | null | undefined): string {
  const s = (stage ?? "").trim();
  if (!s) return "Preparing your creation";
  for (const [re, label] of STAGE_MAP) {
    if (re.test(s)) return label;
  }
  return s;
}
