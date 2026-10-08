/**
 * Waiting-room gate (2026-10-08): professional copy (no grill metaphors),
 * CreationProgress showpiece with a stable public API; the remix presets
 * are all real/working (label + style suffix, no dead buttons), and the
 * watch page carries the transparency fields.
 *
 * Follows the repo's file-content gate pattern (platform-depth.test.ts):
 * .tsx components are asserted via source, pure logic via imports.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

const progressSrc = readFileSync(join(root, "components", "vilish", "creation-progress.tsx"), "utf8");
const panelSrc = readFileSync(join(root, "components", "vilish", "waiting-panel.tsx"), "utf8");
const watchSrc = readFileSync(join(root, "app", "watch", "[id]", "page.tsx"), "utf8");

describe("creation progress showpiece (public API)", () => {
  it("exports phaseForStage + default CreationProgress", () => {
    expect(progressSrc).toContain("export function phaseForStage");
    expect(progressSrc).toContain("export default function CreationProgress");
  });

  it("keeps role=img + aria-label for accessibility", () => {
    expect(progressSrc).toContain('role="img"');
    expect(progressSrc).toContain("aria-label=");
  });

  it("keeps the 4-phase stage mapping (0-3)", () => {
    expect(progressSrc).toContain("return 3");
    expect(progressSrc).toContain("return 2");
    expect(progressSrc).toContain("return 1");
    expect(progressSrc).toContain("return 0");
  });

  it("keeps the reduced-motion hooks", () => {
    expect(progressSrc).toContain("motion-reduce:animate-none");
    const css = readFileSync(join(root, "app", "globals.css"), "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("fg-sheen");
  });

  it("is theme-aware (no hardcoded dark colors)", () => {
    expect(progressSrc).not.toContain("#080808");
    expect(progressSrc).toContain("var(--pro-");
  });
});

describe("no grill metaphors in waiting-room copy", () => {
  it("watch page copy is professional", () => {
    const lower = watchSrc.toLowerCase();
    expect(lower).not.toContain("on the grill");
    expect(lower).not.toContain("grill queue");
    expect(lower).not.toContain("grill flared");
    expect(lower).not.toContain("flipping the patty");
    expect(lower).not.toContain("seasoning the pixels");
    expect(watchSrc).toContain("in the queue");
  });

  it("waiting panel tip is professional", () => {
    expect(panelSrc.toLowerCase()).not.toContain("grill queue");
    expect(panelSrc).toContain("in the queue");
  });
});

describe("remix presets (no dead buttons)", () => {
  it("declares 4-6 presets, each with a real label and style suffix", () => {
    const labels = [...panelSrc.matchAll(/\{\s*label:\s*"([^"]+)",\s*suffix:\s*"([^"]+)"\s*\}/g)];
    expect(labels.length).toBeGreaterThanOrEqual(4);
    expect(labels.length).toBeLessThanOrEqual(6);
    const seen = new Set<string>();
    for (const [, label, suffix] of labels) {
      expect(label.trim().length).toBeGreaterThan(0);
      expect(suffix.trim().length).toBeGreaterThan(0);
      expect(seen.has(label)).toBe(false);
      seen.add(label);
    }
  });

  it("wires every preset button to the remix handler", () => {
    expect(panelSrc).toContain("onRemix(p.suffix)");
    expect(panelSrc).toContain("REMIX_PRESETS.map");
  });
});

describe("watch page transparency wiring", () => {
  it("renders the two-panel waiting room with the side panel", () => {
    expect(watchSrc).toContain("WaitingPanel");
    expect(watchSrc).toContain("lg:grid-cols-[1fr_340px]");
  });

  it("shows elapsed time and queue position from the status fields", () => {
    expect(watchSrc).toContain("created_at");
    expect(watchSrc).toContain("queue_position");
    expect(watchSrc).toContain("formatElapsed");
    expect(watchSrc).toContain("in the queue");
  });

  it("wires remix to /api/free/generate with a /create fallback", () => {
    expect(watchSrc).toContain("/api/free/generate");
    expect(watchSrc).toContain("FREE_CAP_REACHED");
    expect(watchSrc).toContain("/create?prompt=");
  });
});
