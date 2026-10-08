/**
 * Video-edit motion experience — stage / progress mapping.
 *
 * The video-studio watch page polls GET /api/video-jobs/[id]/status every 3s.
 * The job reports a free-text `stage` plus a machine `status`
 * ("queued" | "processing" | "done" | "failed"). progressForStage() turns that
 * into an honest 0–100 number. This module turns that number into the four
 * editorial motion stages from Vidish's brief:
 *
 *   0 — Analyzing footage
 *   1 — Understanding style
 *   2 — Generating edit
 *   3 — Finalizing
 *
 * Hard rules (all test-gated):
 * - Stage and % come ONLY from real backend data (progress + status).
 * - Displayed progress is monotonic: it never moves backwards while the job
 *   is non-terminal (progress jumping backwards is a hard negative).
 * - The processing experience NEVER shows completion: displayed progress is
 *   clamped to 99 until the backend reports a terminal "done" status. The
 *   restrained "Your edit is ready" reveal lives in the page's done section,
 *   which only renders on status === "done".
 */
export const EDIT_MOTION_STAGES = [
  "Analyzing footage",
  "Understanding style",
  "Generating edit",
  "Finalizing",
] as const;

export type EditMotionStageIndex = 0 | 1 | 2 | 3;

/**
 * Map real backend progress to one of the four editorial stages.
 * Thresholds follow the brief's milestone map:
 *   Analyzing 18→31→46, Understanding 46→60, Generating 60→78,
 *   Finalizing 78→91→100.
 * Never returns anything "complete" — index 3 is "Finalizing", and the
 * component clamps display to 99% while the job is non-terminal.
 */
export function editMotionStageIndex(
  progress: number,
  status: string | null | undefined,
): EditMotionStageIndex {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "done" || s === "ready" || s === "delivered" || s === "complete") {
    return 3;
  }
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  if (p >= 88) return 3;
  if (p >= 60) return 2;
  if (p >= 46) return 1;
  return 0;
}

/**
 * Clamp a non-terminal progress value for display. The processing UI must
 * never render 100% / a finished bar before the backend says "done".
 */
export function clampProcessingProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.floor(value)));
}

/**
 * Monotonic display progress: each new backend reading can only move the
 * shown value forward, never backwards.
 */
export function monotonicProgress(
  prev: number | null | undefined,
  next: number,
): number {
  const n = clampProcessingProgress(next);
  if (prev == null || !Number.isFinite(prev)) return n;
  return Math.max(clampProcessingProgress(prev), n);
}

/** Monotonic stage: once a stage activates, its indicator never regresses. */
export function monotonicStage(
  prev: EditMotionStageIndex | null | undefined,
  next: EditMotionStageIndex,
): EditMotionStageIndex {
  if (prev == null) return next;
  return Math.max(prev, next) as EditMotionStageIndex;
}
