/**
 * Image waiting-room motion experience (2026-10-08): the "Developing your
 * image" darkroom is a live web animation whose % and stage are driven by
 * the REAL backend generation status — never fake-timed. It mirrors the
 * video-edit page's motion architecture (shared monotonicity/clamp
 * helpers, no fake completion).
 *
 * Follows the repo's file-content gate pattern (video-edit-motion.test.ts):
 * .tsx components are asserted via source, pure logic via imports.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  CONTACT_SHEET_MILESTONES,
  IMAGE_MOTION_STAGES,
  clampProcessingProgress,
  developedFrames,
  imageMotionStageIndex,
  monotonicProgress,
  monotonicStage,
} from "../../../src/lib/vilish/image-motion";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

const compSrc = readFileSync(
  join(root, "components", "vilish", "image-develop-motion.tsx"),
  "utf8",
);
const cssSrc = readFileSync(
  join(root, "components", "vilish", "image-develop-motion.css"),
  "utf8",
);
const watchSrc = readFileSync(
  join(root, "app", "watch", "[id]", "page.tsx"),
  "utf8",
);

describe("image-motion stage mapping (real backend data only)", () => {
  it("exposes the four darkroom stages in order", () => {
    expect([...IMAGE_MOTION_STAGES]).toEqual([
      "Preparing the darkroom",
      "Developing the print",
      "Fixing the print",
      "Revealing your image",
    ]);
  });

  it("maps the image pipeline's real progress bases to stages", () => {
    expect(imageMotionStageIndex(8, "queued")).toBe(0); // queued
    expect(imageMotionStageIndex(20, "generating")).toBe(0); // preparing
    expect(imageMotionStageIndex(55, "generating")).toBe(1); // generating
    expect(imageMotionStageIndex(80, "generating")).toBe(2); // quality check
    expect(imageMotionStageIndex(92, "generating")).toBe(3); // watermarking
    expect(imageMotionStageIndex(95, "generating")).toBe(3); // delivering
  });

  it("maps the milestone thresholds exactly", () => {
    expect(imageMotionStageIndex(39, "generating")).toBe(0);
    expect(imageMotionStageIndex(40, "generating")).toBe(1);
    expect(imageMotionStageIndex(64, "generating")).toBe(1);
    expect(imageMotionStageIndex(65, "generating")).toBe(2);
    expect(imageMotionStageIndex(84, "generating")).toBe(2);
    expect(imageMotionStageIndex(85, "generating")).toBe(3);
  });

  it("terminal done status lands on Revealing (index 3), never a fake 'complete' state", () => {
    expect(imageMotionStageIndex(100, "done")).toBe(3);
    expect(imageMotionStageIndex(100, "generating")).toBe(3); // still "Revealing", not done
  });

  it("handles garbage input without throwing", () => {
    expect(imageMotionStageIndex(NaN, "generating")).toBe(0);
    expect(imageMotionStageIndex(-5, "generating")).toBe(0);
    expect(imageMotionStageIndex(999, "generating")).toBe(3);
    expect(imageMotionStageIndex(50, null)).toBe(1);
  });
});

describe("contact-sheet development milestones", () => {
  it("declares five ascending milestones", () => {
    expect([...CONTACT_SHEET_MILESTONES]).toEqual([10, 26, 42, 58, 74]);
  });

  it("frames develop as real progress passes their milestones — never on a timer", () => {
    expect(developedFrames(0)).toBe(0);
    expect(developedFrames(10)).toBe(1);
    expect(developedFrames(41)).toBe(2);
    expect(developedFrames(58)).toBe(4);
    expect(developedFrames(74)).toBe(5);
    expect(developedFrames(NaN)).toBe(0);
  });
});

describe("honesty contract shared with the video-edit page", () => {
  it("clamps processing display to 99 — 100% only comes from backend 'done'", () => {
    expect(clampProcessingProgress(100)).toBe(99);
    expect(clampProcessingProgress(0)).toBe(0);
    expect(clampProcessingProgress(NaN)).toBe(0);
  });

  it("displayed progress is monotonic — never moves backwards", () => {
    expect(monotonicProgress(55, 20)).toBe(55);
    expect(monotonicProgress(20, 55)).toBe(55);
    expect(monotonicProgress(null, 8)).toBe(8);
  });

  it("stage never regresses once activated", () => {
    expect(monotonicStage(2, 1)).toBe(2);
    expect(monotonicStage(1, 3)).toBe(3);
    expect(monotonicStage(null, 0)).toBe(0);
  });
});

describe("image-develop-motion component (source gates)", () => {
  // strip comments so doc wording ("no Math.random", "never show 100%")
  // can't trip the gates — only real code counts.
  const code = compSrc
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "");

  it("is a client component wiring real progress + stage, with no fake timers", () => {
    expect(compSrc).toContain('"use client"');
    expect(compSrc).toContain("monotonicProgress");
    expect(compSrc).toContain("clampProcessingProgress");
    expect(compSrc).toContain("imageMotionStageIndex");
    expect(code).not.toContain("setInterval");
    expect(code).not.toContain("setTimeout");
    expect(code).not.toContain("Math.random(");
  });

  it("drives the developer front + latent-image density from the real shown progress", () => {
    expect(compSrc).toContain("style={{ left: `${frontPct}%` }}");
    expect(compSrc).toContain("aria-valuenow={shown}");
    // density is derived from shown, never a constant
    expect(compSrc).toMatch(/0\.14 \+ \(0\.86 \* shown\) \/ 100/);
  });

  it("never renders a completion headline — ready reveal belongs to the done section", () => {
    expect(code).not.toMatch(/your image is ready/i);
    expect(code).not.toContain("100%"); // display is clamped to 99 while processing
  });

  it("keeps role=progressbar + stage list semantics", () => {
    expect(compSrc).toContain('role="progressbar"');
    expect(compSrc).toContain('role="list"');
    expect(compSrc).toContain('aria-current={active ? "step" : undefined}');
  });

  it("is stage-driven, not frame-driven: no burger frames in the image room", () => {
    expect(code).not.toContain("BurgerGrill");
    expect(code).not.toContain("burgerFrameForStage");
  });
});

describe("image-develop-motion.css (source gates)", () => {
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
    // Only restrained light: one tray shadow + inset paper edge (≤6 total
    // box/text shadows). No glow-everywhere.
    const glows = (cssSrc.match(/box-shadow|text-shadow/g) || []).length;
    expect(glows).toBeLessThanOrEqual(6);
  });

  it("uses the editorial palette", () => {
    expect(cssSrc).toContain("#c6a15b"); // muted antique gold (pro-accent)
    expect(cssSrc).toContain("#b3402e"); // restrained safelight red
    expect(cssSrc).toContain("#080808");
    expect(cssSrc).toContain("#ece3d0"); // cream
  });

  it("idle loop is invisible: ambient loops run infinite, mid-cycle from t=0", () => {
    expect(cssSrc).toContain("infinite");
    // negative delays on ambient loops (dust, drips, shimmer, safelight)
    expect(cssSrc).toMatch(/animation: [^;]*?-\d+(\.\d+)?s /);
    expect(cssSrc).toContain("backwards");
  });
});

describe("watch page wiring (source gates)", () => {
  it("renders ImageDevelopMotion for images with the real polled progress + stage", () => {
    expect(watchSrc).toContain("ImageDevelopMotion");
    expect(watchSrc).toContain("progress={progress}");
    expect(watchSrc).toContain("stageText={stageText}");
    // progress still comes from the real backend mapping, not a fake
    expect(watchSrc).toContain("progressForStage(data.stage, data.status)");
  });

  it("keeps the video branch on its existing showpiece", () => {
    expect(watchSrc).toContain("BurgerGrill");
    expect(watchSrc).toContain("burgerFrameForStage(data?.stage)");
  });

  it("keeps the transparency fields (elapsed wait + queue position)", () => {
    expect(watchSrc).toContain("formatElapsed");
    expect(watchSrc).toContain("in the queue");
    expect(watchSrc).toContain("queue_position");
  });
});
