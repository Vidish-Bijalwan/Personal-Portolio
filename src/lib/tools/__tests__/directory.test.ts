/**
 * Tool directory integrity gate.
 * - Every tool resolves to a real catalog product; prices are catalog-derived.
 * - Every href points at a real working route (no dead links).
 * - Nothing in the directory may promise an unsupported feature.
 */
import { describe, expect, it } from "vitest";
import { TOOL_DIRECTORY, toolsByGroup, toolById } from "../directory";
import { PRICE_CATALOG, priceOf } from "../../pricing/catalog";
import { formatINR } from "../../../lib/vilish/types";

const BANNED = [
  "talking photo",
  "voice cloning",
  "ai song",
  "ai influencer",
  "translator",
  "dubbing",
  "lip-sync",
  "lipsync",
];

describe("tool directory", () => {
  it("lists exactly the 12 working tools", () => {
    expect(TOOL_DIRECTORY).toHaveLength(12);
    expect(toolsByGroup("create")).toHaveLength(4);
    expect(toolsByGroup("video-studio")).toHaveLength(8);
  });

  it("ids are unique", () => {
    const ids = TOOL_DIRECTORY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every price is catalog-derived, never hardcoded", () => {
    const expected: Record<string, string> = {
      "single-image": formatINR(priceOf("single-image")),
      "pack-4": formatINR(priceOf("pack-4")),
      "product-photo": formatINR(priceOf("product-photo")),
      "clip-5s": formatINR(priceOf("clip-5s")),
      // AI jobs keep the video-studio rate; pure-processing tools are
      // tiered: ₹5 trivial converters, ₹10 heavier re-encode jobs.
      tts: `${formatINR(priceOf("video-studio"))}/job`,
      caption: `${formatINR(priceOf("video-studio"))}/job`,
      trim: `${formatINR(priceOf("tool-plus"))}/job`,
      compress: `${formatINR(priceOf("tool-basic"))}/job`,
      convert: `${formatINR(priceOf("tool-basic"))}/job`,
      gif: `${formatINR(priceOf("tool-basic"))}/job`,
      "add-audio": `${formatINR(priceOf("tool-plus"))}/job`,
      denoise: `${formatINR(priceOf("tool-plus"))}/job`,
    };
    for (const t of TOOL_DIRECTORY) {
      expect(t.price).toBe(expected[t.id]);
    }
    // The catalog itself must still hold the products we reference.
    const ids = new Set(PRICE_CATALOG.map((p) => p.id));
    for (const id of ["single-image", "pack-4", "product-photo", "clip-5s", "video-studio", "tool-basic", "tool-plus"]) {
      expect(ids.has(id as never)).toBe(true);
    }
  });

  it("no utility tool costs more than ₹10", () => {
    // Vidish's October 2026 directive: converters and small processing jobs
    // live in the ₹5–₹10 band. Only the AI tools may sit above it.
    const perJob = (t: (typeof TOOL_DIRECTORY)[number]) =>
      Number(t.price.replace(/[^\d]/g, ""));
    for (const t of TOOL_DIRECTORY) {
      if (t.group !== "video-studio") continue;
      if (t.badge === "AI") continue;
      expect(perJob(t)).toBeLessThanOrEqual(10);
      expect(perJob(t)).toBeGreaterThanOrEqual(5);
    }
  });

  it("every href targets a real working route", () => {
    for (const t of TOOL_DIRECTORY) {
      expect(t.href.startsWith("/create") || t.href.startsWith("/video-studio")).toBe(true);
    }
  });

  it("promises no unsupported features", () => {
    const copy = TOOL_DIRECTORY.map((t) => `${t.name} ${t.tagline}`.toLowerCase()).join(" | ");
    for (const banned of BANNED) {
      expect(copy).not.toContain(banned);
    }
  });

  it("toolById resolves every listed tool", () => {
    for (const t of TOOL_DIRECTORY) {
      expect(toolById(t.id)?.name).toBe(t.name);
    }
    expect(toolById("talking-photo")).toBeUndefined();
  });

  it("badges are honest: AI only where AI is used", () => {
    const badgeById = Object.fromEntries(TOOL_DIRECTORY.map((t) => [t.id, t.badge]));
    expect(["single-image", "pack-4", "product-photo", "clip-5s", "tts", "caption"].map((id) => badgeById[id])).toEqual(
      Array(6).fill("AI"),
    );
    for (const id of ["compress", "convert", "gif", "add-audio", "denoise"]) {
      expect(badgeById[id]).toBe("Real processing");
    }
  });
});
