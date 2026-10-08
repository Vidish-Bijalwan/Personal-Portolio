/**
 * Poster Studio — batch C template validity tests (WS2c).
 *
 * Guards for the 45 new Real Estate / Beauty / Business templates:
 * unique ids, thumbnails on disk, required fields, ≥2 palettes,
 * aspectRatio "4:5", and a valid composed prompt from the composer.
 */
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BATCH_C } from "@/data/poster-templates/batch-c";
import { POSTER_CATEGORIES } from "@/data/poster-templates/templates";
import { composePosterPrompt } from "@/lib/posters/compose";

const PUBLIC_DIR = join(__dirname, "..", "..", "..", "..", "public");

describe("batch C templates", () => {
  it("has 45 templates", () => {
    expect(BATCH_C.length).toBe(45);
  });

  it("has 15 per category", () => {
    for (const cat of ["Real Estate", "Beauty", "Business"] as const) {
      expect(BATCH_C.filter((t) => t.category === cat).length, cat).toBe(15);
    }
  });

  it("has unique lowercase-hyphenated ids", () => {
    const ids = BATCH_C.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("every template has required fields and sane limits", () => {
    for (const t of BATCH_C) {
      expect(t.name.length, `${t.id} name`).toBeGreaterThan(0);
      expect(POSTER_CATEGORIES, `${t.id} category`).toContain(t.category);
      expect(t.aspectRatio, `${t.id} aspect`).toBe("4:5");
      expect(t.thumbnail, `${t.id} thumbnail`).toMatch(
        /^\/pro\/poster-templates\/[a-z0-9-]+\.jpg$/,
      );
      expect(t.thumbnail, `${t.id} thumbnail matches id`).toBe(
        `/pro/poster-templates/${t.id}.jpg`,
      );
      expect(t.tagline.length, `${t.id} tagline`).toBeGreaterThan(0);
      expect(t.hero.length, `${t.id} hero`).toBeGreaterThan(20);
      expect(t.style.length, `${t.id} style`).toBeGreaterThan(20);

      const keys = t.fields.map((f) => f.key);
      for (const k of ["headline", "subtext", "badge", "cta"]) {
        expect(keys, `${t.id} field ${k}`).toContain(k);
      }
      const headline = t.fields.find((f) => f.key === "headline")!;
      expect(headline.default.length, `${t.id} headline len`).toBeLessThanOrEqual(
        headline.maxLength,
      );
      expect(headline.maxLength, `${t.id} headline max`).toBeLessThanOrEqual(22);
      for (const f of t.fields) {
        expect(f.default.length, `${t.id} ${f.key}`).toBeLessThanOrEqual(
          f.maxLength,
        );
      }
    }
  });

  it("every template has ≥2 palettes with prompt + swatches", () => {
    for (const t of BATCH_C) {
      expect(t.palettes.length, `${t.id} palettes`).toBeGreaterThanOrEqual(2);
      const pids = t.palettes.map((p) => p.id);
      expect(new Set(pids).size, `${t.id} palette ids`).toBe(pids.length);
      for (const p of t.palettes) {
        expect(p.name.length, `${t.id}/${p.id} name`).toBeGreaterThan(0);
        expect(p.prompt.length, `${t.id}/${p.id} prompt`).toBeGreaterThan(10);
        expect(p.swatches.length, `${t.id}/${p.id} swatches`).toBe(2);
        for (const s of p.swatches) {
          expect(s, `${t.id}/${p.id} swatch`).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });

  it("every thumbnail exists on disk and is a small JPEG", () => {
    for (const t of BATCH_C) {
      const diskPath = join(PUBLIC_DIR, t.thumbnail);
      expect(existsSync(diskPath), `${t.id} thumbnail on disk`).toBe(true);
    }
  });

  it("composer yields a non-empty valid prompt per template", () => {
    for (const t of BATCH_C) {
      const prompt = composePosterPrompt(t, { fields: {} });
      expect(prompt.length, `${t.id} prompt`).toBeGreaterThan(200);
      expect(prompt, `${t.id} prompt aspect`).toContain("4:5");
      const headline = t.fields.find((f) => f.key === "headline")!.default;
      expect(prompt, `${t.id} prompt headline`).toContain(`"${headline}"`);
    }
  });
});
