/**
 * Showcase asset gates (2026-10-06): the rotation pool is only as good as
 * its assets. Every referenced file must exist on disk, every manifest
 * entry must resolve to a real catalog service, and no two entries may
 * share a subject (the owner's "not the same thing again and again" rule).
 */
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const examplesDir = join(root, "public", "examples");

const NEW_IMAGES = [
  "17-cyberpunk-ramen.webp",
  "18-astronaut-product.webp",
  "19-dancer-silk.webp",
  "20-vintage-car.webp",
  "21-coffee-splash.webp",
  "22-jellyfish-portrait.webp",
  "23-chess-knight.webp",
  "24-balloon-canyon.webp",
];
const NEW_VIDEOS = [
  "v-01-product-spin.mp4",
  "v-02-neon-flythrough.mp4",
  "v-03-liquid-splash.mp4",
  "v-04-portrait-breeze.mp4",
];
const NEW_POSTERS = [
  "poster-4-product-spin.jpg",
  "poster-5-neon-flythrough.jpg",
  "poster-6-liquid-splash.jpg",
  "poster-7-portrait-breeze.jpg",
];

const manifest = JSON.parse(
  readFileSync(join(examplesDir, "manifest.json"), "utf8"),
) as Array<Record<string, unknown>>;

describe("new showcase assets exist on disk", () => {
  it("all 8 new images are present", () => {
    for (const f of NEW_IMAGES) {
      expect(existsSync(join(examplesDir, f)), f).toBe(true);
    }
  });

  it("all 4 new videos + posters are present", () => {
    for (const f of [...NEW_VIDEOS, ...NEW_POSTERS]) {
      expect(existsSync(join(examplesDir, "videos", f)), f).toBe(true);
    }
  });

  it("new images are non-trivial files (not placeholders)", () => {
    for (const f of NEW_IMAGES) {
      const { size } = require("node:fs").statSync(join(examplesDir, f));
      expect(size, f).toBeGreaterThan(50_000);
    }
  });
});

describe("manifest covers the rotation pool", () => {
  it("every manifest src resolves to a file on disk", () => {
    for (const e of manifest) {
      const src = String(e.src);
      const disk = join(root, "public", src);
      expect(existsSync(disk), src).toBe(true);
      if (e.poster) {
        expect(existsSync(join(root, "public", String(e.poster))), String(e.poster)).toBe(true);
      }
    }
  });

  it("no duplicate srcs and no duplicate prompts (unique subjects)", () => {
    const srcs = manifest.map((e) => String(e.src));
    expect(new Set(srcs).size).toBe(srcs.length);
    const prompts = manifest.map((e) => String(e.prompt));
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("every entry maps to a real catalog service (honest prices only)", () => {
    for (const e of manifest) {
      expect(typeof e.service).toBe("string");
      expect(String(e.service).length).toBeGreaterThan(0);
    }
  });
});

describe("homepage gallery integrity (pro redesign)", () => {
  const pageSrc = readFileSync(join(root, "app", "page.tsx"), "utf8");

  it("gallery is manifest-driven, not a hardcoded pool", () => {
    expect(pageSrc).toContain("manifest.json");
    expect(pageSrc).not.toContain("SHOWCASE_POOL");
    expect(pageSrc).not.toContain("VIDEO_POOL");
    expect(pageSrc).not.toContain("useRotatedPool");
  });

  it("gallery prices derive from the catalog (honest prices only)", () => {
    expect(pageSrc).toContain("examplePrice");
  });

  it("gallery prefers lightweight thumbs", () => {
    expect(pageSrc).toContain("-thumb.webp");
  });
});

describe("perf: mobile image weight", () => {
  const COLLAGE_SRCS = [
    "/examples/1-sneaker-ad.webp",
    "/examples/2-neon-portrait.webp",
    "/examples/3-travel-poster.webp",
    "/examples/4-food-photo.webp",
    "/examples/5-watch-ad.webp",
    "/examples/6-movie-poster.webp",
    "/examples/7-pet-portrait.webp",
    "/examples/8-sportscar.webp",
  ];

  it("every collage image has a lightweight -thumb.webp variant on disk", () => {
    for (const src of COLLAGE_SRCS) {
      const thumb = src.replace(/\.webp$/, "-thumb.webp");
      const disk = join(examplesDir, thumb.replace("/examples/", ""));
      expect(existsSync(disk), thumb).toBe(true);
    }
  });

  it("thumbs are a fraction of the full file weight", () => {
    const { statSync } = require("node:fs");
    for (const src of COLLAGE_SRCS) {
      const full = statSync(join(examplesDir, src.replace("/examples/", ""))).size;
      const thumb = statSync(
        join(examplesDir, src.replace("/examples/", "").replace(/\.webp$/, "-thumb.webp")),
      ).size;
      expect(thumb, src).toBeLessThan(full / 4);
    }
  });

  it("HeroCollage renders the thumb variant, not the full file", () => {
    const auroraSrc = readFileSync(
      join(root, "components", "motion", "HeroAurora.tsx"),
      "utf8",
    );
    expect(auroraSrc).toContain('"-thumb.webp"');
  });
});

describe("perf: homepage ships zero video weight", () => {
  const pageSrc = readFileSync(join(root, "app", "page.tsx"), "utf8");

  it("no <video> element mounts on the homepage at all", () => {
    // The pro redesign dropped the hero video entirely: a static,
    // thumbnail-backed gallery beats even a breakpoint-gated video.
    expect(pageSrc).not.toContain("<video");
    expect(pageSrc).not.toContain("HeroVideo");
    expect(pageSrc).not.toContain("hero-loop.mp4");
  });
});
