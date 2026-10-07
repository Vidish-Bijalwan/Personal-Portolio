/**
 * WS4 — SEO metadata routes quality gate.
 *
 * Asserts that the Next.js metadata routes (app/robots.ts, app/sitemap.ts)
 * generate valid, white-hat output:
 * - robots.txt: allows all crawlers on public paths, disallows /api/* and
 *   /admin/*, and references the sitemap URL.
 * - sitemap.xml data: every URL is absolute, well-formed, under the canonical
 *   site, unique, and contains no /api or /admin URLs (real routes only).
 */
import { describe, it, expect } from "vitest";
import robots from "../../../app/robots";
import sitemap from "../../../app/sitemap";
import { BLOG_POSTS } from "@/lib/blog";
import { TOOL_DIRECTORY } from "@/lib/tools/directory";
import { USE_CASES } from "@/lib/usecases/usecases";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

describe("robots()", () => {
  it("allows all crawlers and blocks /api/* and /admin/*", () => {
    const out = robots();
    expect(out.rules).toEqual([
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ]);
  });

  it("references the sitemap URL", () => {
    const out = robots();
    expect(out.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("sitemap()", () => {
  it("covers every public surface: static routes + tools + use-cases + blog posts", () => {
    const entries = sitemap();
    // 12 static routes + 12 tools + 3 use-cases + 10 blog posts
    expect(entries).toHaveLength(12 + 12 + 3 + 10);
    expect(entries).toHaveLength(
      12 + TOOL_DIRECTORY.length + USE_CASES.length + BLOG_POSTS.length
    );
  });

  it("emits only absolute, well-formed, unique URLs under the canonical site", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length); // unique
    for (const url of urls) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(() => new URL(url)).not.toThrow(); // well-formed
      expect(url).not.toMatch(/\s/);
      expect(url).not.toContain("/api/");
      expect(url).not.toContain("/admin/");
    }
  });

  it("includes the homepage, section pages, and representative deep links", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/create`);
    expect(urls).toContain(`${SITE_URL}/ads`);
    expect(urls).toContain(`${SITE_URL}/pricing`);
    expect(urls).toContain(`${SITE_URL}/blog`);
    expect(urls).toContain(`${SITE_URL}/tools`);
    expect(urls).toContain(`${SITE_URL}/trends`);
    expect(urls).toContain(`${SITE_URL}/for-sellers`);
    expect(urls).toContain(`${SITE_URL}/for-creators`);
    expect(urls).toContain(`${SITE_URL}/for-marketers`);
    // every tool id and blog slug resolves to a listed URL
    for (const t of TOOL_DIRECTORY) {
      expect(urls).toContain(`${SITE_URL}/tools/${t.id}`);
    }
    for (const post of BLOG_POSTS) {
      expect(urls).toContain(`${SITE_URL}/blog/${post.slug}`);
    }
  });

  it("emits valid lastModified dates", () => {
    for (const entry of sitemap()) {
      const lm = entry.lastModified;
      expect(lm).toBeDefined();
      expect(new Date(lm as string | number | Date).getTime()).not.toBeNaN();
    }
  });
});
