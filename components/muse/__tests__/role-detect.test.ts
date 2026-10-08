/**
 * Madam Muse — role-detect heuristics (CONTRACTS.md §5/§6).
 * Pure helpers run DOM-free in the node test env; detectRoles degrades
 * gracefully without a browser (dims 0, filename heuristics only).
 */
import { describe, expect, it } from "vitest";
import {
  classifyOrientation,
  detectRoles,
  extractPaletteFromPixels,
  kindOfMime,
  suggestRole,
  textHintForName,
} from "../../../src/lib/muse/role-detect";

/** Build an RGBA fixture: three solid vertical color blocks. */
function threeBlockFixture(): { data: Uint8ClampedArray; width: number; height: number } {
  const width = 60;
  const height = 30;
  const data = new Uint8ClampedArray(width * height * 4);
  const blocks: Array<[number, number, number]> = [
    [255, 0, 0], // red
    [0, 255, 0], // green
    [0, 0, 255], // blue
  ];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const block = Math.floor((x / width) * 3);
      const [r, g, b] = blocks[block];
      const o = (y * width + x) * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = 255;
    }
  }
  return { data, width, height };
}

describe("extractPaletteFromPixels", () => {
  it("finds the three solid fixture colors", () => {
    const { data, width, height } = threeBlockFixture();
    const palette = extractPaletteFromPixels(data, width, height, 5);
    expect(palette).toHaveLength(3);
    expect(new Set(palette)).toEqual(new Set(["#ff0000", "#00ff00", "#0000ff"]));
  });

  it("returns [] for empty input", () => {
    expect(extractPaletteFromPixels(new Uint8ClampedArray(0), 0, 0)).toEqual([]);
  });

  it("skips transparent pixels", () => {
    const { width, height } = threeBlockFixture();
    const data = new Uint8ClampedArray(width * height * 4); // all alpha 0
    expect(extractPaletteFromPixels(data, width, height)).toEqual([]);
  });

  it("caps at maxColors", () => {
    const { data, width, height } = threeBlockFixture();
    expect(extractPaletteFromPixels(data, width, height, 2)).toHaveLength(2);
  });
});

describe("classifyOrientation", () => {
  it("landscape / portrait / square", () => {
    expect(classifyOrientation(800, 600)).toBe("landscape");
    expect(classifyOrientation(600, 800)).toBe("portrait");
    expect(classifyOrientation(500, 500)).toBe("square");
  });

  it("treats unknown dims as square", () => {
    expect(classifyOrientation(0, 0)).toBe("square");
  });

  it("needs a clear margin (near-square is square)", () => {
    expect(classifyOrientation(100, 104)).toBe("square");
    expect(classifyOrientation(100, 120)).toBe("portrait");
  });
});

describe("kindOfMime", () => {
  it("distinguishes video from image", () => {
    expect(kindOfMime("video/mp4")).toBe("video");
    expect(kindOfMime("image/png")).toBe("image");
    expect(kindOfMime("")).toBe("image");
  });
});

describe("textHintForName", () => {
  it("flags text-suggestive filenames only", () => {
    expect(textHintForName("logo-final.png")).toBe(true);
    expect(textHintForName("event-poster.jpg")).toBe(true);
    expect(textHintForName("product-photo.jpg")).toBe(false);
    expect(textHintForName("clip.mp4")).toBe(false);
  });
});

describe("suggestRole", () => {
  it("treats video as subject footage", () => {
    expect(suggestRole({ name: "clip.mp4", type: "video/mp4" }, 0).role).toBe("subject");
  });

  it("uses filename hints", () => {
    expect(suggestRole({ name: "brand-palette.png", type: "image/png" }, 2).role).toBe("palette");
    expect(suggestRole({ name: "paper-texture.jpg", type: "image/jpeg" }, 1).role).toBe("texture");
    expect(suggestRole({ name: "launch-poster.jpg", type: "image/jpeg" }, 0).role).toBe("typography");
  });

  it("falls back positionally with modest confidence", () => {
    const first = suggestRole({ name: "a.jpg", type: "image/jpeg" }, 0);
    expect(first.role).toBe("subject");
    expect(first.roleConfidence).toBeLessThanOrEqual(0.55);
    expect(suggestRole({ name: "b.jpg", type: "image/jpeg" }, 1).role).toBe("style");
    expect(suggestRole({ name: "c.jpg", type: "image/jpeg" }, 4).role).toBe("mood");
  });
});

describe("detectRoles (no-DOM graceful path)", () => {
  it("maps a video file to kind video without a browser", async () => {
    const f = new File([], "footage.mp4", { type: "video/mp4" });
    const [ref] = await detectRoles([f]);
    expect(ref.kind).toBe("video");
    expect(ref.role).toBe("subject");
    expect(ref.id).toBe("ref_01");
    expect(ref.roleUserOverride).toBe(false);
    expect(ref.width).toBe(0); // no DOM → dims unknown, not guessed
  });

  it("maps image files with positional ids and heuristic roles", async () => {
    const files = [
      new File([], "watch.jpg", { type: "image/jpeg" }),
      new File([], "swatch-palette.png", { type: "image/png" }),
    ];
    const refs = await detectRoles(files);
    expect(refs).toHaveLength(2);
    expect(refs[0].id).toBe("ref_01");
    expect(refs[1].id).toBe("ref_02");
    expect(refs[0].kind).toBe("image");
    expect(refs[1].role).toBe("palette");
    expect(refs.every((r) => r.roleConfidence >= 0 && r.roleConfidence <= 1)).toBe(true);
  });
});
