/**
 * Examples thumbnail regression gate (2026-10-08).
 *
 * Root cause of the "Keep creating" rail's black/broken video thumbnails:
 * the rail rendered <img src={item.src}> for every entry, but category
 * "video" entries carry an .mp4 src — an <img> pointing at a video file
 * never decodes. The fix: exampleThumbSrc() (poster for videos) + the
 * isExampleItem guard now REJECTS video entries without a poster, so a
 * poster-less video can never reach a card grid again.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleThumbSrc, isExampleItem, type ExampleItem } from "../examples";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const publicDir = join(root, "public");

function loadManifest(): unknown[] {
  return JSON.parse(
    readFileSync(join(publicDir, "examples", "manifest.json"), "utf8"),
  );
}

describe("video thumbnails never break the rail", () => {
  it("exampleThumbSrc uses the poster for video items, src otherwise", () => {
    expect(
      exampleThumbSrc({
        category: "video",
        src: "/examples/videos/clip-1-portrait.mp4",
        poster: "/examples/videos/poster-1-portrait.jpg",
      }),
    ).toBe("/examples/videos/poster-1-portrait.jpg");
    expect(
      exampleThumbSrc({
        category: "image",
        src: "/examples/2-neon-portrait.webp",
      }),
    ).toBe("/examples/2-neon-portrait.webp");
    // never returns an mp4 for a grid <img>
    for (const item of loadManifest().filter(isExampleItem)) {
      expect(exampleThumbSrc(item)).not.toMatch(/\.mp4$/i);
    }
  });

  it("isExampleItem rejects video entries without a poster", () => {
    expect(
      isExampleItem({
        src: "/examples/videos/clip-1-portrait.mp4",
        prompt: "x",
        service: "clip-5s",
        model: "5s clip",
        category: "video",
      }),
    ).toBe(false);
    // non-video entries are unaffected by the poster rule
    expect(
      isExampleItem({
        src: "/examples/2-neon-portrait.webp",
        prompt: "x",
        service: "single-image",
        model: "Studio quality",
        category: "image",
      }),
    ).toBe(true);
  });

  it("the 'Keep creating' rail renders the thumbnail helper, not raw src", () => {
    const panelSrc = readFileSync(
      join(root, "components", "vilish", "result-panel.tsx"),
      "utf8",
    );
    expect(panelSrc).toContain("exampleThumbSrc");
    expect(panelSrc).toContain("src={exampleThumbSrc(item)}");
    // the rail must not pass the raw (possibly .mp4) src into an <img>
    const code = panelSrc
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "");
    expect(code).not.toMatch(/<img[^>]*src=\{item\.src\}/);
  });
});

describe("manifest thumbnail assets exist on disk", () => {
  it("every entry passes the guard and its thumb source resolves to a real file", () => {
    type ThumbItem = Pick<ExampleItem, "src" | "category" | "poster">;
    const items = loadManifest().filter((r): r is ThumbItem => isExampleItem(r));
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const thumb = exampleThumbSrc(item);
      expect(
        existsSync(join(publicDir, thumb)),
        `missing thumbnail file: ${thumb}`,
      ).toBe(true);
    }
  });

  it("every manifest video entry ships a poster that exists on disk", () => {
    const videos = loadManifest().filter(
      (r): r is { category: string; poster?: string } =>
        typeof r === "object" && r !== null && (r as { category: string }).category === "video",
    );
    expect(videos.length).toBeGreaterThan(0);
    for (const v of videos) {
      expect(typeof v.poster).toBe("string");
      expect(
        existsSync(join(publicDir, v.poster as string)),
        `missing poster file: ${v.poster}`,
      ).toBe(true);
    }
  });
});
