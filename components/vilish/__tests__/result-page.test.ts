/**
 * Result-page enrichment gate (2026-10-06): after a generation completes,
 * the watch page must offer working actions (download preview, remix
 * variations, new creation), an honest creation-details card, and a
 * "More from the grill" strip — no dead controls, no fake urgency.
 *
 * Follows the repo's file-content gate pattern (waiting-room.test.ts):
 * .tsx components are asserted via source, pure logic via imports.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

const watchSrc = readFileSync(join(root, "app", "watch", "[id]", "page.tsx"), "utf8");
const panelSrc = readFileSync(join(root, "components", "vilish", "result-panel.tsx"), "utf8");
const statusSrc = readFileSync(
  join(root, "app", "api", "gen", "[id]", "status", "route.ts"),
  "utf8"
);

describe("status API — result details fields", () => {
  it("returns aspect_ratio and finished_at for the details card", () => {
    expect(statusSrc).toContain("aspect_ratio: gen.aspectRatio");
    expect(statusSrc).toContain("finished_at: finishedAt");
  });

  it("derives finished_at from the row's updated_at (no invented timestamps)", () => {
    expect(statusSrc).toContain("gen.updatedAt");
  });
});

describe("watch page done state — every control works", () => {
  it("keeps the unlock CTA primary with the honest disclaimer", () => {
    expect(watchSrc).toContain("Unlock clean HD —");
    expect(watchSrc).toContain("This is a preview, not a finished order");
  });

  it("download preview is a real link to the preview endpoint with a download attr", () => {
    expect(watchSrc).toContain("Download preview");
    expect(watchSrc).toContain("href={previewUrl}");
    expect(watchSrc).toMatch(/download=\{isVideo \? "etch-preview\.mp4" : "etch-preview\.jpg"\}/);
  });

  it("new creation deep-links to the composer (video-aware)", () => {
    expect(watchSrc).toContain("New creation");
    expect(watchSrc).toContain('"/create?media=video"');
  });

  it("remix variations render 4 working preset buttons wired to handleRemix", () => {
    expect(watchSrc).toContain("Remix variations");
    expect(watchSrc).toContain("REMIX_PRESETS.slice(0, 4)");
    expect(watchSrc).toContain("onClick={() => void handleRemix(p.suffix)}");
    // images only — the free tier rejects video remixes
    expect(watchSrc).toContain("{!isVideo && (");
  });

  it("renders the creation-details panel with live status fields", () => {
    expect(watchSrc).toContain("<ResultPanel");
    expect(watchSrc).toContain("prompt={data.prompt}");
    expect(watchSrc).toContain("insight={data.prompt_insight}");
    expect(watchSrc).toContain("aspectRatio={data.aspect_ratio}");
    expect(watchSrc).toContain("finishedAt={data.finished_at}");
  });

  it("shows the gallery strip in both done states (no dead-end voids)", () => {
    const hits = watchSrc.match(/<MoreFromGrill \/>/g) ?? [];
    expect(hits.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the video done-state working (no remix, download still wired)", () => {
    // the shared done+locked section branches on isVideo throughout
    expect(watchSrc).toContain("isVideo ?");
  });
});

describe("result panel — honest details, honest gallery", () => {
  it("exports ResultPanel and MoreFromGrill", () => {
    expect(panelSrc).toContain("export function ResultPanel");
    expect(panelSrc).toContain("export function MoreFromGrill");
  });

  it("details card shows prompt, insight chips, aspect ratio, finished time", () => {
    expect(panelSrc).toContain("Your prompt");
    expect(panelSrc).toContain("DetailChip");
    expect(panelSrc).toContain("ASPECT_LABELS");
    expect(panelSrc).toContain("formatFinished");
  });

  it("gallery loads the real examples manifest and guards every item", () => {
    expect(panelSrc).toContain('fetch("/examples/manifest.json"');
    expect(panelSrc).toContain("isExampleItem(cand)");
  });

  it("gallery prices derive from the catalog — zero hardcoded ₹ literals", () => {
    expect(panelSrc).toContain("examplePrice(item)");
    expect(panelSrc).not.toMatch(/₹\d/);
  });

  it("gallery cards link somewhere real (/examples), never a dead card", () => {
    expect(panelSrc).toContain('href="/examples"');
  });

  it("renders nothing rather than a broken strip when the manifest fails", () => {
    expect(panelSrc).toContain("if (items.length === 0) return null;");
  });

  it("contains no fake-urgency or fake-scarcity phrasing", () => {
    const banned = /hurry|only \d+ left|limited time|act now|ending soon|don't miss out/i;
    expect(panelSrc).not.toMatch(banned);
    expect(watchSrc).not.toMatch(banned);
  });

  it("respects prefers-reduced-motion on the gallery hover motion", () => {
    expect(panelSrc).toContain("motion-reduce:");
  });

  it("gallery images are lazy and labelled for screen readers", () => {
    expect(panelSrc).toContain('loading="lazy"');
    expect(panelSrc).toContain("alt={");
  });
});
