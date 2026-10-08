/**
 * Poster Studio — Batch B template catalog validity tests (coder WS2b).
 *
 * Guards for the 45 batch-B templates: unique ids (also vs. the base
 * catalog), thumbnails present on disk, required fields, ≥2 palettes,
 * 4:5 aspect ratio, headline length discipline, and a valid composed
 * generation prompt per template.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BATCH_B } from "@/data/poster-templates/batch-b";
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

const PUBLIC_DIR = path.join(process.cwd(), "public");

describe("poster template catalog — batch B", () => {
  it("has 45 templates: 15 Sale, 15 Fashion, 15 Fitness", () => {
    expect(BATCH_B).toHaveLength(45);
    for (const category of ["Sale", "Fashion", "Fitness"] as const) {
      expect(
        BATCH_B.filter((t) => t.category === category),
        `category ${category}`,
      ).toHaveLength(15);
    }
  });

  it("has unique ids with no collisions against the base catalog", () => {
    const ids = BATCH_B.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(ORIGINAL_BASE_IDS.has(id), `collision with base catalog: ${id}`).toBe(false);
    }
  });

  it("every template has required fields and 4:5 aspect ratio", () => {
    for (const t of BATCH_B) {
      expect(t.id, "id").toMatch(/^[a-z0-9-]+$/);
      expect(t.name.length, `${t.id} name`).toBeGreaterThan(0);
      expect(t.aspectRatio, `${t.id} aspect`).toBe("4:5");
      expect(t.thumbnail, `${t.id} thumbnail`).toMatch(
        /^\/pro\/poster-templates\/[a-z0-9-]+\.jpg$/,
      );
      expect(t.thumbnail, `${t.id} thumbnail matches id`).toContain(t.id);
      expect(t.tagline.length, `${t.id} tagline`).toBeGreaterThan(0);
      expect(t.hero.length, `${t.id} hero`).toBeGreaterThan(20);
      expect(t.style.length, `${t.id} style`).toBeGreaterThan(20);
    }
  });

  it("thumbnail file exists on disk for every template", () => {
    for (const t of BATCH_B) {
      const onDisk = path.join(PUBLIC_DIR, t.thumbnail.replace(/^\//, ""));
      expect(
        fs.existsSync(onDisk),
        `${t.id} thumbnail missing: ${t.thumbnail}`,
      ).toBe(true);
      const stat = fs.statSync(onDisk);
      expect(stat.size, `${t.id} thumbnail non-empty`).toBeGreaterThan(0);
      expect(stat.size, `${t.id} thumbnail <= 300KB`).toBeLessThanOrEqual(
        300 * 1024,
      );
    }
  });

  it("every template has 2-6 fields with sane limits and short headlines", () => {
    for (const t of BATCH_B) {
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
      const headline = t.fields.find((f) => f.key === "headline");
      expect(headline, `${t.id} has headline field`).toBeDefined();
      expect(headline!.default.length, `${t.id} headline <= 22 chars`).toBeLessThanOrEqual(
        22,
      );
    }
  });

  it("every template has 2-4 palettes with prompt + swatches", () => {
    for (const t of BATCH_B) {
      expect(t.palettes.length, `${t.id} palettes >= 2`).toBeGreaterThanOrEqual(2);
      expect(t.palettes.length, `${t.id} palettes <= 4`).toBeLessThanOrEqual(4);
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

  it("composer yields a non-empty valid prompt for every template", () => {
    for (const t of BATCH_B) {
      const prompt = composePosterPrompt(t, { fields: {} });
      expect(typeof prompt, `${t.id} prompt type`).toBe("string");
      expect(prompt.length, `${t.id} prompt non-empty`).toBeGreaterThan(100);
      expect(prompt, `${t.id} prompt mentions 4:5`).toContain("4:5");
      const headline = t.fields.find((f) => f.key === "headline")!;
      expect(prompt, `${t.id} prompt quotes headline`).toContain(
        `"${headline.default}"`,
      );
      expect(prompt, `${t.id} prompt includes palette direction`).toContain(
        t.palettes[0].prompt,
      );
      expect(prompt, `${t.id} prompt includes hero`).toContain(t.hero);
      // Explicit overrides flow through the composer
      const custom = composePosterPrompt(t, {
        fields: { headline: "CUSTOM LINE" },
        paletteId: t.palettes[1]?.id,
      });
      expect(custom, `${t.id} custom headline`).toContain('"CUSTOM LINE"');
    }
  });

  it("no template copies reference-poster content (originality guard)", () => {
    const banned = /nike|mcdonald|starbucks|coca|pepsi|netflix|disney|marvel/i;
    for (const t of BATCH_B) {
      expect(t.name, `${t.id} name`).not.toMatch(banned);
      expect(t.id, `${t.id} id`).not.toMatch(banned);
      expect(t.hero, `${t.id} hero`).not.toMatch(banned);
      expect(t.tagline, `${t.id} tagline`).not.toMatch(banned);
    }
  });
});
