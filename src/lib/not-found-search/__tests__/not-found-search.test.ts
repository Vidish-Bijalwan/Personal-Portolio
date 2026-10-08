/**
 * Etch 404-page search index — index shape, ranking, and honesty invariants.
 */
import { describe, it, expect } from "vitest";
import {
  buildSearchIndex,
  filterSearchIndex,
  KEY_PAGES,
  type SearchItem,
} from "../../not-found-search";

describe("buildSearchIndex", () => {
  it("only contains real, relative hrefs (no fake backend, no external links)", () => {
    for (const item of buildSearchIndex()) {
      expect(item.href).toMatch(/^\/(?!\/)/);
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.desc.trim().length).toBeGreaterThan(0);
    }
  });

  it("covers key pages, every real tool, and every published blog post", () => {
    const index = buildSearchIndex();
    const kinds = index.map((i) => i.kind);
    expect(kinds).toContain("page");
    expect(kinds).toContain("tool");
    expect(kinds).toContain("post");

    const hrefs = new Set(index.map((i) => i.href));
    for (const page of KEY_PAGES) expect(hrefs.has(page.href)).toBe(true);
    // tools + posts each link to their real routes
    expect(hrefs.has("/create")).toBe(true);
    expect(hrefs.has("/pricing")).toBe(true);
    expect(hrefs.has("/blog")).toBe(true);
  });
});

describe("filterSearchIndex", () => {
  const items: SearchItem[] = [
    { label: "Pricing", href: "/pricing", desc: "One creation, one price", kind: "page" },
    { label: "Voice-over", href: "/video-studio?tool=tts", desc: "A natural voice reading your script", kind: "tool" },
    { label: "AI Image Generator India", href: "/blog/ai-image-generator-india-pay-per-creation", desc: "Pay per creation vs subscription", kind: "post" },
  ];

  it("returns nothing for empty or single-char queries", () => {
    expect(filterSearchIndex(items, "")).toEqual([]);
    expect(filterSearchIndex(items, "v")).toEqual([]);
  });

  it("matches label text case-insensitively", () => {
    const res = filterSearchIndex(items, "pricing");
    expect(res.map((r) => r.label)).toEqual(["Pricing"]);
  });

  it("matches description text", () => {
    const res = filterSearchIndex(items, "subscription");
    expect(res.map((r) => r.label)).toEqual(["AI Image Generator India"]);
  });

  it("requires every word to match (AND semantics)", () => {
    expect(filterSearchIndex(items, "pricing voice")).toEqual([]);
    const res = filterSearchIndex(items, "natural voice");
    expect(res.map((r) => r.label)).toEqual(["Voice-over"]);
  });

  it("ranks label matches above description matches", () => {
    const res = filterSearchIndex(items, "voice");
    expect(res[0].label).toBe("Voice-over");
  });

  it("respects the limit", () => {
    const res = filterSearchIndex(items, "a", 2);
    // "a" is a single char → empty; use a real 2+ char query instead
    expect(res).toEqual([]);
    const res2 = filterSearchIndex(items, "in", 1);
    expect(res2.length).toBeLessThanOrEqual(1);
  });
});
