/**
 * Waiting-room gate (2026-10-06): the grill keeps its public API, the
 * remix presets are all real/working (label + style suffix, no dead
 * buttons), and the watch page carries the transparency fields.
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

const grillSrc = readFileSync(join(root, "components", "vilish", "burger-grill.tsx"), "utf8");
const panelSrc = readFileSync(join(root, "components", "vilish", "waiting-panel.tsx"), "utf8");
const watchSrc = readFileSync(join(root, "app", "watch", "[id]", "page.tsx"), "utf8");

describe("burger grill (public API unchanged)", () => {
  it("exports burgerFrameForStage + default BurgerGrill", () => {
    expect(grillSrc).toContain("export function burgerFrameForStage");
    expect(grillSrc).toContain("export default function BurgerGrill");
  });

  it("keeps role=img + aria-label, and no text inside the SVG", () => {
    expect(grillSrc).toContain('role="img"');
    expect(grillSrc).toContain("aria-label=");
    expect(grillSrc).not.toMatch(/<text[\s>]/);
  });

  it("keeps the 4-frame stage mapping", () => {
    expect(grillSrc).toContain('s.includes("plat")');
    expect(grillSrc).toContain('s.includes("cook")');
    expect(grillSrc).toContain("return 3");
    expect(grillSrc).toContain("return 2");
    expect(grillSrc).toContain("return 1");
    expect(grillSrc).toContain("return 0");
  });

  it("keeps the reduced-motion + ambient animation hooks", () => {
    expect(grillSrc).toContain("fg-ambient");
    expect(grillSrc).toContain("fg-ember");
    expect(grillSrc).toContain("fg-animated");
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
    expect(watchSrc).toContain("in the grill queue");
  });

  it("wires remix to /api/free/generate with a /create fallback", () => {
    expect(watchSrc).toContain("/api/free/generate");
    expect(watchSrc).toContain("FREE_CAP_REACHED");
    expect(watchSrc).toContain("/create?prompt=");
  });
});
