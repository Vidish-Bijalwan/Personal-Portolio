/**
 * Catalog-wide validation: every one of the ~164 Poster Studio templates
 * (base + batches A–D) must be fully functional — unique ids, thumbnails on
 * disk, required fields, and a valid composed prompt for every template
 * (with default fields and with every palette).
 */
import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  POSTER_TEMPLATES,
  POSTER_CATEGORIES,
  templateById,
  templatesByCategory,
  type PosterTemplate,
} from "@/data/poster-templates/templates";
import { composePosterPrompt } from "@/lib/posters/compose";

const THUMB_DIR = join(process.cwd(), "public/pro/poster-templates");

function assertTemplateShape(t: PosterTemplate) {
  expect(t.id, "id").toMatch(/^[a-z0-9-]+$/);
  expect(t.name?.length, `${t.id} name`).toBeGreaterThan(0);
  expect(POSTER_CATEGORIES, `${t.id} category`).toContain(t.category);
  expect(t.aspectRatio, `${t.id} aspectRatio`).toBe("4:5");
  expect(t.thumbnail, `${t.id} thumbnail`).toMatch(
    /^\/pro\/poster-templates\/[a-z0-9-]+\.jpg$/,
  );
  expect(t.tagline?.length, `${t.id} tagline`).toBeGreaterThan(0);
  expect(t.fields.length, `${t.id} fields`).toBeGreaterThanOrEqual(2);
  for (const f of t.fields) {
    expect(f.key?.length, `${t.id} field key`).toBeGreaterThan(0);
    expect(f.label?.length, `${t.id} field label`).toBeGreaterThan(0);
    expect(f.default?.length, `${t.id} field default`).toBeGreaterThan(0);
    expect(
      f.default.length,
      `${t.id} field ${f.key} within maxLength`,
    ).toBeLessThanOrEqual(f.maxLength);
  }
  expect(t.palettes.length, `${t.id} palettes`).toBeGreaterThanOrEqual(2);
  for (const p of t.palettes) {
    expect(p.id?.length, `${t.id} palette id`).toBeGreaterThan(0);
    expect(p.prompt?.length, `${t.id} palette prompt`).toBeGreaterThan(0);
    expect(p.swatches, `${t.id} palette swatches`).toHaveLength(2);
  }
  expect(t.hero?.length, `${t.id} hero`).toBeGreaterThan(0);
  expect(t.style?.length, `${t.id} style`).toBeGreaterThan(0);
}

describe("poster catalog (all templates)", () => {
  it("has ~165 templates across all 10 categories", () => {
    expect(POSTER_TEMPLATES.length).toBeGreaterThanOrEqual(160);
    for (const c of POSTER_CATEGORIES) {
      expect(
        templatesByCategory(c).length,
        `category ${c}`,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it("has unique ids", () => {
    const ids = POSTER_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has a valid shape", () => {
    for (const t of POSTER_TEMPLATES) assertTemplateShape(t);
  });

  it("every template has a thumbnail on disk (≤300KB)", () => {
    for (const t of POSTER_TEMPLATES) {
      const rel = t.thumbnail.replace(/^\//, "");
      const p = join(process.cwd(), "public", rel);
      expect(existsSync(p), `${t.id} thumbnail ${t.thumbnail}`).toBe(true);
      const size = statSync(p).size;
      expect(size, `${t.id} thumbnail size`).toBeLessThanOrEqual(300 * 1024);
      expect(size, `${t.id} thumbnail non-empty`).toBeGreaterThan(10 * 1024);
    }
  });

  it("composer produces a valid prompt for EVERY template (default fields)", () => {
    for (const t of POSTER_TEMPLATES) {
      const prompt = composePosterPrompt(t, { fields: {} });
      expect(prompt.length, `${t.id} prompt non-empty`).toBeGreaterThan(200);
      expect(prompt, `${t.id} prompt mentions 4:5`).toContain("4:5");
      const headline = t.fields.find((f) => f.key === "headline")?.default;
      if (headline) expect(prompt, `${t.id} prompt quotes headline`).toContain(headline);
    }
  });

  it("composer produces a valid prompt for EVERY template × EVERY palette", () => {
    for (const t of POSTER_TEMPLATES) {
      for (const p of t.palettes) {
        const prompt = composePosterPrompt(t, {
          fields: {},
          paletteId: p.id,
        });
        expect(prompt.length, `${t.id}/${p.id} prompt non-empty`).toBeGreaterThan(200);
        expect(prompt, `${t.id}/${p.id} prompt uses palette`).toContain(p.prompt);
      }
    }
  });

  it("templateById resolves every template", () => {
    for (const t of POSTER_TEMPLATES) {
      expect(templateById(t.id)?.id, `templateById(${t.id})`).toBe(t.id);
    }
  });
});
