/**
 * Poster Studio — Batch D template validity tests (WS2d).
 *
 * Guards: 30 templates (15 Travel + 15 Education), unique ids (including
 * against the original catalog), thumbnails present on disk, required
 * fields, >=2 palettes, aspectRatio 4:5, and a non-empty valid prompt from
 * the composer for every template.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { composePosterPrompt } from "@/lib/posters/compose";
import { BATCH_D } from "@/data/poster-templates/batch-d";

/** The 14 original templates that shipped before the expansion batches. */
const ORIGINAL_BASE_IDS = new Set([
  "food-burger-blast",
  "food-cafe-morning",
  "food-bakery-sweet",
  "event-music-night",
  "event-dj-rave",
  "event-grand-opening",
  "sale-mega-discount",
  "fashion-new-drop",
  "realestate-modern-villa",
  "fitness-gym-beast",
  "beauty-salon-glow",
  "business-agency-pro",
  "travel-wanderlust",
  "edu-masterclass",
]);

const PUBLIC_DIR = join(process.cwd(), "public", "pro", "poster-templates");

describe("batch-d templates", () => {
  it("has exactly 30 templates: 15 Travel + 15 Education", () => {
    expect(BATCH_D.length).toBe(30);
    expect(BATCH_D.filter((t) => t.category === "Travel").length).toBe(15);
    expect(BATCH_D.filter((t) => t.category === "Education").length).toBe(15);
  });

  it("has unique ids, also disjoint from the original catalog", () => {
    const ids = BATCH_D.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of BATCH_D) {
      expect(t.id, "id format").toMatch(/^[a-z0-9-]+$/);
      expect(
        ORIGINAL_BASE_IDS.has(t.id),
        `${t.id} collides with catalog`,
      ).toBe(false);
      expect(t.thumbnail, `${t.id} thumbnail path`).toBe(
        `/pro/poster-templates/${t.id}.jpg`,
      );
    }
  });

  it("every thumbnail exists on disk and is a sane JPEG", () => {
    for (const t of BATCH_D) {
      const disk = join(PUBLIC_DIR, `${t.id}.jpg`);
      expect(existsSync(disk), `${t.id} thumbnail missing`).toBe(true);
      const size = statSync(disk).size;
      expect(size, `${t.id} size > 0`).toBeGreaterThan(0);
      expect(size, `${t.id} size <= 300KB`).toBeLessThanOrEqual(300 * 1024);
    }
  });

  it("every template has required fields and 2-6 fields with sane limits", () => {
    for (const t of BATCH_D) {
      expect(t.name.length, `${t.id} name`).toBeGreaterThan(0);
      expect(t.aspectRatio, `${t.id} aspect`).toBe("4:5");
      expect(t.tagline.length, `${t.id} tagline`).toBeGreaterThan(0);
      expect(t.hero.length, `${t.id} hero`).toBeGreaterThan(20);
      expect(t.style.length, `${t.id} style`).toBeGreaterThan(20);
      expect(t.fields.length, `${t.id} field count`).toBeGreaterThanOrEqual(2);
      expect(t.fields.length, `${t.id} field count`).toBeLessThanOrEqual(6);
      const keys = t.fields.map((f) => f.key);
      expect(new Set(keys).size, `${t.id} field keys`).toBe(keys.length);
      const headline = t.fields.find((f) => f.key === "headline");
      expect(headline, `${t.id} headline`).toBeDefined();
      expect(headline!.default.length, `${t.id} headline <=22`).toBeLessThanOrEqual(22);
      for (const f of t.fields) {
        expect(f.maxLength, `${t.id}.${f.key} maxLength`).toBeGreaterThan(0);
        expect(f.default.length, `${t.id}.${f.key} default fits`).toBeLessThanOrEqual(
          f.maxLength,
        );
      }
    }
  });

  it("every template has >=2 palettes with prompt-ready color direction + swatches", () => {
    for (const t of BATCH_D) {
      expect(t.palettes.length, `${t.id} palettes`).toBeGreaterThanOrEqual(2);
      expect(t.palettes.length, `${t.id} palettes`).toBeLessThanOrEqual(4);
      const ids = t.palettes.map((p) => p.id);
      expect(new Set(ids).size, `${t.id} palette ids`).toBe(ids.length);
      for (const p of t.palettes) {
        expect(p.name.length, `${t.id}.${p.id} name`).toBeGreaterThan(0);
        expect(p.prompt.length, `${t.id}.${p.id} prompt`).toBeGreaterThan(10);
        expect(p.swatches, `${t.id}.${p.id} swatches`).toHaveLength(2);
        for (const s of p.swatches) {
          expect(s, `${t.id}.${p.id} swatch`).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });

  it("composer yields a non-empty valid prompt for every template", () => {
    for (const t of BATCH_D) {
      const prompt = composePosterPrompt(t, { fields: {} });
      expect(prompt.length, `${t.id} prompt non-empty`).toBeGreaterThan(100);
      expect(prompt, `${t.id} prompt mentions 4:5`).toContain("4:5");
      const headline = t.fields.find((f) => f.key === "headline")!.default;
      expect(prompt, `${t.id} prompt quotes headline`).toContain(headline);
      expect(prompt, `${t.id} prompt has palette direction`).toContain(
        t.palettes[0].prompt,
      );
      expect(prompt, `${t.id} prompt has hero`).toContain(t.hero);
      const alt = composePosterPrompt(t, {
        fields: {},
        paletteId: t.palettes[1].id,
      });
      expect(alt, `${t.id} alt-palette prompt differs`).toContain(
        t.palettes[1].prompt,
      );
    }
  });

  it("no template copies reference-poster content (originality guard)", () => {
    const banned = /nike|mcdonald|starbucks|coca|pepsi|netflix|disney|marvel/i;
    for (const t of BATCH_D) {
      expect(t.name, `${t.id} name`).not.toMatch(banned);
      expect(t.id, `${t.id} id`).not.toMatch(banned);
      expect(t.hero, `${t.id} hero`).not.toMatch(banned);
    }
  });
});
