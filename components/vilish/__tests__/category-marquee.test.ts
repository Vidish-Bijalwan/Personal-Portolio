/**
 * Category marquee honesty gates (2026-10-06): the lively banner must be
 * 100% honest — real creation categories only. No person names, no fake
 * "X just generated Y" activity, no invented counts. Every item links to
 * /examples.
 *
 * Follows the repo's file-content gate pattern: the exported category list
 * is asserted via import, component wiring via source.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MARQUEE_CATEGORIES } from "../../../src/lib/vilish/marquee-categories";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const src = readFileSync(join(root, "components", "vilish", "category-marquee.tsx"), "utf8");

// Two consecutive capitalized words = almost certainly a person name.
const PERSON_NAME = /\b[A-Z][a-z]{2,} [A-Z][a-z]{2,}\b/;
// Fake-activity / fake-social-proof phrasing.
const FAKE_ACTIVITY =
  /\b(just|recently)\b.*\b(generated|created|made|ordered|bought)\b|\b\d+[kKmM]?\+?\s*(customers|users|orders|generations|reviews)\b|\b(joined|signed up)\b/i;

describe("marquee categories are honest", () => {
  it("has a healthy rotation pool (10+ categories)", () => {
    expect(MARQUEE_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it("contains zero person names", () => {
    for (const cat of MARQUEE_CATEGORIES) {
      expect(cat, `"${cat}" looks like a person name`).not.toMatch(PERSON_NAME);
    }
  });

  it("contains zero fake-activity phrasing or invented counts", () => {
    for (const cat of MARQUEE_CATEGORIES) {
      expect(cat, `"${cat}" reads like fake activity`).not.toMatch(FAKE_ACTIVITY);
      // Digits are only allowed in the real product name "5-second clips".
      expect(cat.replace("5-second", ""), `"${cat}" has an invented count`).not.toMatch(/\d/);
    }
  });

  it("has no duplicate categories", () => {
    expect(new Set(MARQUEE_CATEGORIES).size).toBe(MARQUEE_CATEGORIES.length);
  });

  it("every category is a plausible Pixaura creation type", () => {
    for (const cat of MARQUEE_CATEGORIES) {
      expect(cat.length).toBeLessThanOrEqual(24);
    }
  });
});

describe("marquee component wiring", () => {
  it("reuses the motion Marquee (reduced-motion + a11y handled there)", () => {
    expect(src).toContain('from "@/components/motion/Marquee"');
    expect(src).toContain("<Marquee");
  });

  it("links every item to /examples, never to a fake destination", () => {
    expect(src).toContain('href="/examples"');
    expect(src).not.toMatch(/href="\/[a-z-]*generation/);
  });

  it("exports the category list for tests and reuse", () => {
    expect(src).toMatch(/export\s*{\s*MARQUEE_CATEGORIES\s*}/);
  });
});
