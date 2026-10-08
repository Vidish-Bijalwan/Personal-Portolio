/**
 * Video-edit motion experience (2026-10-08, Vidish's motion brief):
 * the "Editing your video" processing page is a live web animation whose
 * % and stage are driven by the REAL backend job status — never fake-timed.
 *
 * Follows the repo's file-content gate pattern (waiting-room.test.ts):
 * .tsx components are asserted via source, pure logic via imports.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  EDIT_MOTION_STAGES,
  clampProcessingProgress,
  editMotionStageIndex,
  monotonicProgress,
  monotonicStage,
} from "../../../src/lib/vilish/edit-motion";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

const compSrc = readFileSync(
  join(root, "components", "vilish", "video-edit-motion.tsx"),
  "utf8",
);
const cssSrc = readFileSync(
  join(root, "components", "vilish", "video-edit-motion.css"),
  "utf8",
);
const watchSrc = readFileSync(
  join(root, "app", "video-studio", "watch", "[id]", "page.tsx"),
  "utf8",
);
const globalsCss = readFileSync(join(root, "app", "globals.css"), "utf8");

describe("edit-motion stage mapping (real backend data only)", () => {
  it("exposes the four brief stages in order", () => {
    expect([...EDIT_MOTION_STAGES]).toEqual([
      "Analyzing footage",
      "Understanding style",
      "Generating edit",
      "Finalizing",
    ]);
  });

  it("maps the brief's milestone percentages to stages", () => {
    // Analyzing 18→31→46 · Understanding 46→60 · Generating 60→78 · Finalizing 78→91→100
    expect(editMotionStageIndex(18, "processing")).toBe(0);
    expect(editMotionStageIndex(31, "processing")).toBe(0);
    expect(editMotionStageIndex(46, "processing")).toBe(1);
    expect(editMotionStageIndex(59, "processing")).toBe(1);
    expect(editMotionStageIndex(60, "processing")).toBe(2);
    expect(editMotionStageIndex(78, "processing")).toBe(2);
    expect(editMotionStageIndex(88, "processing")).toBe(3);
    expect(editMotionStageIndex(91, "processing")).toBe(3);
  });

  it("maps real watcher progress bases to sensible stages", () => {
    expect(editMotionStageIndex(8, "queued")).toBe(0); // queued
    expect(editMotionStageIndex(30, "processing")).toBe(0); // recording voice-over
    expect(editMotionStageIndex(50, "processing")).toBe(1); // listening/captioning
    expect(editMotionStageIndex(65, "processing")).toBe(2); // cutting clip
    expect(editMotionStageIndex(88, "processing")).toBe(3); // polishing final cut
  });

  it("terminal done status lands on Finalizing (index 3), never a fake 'complete' state", () => {
    expect(editMotionStageIndex(100, "done")).toBe(3);
    expect(editMotionStageIndex(100, "processing")).toBe(3); // still "Finalizing", not done
  });

  it("handles garbage input without throwing", () => {
    expect(editMotionStageIndex(NaN, "processing")).toBe(0);
    expect(editMotionStageIndex(-5, "processing")).toBe(0);
    expect(editMotionStageIndex(999, "processing")).toBe(3);
    expect(editMotionStageIndex(50, null)).toBe(1);
  });
});

describe("never show completion early / never jump backwards", () => {
  it("clamps processing display to 99 — 100% only comes from backend 'done'", () => {
    expect(clampProcessingProgress(100)).toBe(99);
    expect(clampProcessingProgress(99.9)).toBe(99);
    expect(clampProcessingProgress(46)).toBe(46);
    expect(clampProcessingProgress(0)).toBe(0);
    expect(clampProcessingProgress(NaN)).toBe(0);
    expect(clampProcessingProgress(-3)).toBe(0);
  });

  it("displayed progress is monotonic — never moves backwards", () => {
    expect(monotonicProgress(46, 31)).toBe(46);
    expect(monotonicProgress(46, 60)).toBe(60);
    expect(monotonicProgress(null, 18)).toBe(18);
    expect(monotonicProgress(97, 100)).toBe(99); // still clamped
  });

  it("stage never regresses once activated", () => {
    expect(monotonicStage(2, 1)).toBe(2);
    expect(monotonicStage(1, 3)).toBe(3);
    expect(monotonicStage(null, 0)).toBe(0);
  });
});

describe("video-edit-motion component (source gates)", () => {
  // strip comments so doc wording ("no Math.random", "never show 100% early")
  // can't trip the gates — only real code counts.
  const code = compSrc
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "");

  it("is a client component wiring real progress + stage, with no fake timers", () => {
    expect(compSrc).toContain('"use client"');
    expect(compSrc).toContain("monotonicProgress");
    expect(compSrc).toContain("clampProcessingProgress");
    expect(compSrc).toContain("editMotionStageIndex");
    expect(code).not.toContain("setInterval");
    expect(code).not.toContain("setTimeout");
    expect(code).not.toContain("Math.random(");
  });

  it("drives playhead/bar/waveform from the real shown progress", () => {
    expect(compSrc).toContain("style={{ left: `${shown}%` }}");
    expect(compSrc).toContain("style={{ width: `${shown}%` }}");
    expect(compSrc).toContain("aria-valuenow={shown}");
  });

  it("never renders a completion headline — ready reveal belongs to the done section", () => {
    expect(code).not.toMatch(/your edit is ready/i);
    expect(code).not.toContain("100%"); // display is clamped to 99 while processing
  });

  it("keeps role=progressbar + stage list semantics", () => {
    expect(compSrc).toContain('role="progressbar"');
    expect(compSrc).toContain('role="list"');
    expect(compSrc).toContain('aria-current={active ? "step" : undefined}');
  });
});

describe("video-edit-motion.css (source gates)", () => {
  it("respects prefers-reduced-motion with a calm static fallback", () => {
    expect(cssSrc).toContain("@media (prefers-reduced-motion: reduce)");
    // entrance uses backwards fill so base styles are the composed resting state
    expect(cssSrc).toContain("backwards");
  });

  it("honours the hard negatives — no neon blue, no glow-everywhere", () => {
    const lower = cssSrc.toLowerCase();
    expect(lower).not.toContain("#00f");
    expect(lower).not.toContain("cyan");
    expect(lower).not.toContain("neon");
    expect(lower).not.toContain("purple");
    // Only restrained light: one black panel shadow, one gold knob halo, and
    // the single subtle warm text illumination on the gold headline (3 keyframe
    // steps of one animation). No glow-everywhere.
    const glows = (cssSrc.match(/box-shadow|text-shadow/g) || []).length;
    expect(glows).toBeLessThanOrEqual(6);
  });

  it("uses the editorial palette", () => {
    expect(cssSrc).toContain("#c6a15b"); // muted antique gold (pro-accent)
    expect(cssSrc).toContain("#b3402e"); // burnt red
    expect(cssSrc).toContain("#080808");
  });

  it("idle loop is invisible: ambient loops run infinite, mid-cycle from t=0", () => {
    expect(cssSrc).toContain("infinite");
    // waveform bars get negative delays inline so they're mid-breathe at load
    expect(compSrc).toMatch(/animationDelay:\s*`\$\{-\(/);
    // entrance animations use backwards fill → no flash of unstyled state
    expect(cssSrc).toContain("backwards");
  });
});

describe("watch page wiring (source gates)", () => {
  it("renders VideoEditMotion with the real polled progress + stage", () => {
    expect(watchSrc).toContain("VideoEditMotion");
    expect(watchSrc).toContain("progress={progress}");
    expect(watchSrc).toContain("stageText={stageText}");
    // progress still comes from the real backend mapping, not a fake
    expect(watchSrc).toContain("progressForStage(data.stage, data.status, data.created_at)");
    expect(watchSrc).toContain("/api/video-jobs/${encodeURIComponent(id)}/status");
  });

  it("polls the job-status endpoint until a terminal state", () => {
    expect(watchSrc).toContain("setInterval");
    expect(watchSrc).toContain("3000");
    expect(watchSrc).toContain('cur.status === "done"');
  });

  it("retired the generic PopcornReel showpiece from this page", () => {
    expect(watchSrc).not.toContain("PopcornReel");
  });

  it("done sections carry the restrained ready reveal (rendered only on done)", () => {
    expect(watchSrc).toContain("vse-ready");
    expect(watchSrc).toContain('data.status === "done"');
    expect(globalsCss).toContain(".vse-ready");
    expect(globalsCss).toContain("@keyframes vse-ready-up");
  });
});
