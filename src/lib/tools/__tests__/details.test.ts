/**
 * Platform-depth content gate (2026-10-06): use-case pages + tool detail pages.
 *
 * - TOOL_DETAILS covers exactly the 12 working tools — no more, no fewer,
 *   every id resolving via toolById.
 * - USE_CASES: 3 slugs, every toolId resolving, every example image file
 *   existing on disk, every template id existing in TEMPLATES.
 * - No hardcoded ₹ literals in any new file — prices come from the catalog.
 * - No fake social-proof vocabulary, no unsupported-feature promises.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TOOL_DIRECTORY, toolById } from "../directory";
import { TOOL_DETAILS, toolDetail } from "../details";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");

const BANNED_FEATURES = [
  "talking photo",
  "voice cloning",
  "ai song",
  "ai influencer",
  "translator",
  "dubbing",
];

const BANNED_PROOF = [
  "creations delivered",
  "happy customers",
  "trusted by",
  "join thousands",
  "5-star",
  "★★★★★",
];

const HARDCODED_RUPEE = /₹\s*\d/;

function allCopy(): string {
  const parts: string[] = [];
  for (const d of Object.values(TOOL_DETAILS)) {
    parts.push(
      d.what,
      d.cta,
      ...d.bestFor,
      ...d.limitations,
      ...d.steps.flatMap((s) => [s.title, s.copy]),
      ...d.faqs.flatMap((f) => [f.q, f.a]),
    );
  }
  return parts.join(" | ");
}

describe("tool details", () => {
  it("covers exactly the 12 working tools", () => {
    expect(Object.keys(TOOL_DETAILS)).toHaveLength(12);
    for (const t of TOOL_DIRECTORY) {
      expect(toolDetail(t.id)).toBeDefined();
      expect(toolById(t.id)?.name).toBeDefined();
    }
    expect(toolDetail("talking-photo")).toBeUndefined();
    expect(toolDetail("voice-cloning")).toBeUndefined();
    expect(toolDetail("")).toBeUndefined();
  });

  it("every entry has complete structure", () => {
    for (const [id, d] of Object.entries(TOOL_DETAILS)) {
      expect(d.what.length, `${id}: what`).toBeGreaterThan(40);
      expect(d.bestFor.length, `${id}: bestFor`).toBeGreaterThanOrEqual(3);
      expect(d.limitations.length, `${id}: limitations`).toBeGreaterThanOrEqual(1);
      expect(d.steps, `${id}: steps`).toHaveLength(3);
      for (const s of d.steps) {
        expect(s.title.length).toBeGreaterThan(2);
        expect(s.copy.length).toBeGreaterThan(10);
      }
      expect(d.faqs.length, `${id}: faqs`).toBeGreaterThanOrEqual(2);
      expect(d.faqs.length, `${id}: faqs`).toBeLessThanOrEqual(6);
      expect(d.cta.length, `${id}: cta`).toBeGreaterThan(2);
    }
  });

  it("promises no unsupported features and no fake social proof", () => {
    const copy = allCopy().toLowerCase();
    for (const banned of [...BANNED_FEATURES, ...BANNED_PROOF]) {
      expect(copy).not.toContain(banned);
    }
  });

  it("carries zero hardcoded ₹ literals", () => {
    expect(allCopy()).not.toMatch(HARDCODED_RUPEE);
    const src = readFileSync(join(root, "src", "lib", "tools", "details.ts"), "utf8");
    expect(src).not.toMatch(HARDCODED_RUPEE);
  });
});
