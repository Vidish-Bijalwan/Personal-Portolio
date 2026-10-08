/**
 * Image waiting-room motion — stage / progress mapping.
 *
 * The watch page polls GET /api/gen/[id]/status while an image generates.
 * The generation reports a free-text `stage` plus a machine `status`
 * ("queued" | "generating" | "done" | "failed"). progressForStage() turns
 * that into an honest 0–100 number. This module turns that number into the
 * four editorial darkroom stages for the "Developing your image" motion:
 *
 *   0 — Preparing the darkroom   (queued / preparing the pipeline)
 *   1 — Developing the print     (generating)
 *   2 — Fixing the print         (quality check)
 *   3 — Revealing your image     (watermarking / delivering)
 *
 * Hard rules (all test-gated, same as the video-edit page):
 * - Stage and % come ONLY from real backend data (progress + status).
 * - Displayed progress is monotonic: never moves backwards.
 * - The processing experience NEVER shows completion: displayed progress
 *   is clamped to 99 until the backend reports a terminal "done" status.
 *
 * The monotonicity/clamp helpers live in edit-motion.ts — shared, not
 * duplicated: both motion experiences keep the same honesty contract.
 */
export { clampProcessingProgress, monotonicProgress, monotonicStage } from "./edit-motion";

export const IMAGE_MOTION_STAGES = [
  "Preparing the darkroom",
  "Developing the print",
  "Fixing the print",
  "Revealing your image",
] as const;

export type ImageMotionStageIndex = 0 | 1 | 2 | 3;

/**
 * Map real backend progress to one of the four darkroom stages.
 *
 * Thresholds follow the image pipeline's honest progress bases
 * (progressForStage): queued 8 → preparing 20 → generating 55 →
 * quality check 80 → watermarking 92 → delivering 95 → done 100.
 *
 *   Preparing  0  → 39   (queued / setup)
 *   Developing 40 → 64   (generating)
 *   Fixing     65 → 84   (quality check)
 *   Revealing  85 → 99   (watermarking / delivering)
 *
 * Never returns anything "complete" — index 3 is "Revealing", and the
 * component clamps display to 99% while the job is non-terminal.
 */
export function imageMotionStageIndex(
  progress: number,
  status: string | null | undefined,
): ImageMotionStageIndex {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "done" || s === "ready" || s === "delivered" || s === "complete") {
    return 3;
  }
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  if (p >= 85) return 3;
  if (p >= 65) return 2;
  if (p >= 40) return 1;
  return 0;
}

/**
 * Contact-sheet development milestones: frame i "develops" (gains density)
 * once the real progress passes its milestone. Five frames, spaced across
 * the pipeline so the sheet visibly develops as the backend advances —
 * never on a timer.
 */
export const CONTACT_SHEET_MILESTONES = [10, 26, 42, 58, 74] as const;

/** Which contact-sheet frames are developed at this real progress. */
export function developedFrames(progress: number): number {
  const p = Number.isFinite(progress) ? progress : 0;
  return CONTACT_SHEET_MILESTONES.filter((m) => p >= m).length;
}
