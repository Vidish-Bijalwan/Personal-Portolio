/**
 * Real progress for the watch pages' progress bars.
 *
 * The video-studio watcher (and the generation pipeline) report a free-text
 * `stage` ("Recording your voice-over", "Polishing the final cut", …) plus a
 * machine `status` ("queued" | "processing" | "done" | "failed"). This maps
 * those to an honest 0–100 percentage so the bar reflects actual progress
 * instead of sitting at a fixed indeterminate width.
 *
 * The percentages are coarse by design — they communicate "where in the
 * pipeline" rather than pretending to measure exact completion.
 */
export function progressForStage(
  stage: string | null | undefined,
  status: string | null | undefined,
  createdAt?: string | number | Date | null,
): number {
  const base = progressBaseForStage(stage, status);
  // Terminal states never creep.
  if (base >= 100) return base;
  // Time-aware creep: the bar moves forward as real seconds pass, so it
  // never looks stuck at 20% for 2.5 minutes. Elapsed time pushes the
  // progress toward (but never past) the next stage's threshold.
  if (createdAt) {
    const elapsedSec = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 1000);
    // ~1% per 6s of real waiting, capped at 12% above the stage base.
    // This keeps the bar honest: stage jumps still dominate, time just
    // fills the gaps between watcher updates (watcher runs every ~60s).
    const creep = Math.min(12, Math.floor(elapsedSec / 6));
    return Math.min(97, base + creep);
  }
  return base;
}

function progressBaseForStage(
  stage: string | null | undefined,
  status: string | null | undefined,
): number {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "done" || s === "ready" || s === "delivered" || s === "complete") {
    return 100;
  }

  const t = (stage ?? "").toLowerCase();

  // Still waiting for a worker / operator.
  if (s === "queued" || t.includes("queue") || t.includes("waiting")) return 8;

  // Video-studio pipeline stages (set by the watcher). Order matters:
  // "Polishing the final cut" contains "cut", so check polish/final first.
  if (t.includes("polish") || t.includes("final")) return 88; // "Polishing the final cut"
  if (t.includes("voice")) return 30; // "Recording your voice-over"
  if (t.includes("caption") || t.includes("listen")) return 50; // "Listening and captioning"
  if (t.includes("cut")) return 65; // "Cutting your clip"

  // Phase 4 real-tool stages (set by the watcher).
  if (t.includes("compress")) return 60; // "Compressing your video"
  if (t.includes("extract")) return 60; // "Extracting your audio"
  if (t.includes("gif")) return 60; // "Building your GIF"
  if (t.includes("mix")) return 60; // "Mixing in your audio"
  if (t.includes("noise")) return 55; // "Cleaning background noise"

  // Image-generation pipeline stages (keyword-tolerant).
  if (t.includes("warm") || t.includes("grill") || t.includes("setup")) return 20;
  if (t.includes("generat") || t.includes("render") || t.includes("creat")) return 55;
  if (t.includes("review") || t.includes("quality") || t.includes("qc")) return 80;

  // Processing, but the stage text is unrecognized — an honest midpoint
  // beats a stuck-looking bar.
  return 40;
}
