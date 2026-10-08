/**
 * Poster Studio — Batch A template expansion validity tests (WS2a).
 *
 * Guards: every BATCH_A template has the required fields, a valid aspect
 * ratio, at least two palettes, unique ids (also across the base catalog),
 * a matching thumbnail file on disk, sane text-length limits, and the
 * prompt composer produces a non-empty valid prompt string.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { POSTER_CATEGORIES } from "@/data/poster-templates/templates";
import { BATCH_A } from "@/data/poster-templates/batch-a";
import { composePosterPrompt } from "@/lib/posters/compose";

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

const PUBLIC_DIR = join(process.cwd(), "public");

describe("batch-a template expansion", () => {
  it("has exactly 30 templates: 15 Food & Drink + 15 Events", () => {
    expect(BATCH_A).toHaveLength(30);
    expect(BATCH_A.filter((t) => t.category === "Food & Drink")).toHaveLength(15);
    expect(BATCH_A.filter((t) => t.category === "Events")).toHaveLength(15);
  });

  it("has unique ids, also across the base catalog", () => {
    const ids = BATCH_A.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(ORIGINAL_BASE_IDS.has(id), `${id} collides with base catalog`).toBe(false);
    }
  });

  it("every template has required fields and a 4:5 aspect ratio", () => {
    for (const t of BATCH_A) {
      expect(t.id, "id").toMatch(/^[a-z0-9-]+$/);
      expect(t.name.length, `${t.id} name`).toBeGreaterThan(0);
      expect(POSTER_CATEGORIES, `${t.id} category`).toContain(t.category);
      expect(t.aspectRatio, `${t.id} aspect`).toBe("4:5");
      expect(t.thumbnail, `${t.id} thumbnail`).toMatch(
        /^\/pro\/poster-templates\/[a-z0-9-]+\.jpg$/,
      );
      expect(t.thumbnail, `${t.id} thumbnail contains id`).toContain(t.id);
      expect(t.tagline.length, `${t.id} tagline`).toBeGreaterThan(0);
      expect(t.hero.length, `${t.id} hero`).toBeGreaterThan(20);
      expect(t.style.length, `${t.id} style`).toBeGreaterThan(20);
    }
  });

  it("every thumbnail file exists on disk and is within size budget", () => {
    for (const t of BATCH_A) {
      const diskPath = join(PUBLIC_DIR, t.thumbnail);
      expect(existsSync(diskPath), `${t.id} thumbnail on disk`).toBe(true);
      const size = statSync(diskPath).size;
      expect(size, `${t.id} thumbnail size`).toBeGreaterThan(10_000);
      expect(size, `${t.id} thumbnail ≤300KB`).toBeLessThanOrEqual(300 * 1024);
    }
  });

  it("every template has 2-6 fields with sane limits and fitting defaults", () => {
    for (const t of BATCH_A) {
      expect(t.fields.length, `${t.id} field count`).toBeGreaterThanOrEqual(2);
      expect(t.fields.length, `${t.id} field count`).toBeLessThanOrEqual(6);
      const keys = t.fields.map((f) => f.key);
      expect(new Set(keys).size, `${t.id} field keys`).toBe(keys.length);
      for (const f of t.fields) {
        expect(f.maxLength, `${t.id}.${f.key} maxLength`).toBeGreaterThan(0);
        expect(f.maxLength, `${t.id}.${f.key} maxLength`).toBeLessThanOrEqual(80);
        expect(
          f.default.length,
          `${t.id}.${f.key} default fits`,
        ).toBeLessThanOrEqual(f.maxLength);
      }
      const headline = t.fields.find((f) => f.key === "headline");
      expect(headline, `${t.id} has headline`).toBeDefined();
      expect(headline!.default.length, `${t.id} headline ≤22`).toBeLessThanOrEqual(22);
    }
  });

  it("every template has ≥2 palettes with prompt + swatches", () => {
    for (const t of BATCH_A) {
      expect(t.palettes.length, `${t.id} palettes ≥2`).toBeGreaterThanOrEqual(2);
      expect(t.palettes.length, `${t.id} palettes ≤4`).toBeLessThanOrEqual(4);
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

  it("composer produces a non-empty valid prompt for every template", () => {
    for (const t of BATCH_A) {
      const prompt = composePosterPrompt(t, { fields: {} });
      expect(typeof prompt).toBe("string");
      expect(prompt.length, `${t.id} prompt non-empty`).toBeGreaterThan(200);
      // Must contain the palette direction, hero, style, and quoted text.
      expect(prompt, `${t.id} prompt has colors`).toContain(t.palettes[0].prompt);
      expect(prompt, `${t.id} prompt has hero`).toContain(t.hero);
      expect(prompt, `${t.id} prompt has style`).toContain(t.style);
      for (const f of t.fields) {
        expect(prompt, `${t.id} prompt quotes ${f.key}`).toContain(
          `"${f.default}"`,
        );
      }
      expect(prompt, `${t.id} prompt is 4:5`).toContain("4:5");
    }
  });

  it("composer respects a paletteId override", () => {
    for (const t of BATCH_A) {
      const second = t.palettes[1];
      const prompt = composePosterPrompt(t, {
        fields: {},
        paletteId: second.id,
      });
      expect(prompt, `${t.id} palette override`).toContain(second.prompt);
    }
  });
});
