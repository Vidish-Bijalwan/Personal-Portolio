import { describe, expect, it } from "vitest";
import {
  getConcepts,
  getPalettes,
  getTypography,
  getLayouts,
  parseConceptsFile,
  parsePalettesFile,
  parseTypographyFile,
  parseLayoutsFile,
  matchConcepts,
  buildFinalPrompt,
  conceptService,
  paletteByName,
  typographyByName,
  layoutByName,
  type Concept,
} from "@/lib/ads/concepts";

/**
 * Ad Studio concept bank: loader integrity, graceful fallback,
 * matching, prompt composition and /create service mapping.
 */

describe("concept bank loaders", () => {
  it("loads the full real bank (105 concepts, 31 palettes, 26 typography, 20 layouts)", () => {
    expect(getConcepts()).toHaveLength(105);
    expect(getPalettes()).toHaveLength(31);
    expect(getTypography()).toHaveLength(26);
    expect(getLayouts()).toHaveLength(20);
  });

  it("yields only valid concept records (id, name, prompt template, media)", () => {
    for (const c of getConcepts()) {
      expect(c.id.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.prompt_template.length).toBeGreaterThan(0);
      expect(["image", "video"]).toContain(c.media);
    }
    const ids = getConcepts().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate ids
  });

  it("every concept template carries a {product} placeholder", () => {
    for (const c of getConcepts()) {
      expect(c.prompt_template).toContain("{product}");
    }
  });

  it("exposes the 18 researcher categories and 10 video concepts", () => {
    const cats = new Set(getConcepts().map((c) => c.category));
    expect(cats.size).toBe(18);
    expect(getConcepts().filter((c) => c.media === "video")).toHaveLength(10);
  });

  it("palettes carry hex color arrays; layouts carry eye paths", () => {
    for (const p of getPalettes()) {
      expect(p.colors.length).toBeGreaterThanOrEqual(4);
      for (const col of p.colors) expect(col).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
    for (const l of getLayouts()) {
      expect(l.eye_path.length).toBeGreaterThan(0);
    }
  });
});

describe("loader fallback (missing/corrupt data)", () => {
  it("parseConceptsFile returns [] for null, garbage, wrong shapes", () => {
    expect(parseConceptsFile(null)).toEqual([]);
    expect(parseConceptsFile(undefined)).toEqual([]);
    expect(parseConceptsFile("nope")).toEqual([]);
    expect(parseConceptsFile({})).toEqual([]);
    expect(parseConceptsFile({ concepts: "not-an-array" })).toEqual([]);
    expect(parseConceptsFile({ concepts: [{ id: 1 }, null, "x"] })).toEqual([]);
  });

  it("parseConceptsFile keeps valid records and drops invalid ones", () => {
    const good = {
      id: "ok",
      name: "OK",
      category: "studio",
      description: "d",
      prompt_template: "shot of {product}",
      best_for: "b",
      media: "image",
      source: "s",
    };
    const out = parseConceptsFile({ concepts: [good, { id: "bad" }] });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("ok");
  });

  it("parseConceptsFile dedupes by id", () => {
    const rec = {
      id: "dup",
      name: "D",
      category: "c",
      description: "d",
      prompt_template: "p {product}",
      best_for: "b",
      media: "image",
      source: "s",
    };
    expect(parseConceptsFile({ concepts: [rec, rec] })).toHaveLength(1);
  });

  it("palette/typography/layout parsers degrade to [] on bad input", () => {
    expect(parsePalettesFile(null)).toEqual([]);
    expect(parsePalettesFile({ palettes: [{ name: "x" }] })).toEqual([]);
    expect(parseTypographyFile(null)).toEqual([]);
    expect(parseTypographyFile({ pairings: [{ name: "x" }] })).toEqual([]);
    expect(parseLayoutsFile(null)).toEqual([]);
    expect(parseLayoutsFile({ layouts: [{ name: "x" }] })).toEqual([]);
  });
});

describe("matchConcepts", () => {
  it("filters by media", () => {
    const video = matchConcepts("", "video");
    expect(video).toHaveLength(10);
    expect(video.every((c) => c.media === "video")).toBe(true);
    const image = matchConcepts("", "image");
    expect(image).toHaveLength(95);
  });

  it("matches a vertical keyword against category/best_for/description", () => {
    const food = matchConcepts("food", "image");
    expect(food.length).toBeGreaterThan(0);
    expect(
      food.every(
        (c) =>
          c.category.includes("food") ||
          c.best_for.toLowerCase().includes("food") ||
          c.description.toLowerCase().includes("food")
      )
    ).toBe(true);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(matchConcepts("  FESTIVE ", "image").length).toBe(
      matchConcepts("festive", "image").length
    );
  });

  it("returns [] for a vertical that matches nothing", () => {
    expect(matchConcepts("zzz-no-such-vertical", "image")).toEqual([]);
  });
});

describe("buildFinalPrompt", () => {
  const concept: Concept = {
    id: "t",
    name: "T",
    category: "studio",
    description: "d",
    prompt_template: "Studio shot of {product}, soft light",
    best_for: "b",
    media: "image",
    source: "s",
  };

  it("replaces {product} with the product text", () => {
    const out = buildFinalPrompt(concept, "handmade ceramic mug");
    expect(out).toContain("handmade ceramic mug");
    expect(out).not.toContain("{product}");
  });

  it("appends palette mood+colors, typography style, layout eye-path tokens", () => {
    const palettes = getPalettes();
    const typos = getTypography();
    const layouts = getLayouts();
    const out = buildFinalPrompt(
      concept,
      "soap bar",
      palettes[0].name,
      typos[0].name,
      layouts[0].name
    );
    expect(out).toContain(palettes[0].mood || palettes[0].name);
    expect(out).toContain(palettes[0].colors[0]);
    expect(out).toContain(typos[0].headline);
    expect(out).toContain(layouts[0].eye_path);
  });

  it("silently skips unknown option names", () => {
    const out = buildFinalPrompt(concept, "mug", "nope", "nope", "nope");
    // The assembled ad prompt leads verbatim; the prompt bank appends
    // cinema-grade craft after it.
    expect(out.startsWith("Studio shot of mug, soft light")).toBe(true);
    expect(out).toContain("ultra-detailed");
  });

  it("freeform path: builds a prompt from the product when concept is null", () => {
    const palettes = getPalettes();
    const out = buildFinalPrompt(null, "handmade ceramic mug", palettes[0].name);
    expect(out).toContain("handmade ceramic mug");
    expect(out).toContain("advertising photograph");
    expect(out).toContain(palettes[0].mood || palettes[0].name);
  });

  it("returns '' for null concept AND empty product", () => {
    expect(buildFinalPrompt(null, "   ")).toBe("");
    expect(buildFinalPrompt(undefined, "")).toBe("");
  });

  it("lookups return null for unknown names", () => {
    expect(paletteByName("zzz")).toBeNull();
    expect(typographyByName("zzz")).toBeNull();
    expect(layoutByName("zzz")).toBeNull();
  });
});

describe("conceptService", () => {
  it("maps image concepts to a real composer service id", () => {
    const c = getConcepts().find((x) => x.media === "image")!;
    expect(["single-image", "product-photo"]).toContain(conceptService(c));
  });

  it("returns null for video concepts (they deep-link via media=video)", () => {
    const v = getConcepts().find((x) => x.media === "video")!;
    expect(conceptService(v)).toBeNull();
  });
});

describe("concept card art (QA round: unique thumbnails)", () => {
  it("every concept id maps to a unique thumbnail file present on disk", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const art = (
      await import("@/data/ad-concepts/concept-art.json")
    ).default as Record<string, string>;
    const concepts = getConcepts();
    expect(concepts.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const c of concepts) {
      const rel = art[c.id];
      expect(rel, `concept ${c.id} has card art`).toBeTruthy();
      expect(seen.has(rel), `duplicate art file ${rel}`).toBe(false);
      seen.add(rel);
      const abs = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "public",
        "pro",
        rel
      );
      expect(fs.existsSync(abs), `art file exists: ${rel}`).toBe(true);
      expect(fs.statSync(abs).size, `${rel} non-trivial`).toBeGreaterThan(10_000);
    }
  });
});
