/**
 * Poster Studio — template catalog validity tests.
 *
 * Guards: every template has the required fields, a valid aspect ratio,
 * at least one palette, unique ids, well-formed thumbnails, and sane
 * text-length limits (AI models garble long text).
 */
import { describe, expect, it } from "vitest";
import {
  POSTER_CATEGORIES,
  POSTER_TEMPLATES,
  templateById,
  templatesByCategory,
} from "@/data/poster-templates/templates";

describe("poster template catalog", () => {
  it("has the expanded catalog (base 14 + batches A–D = 164 templates)", () => {
    expect(POSTER_TEMPLATES.length).toBeGreaterThanOrEqual(160);
  });

  it("has unique ids", () => {
    const ids = POSTER_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has required fields", () => {
    for (const t of POSTER_TEMPLATES) {
      expect(t.id, "id").toMatch(/^[a-z0-9-]+$/);
      expect(t.name.length, `${t.id} name`).toBeGreaterThan(0);
      expect(POSTER_CATEGORIES, `${t.id} category`).toContain(t.category);
      expect(t.aspectRatio, `${t.id} aspect`).toBe("4:5");
      expect(t.thumbnail, `${t.id} thumbnail`).toMatch(
        /^\/pro\/poster-templates\/[a-z0-9-]+\.jpg$/,
      );
      expect(t.thumbnail).toContain(t.id);
      expect(t.tagline.length, `${t.id} tagline`).toBeGreaterThan(0);
      expect(t.hero.length, `${t.id} hero`).toBeGreaterThan(20);
      expect(t.style.length, `${t.id} style`).toBeGreaterThan(20);
    }
  });

  it("every template has 2-6 fields with sane limits", () => {
    for (const t of POSTER_TEMPLATES) {
      expect(t.fields.length, `${t.id} field count`).toBeGreaterThanOrEqual(2);
      expect(t.fields.length, `${t.id} field count`).toBeLessThanOrEqual(6);
      const keys = t.fields.map((f) => f.key);
      expect(new Set(keys).size, `${t.id} field keys`).toBe(keys.length);
      for (const f of t.fields) {
        expect(f.maxLength, `${t.id}.${f.key} maxLength`).toBeGreaterThan(0);
        expect(f.maxLength, `${t.id}.${f.key} maxLength`).toBeLessThanOrEqual(80);
        expect(f.default.length, `${t.id}.${f.key} default fits`).toBeLessThanOrEqual(
          f.maxLength,
        );
      }
    }
  });

  it("every template has 1-4 palettes with prompt + swatches", () => {
    for (const t of POSTER_TEMPLATES) {
      expect(t.palettes.length, `${t.id} palettes`).toBeGreaterThanOrEqual(1);
      expect(t.palettes.length, `${t.id} palettes`).toBeLessThanOrEqual(4);
      const ids = t.palettes.map((p) => p.id);
      expect(new Set(ids).size, `${t.id} palette ids`).toBe(ids.length);
      for (const p of t.palettes) {
        expect(p.prompt.length, `${t.id}.${p.id} prompt`).toBeGreaterThan(10);
        expect(p.swatches, `${t.id}.${p.id} swatches`).toHaveLength(2);
        for (const s of p.swatches) {
          expect(s, `${t.id}.${p.id} swatch`).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });

  it("covers at least 6 categories", () => {
    const cats = new Set(POSTER_TEMPLATES.map((t) => t.category));
    expect(cats.size).toBeGreaterThanOrEqual(6);
  });

  it("templateById / templatesByCategory work", () => {
    const first = POSTER_TEMPLATES[0];
    expect(templateById(first.id)?.name).toBe(first.name);
    expect(templateById("no-such-template")).toBeUndefined();
    const food = templatesByCategory("Food & Drink");
    expect(food.length).toBeGreaterThan(0);
    expect(food.every((t) => t.category === "Food & Drink")).toBe(true);
  });

  it("no template copies reference-poster content (originality guard)", () => {
    // Spot-check: template names/ids must not contain brand or movie names
    // that appear in scraped poster designs.
    const banned = /nike|mcdonald|starbucks|coca|pepsi|netflix|disney|marvel/i;
    for (const t of POSTER_TEMPLATES) {
      expect(t.name, `${t.id} name`).not.toMatch(banned);
      expect(t.id, `${t.id} id`).not.toMatch(banned);
      expect(t.hero, `${t.id} hero`).not.toMatch(banned);
    }
  });
});
