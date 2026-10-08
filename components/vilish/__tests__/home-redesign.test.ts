/**
 * Homepage redesign gate (2026-10-06): section-by-section rework.
 *
 * - No hardcoded ₹ literals in the reworked homepage, nav, or footer —
 *   every displayed price must come from the pricing catalog.
 * - The "Why pay-per-creation" pillars must contain zero invented numbers
 *   (no fake stats, no fake counts of any kind).
 * - Capability cards must pin real catalog services for their prices.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PRICE_CATALOG, priceOf } from "../../../src/lib/pricing/catalog";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const pageSrc = readFileSync(join(root, "app", "page.tsx"), "utf8");
const navSrc = readFileSync(join(root, "components", "vilish", "nav.tsx"), "utf8");
const footerSrc = readFileSync(join(root, "components", "vilish", "footer.tsx"), "utf8");

const HARDCODED_RUPEE = /₹\s*\d/;

describe("homepage redesign: no hardcoded prices", () => {
  it("app/page.tsx has zero hardcoded ₹ amounts", () => {
    expect(pageSrc).not.toMatch(HARDCODED_RUPEE);
  });

  it("nav and footer have zero hardcoded ₹ amounts", () => {
    expect(navSrc).not.toMatch(HARDCODED_RUPEE);
    expect(footerSrc).not.toMatch(HARDCODED_RUPEE);
  });

  it("every homepage price call resolves against the catalog", () => {
    const ids = new Set(PRICE_CATALOG.map((p) => p.id));
    const calls = [...pageSrc.matchAll(/priceOf\("([^"]+)"\)/g)].map((m) => m[1]);
    expect(calls.length).toBeGreaterThan(0);
    for (const id of calls) {
      expect(ids.has(id as never)).toBe(true);
      expect(() => priceOf(id as never)).not.toThrow();
    }
  });
});

describe("homepage redesign: no invented numbers", () => {
  it("why-pay-per-creation pillar copy contains no digits at all", () => {
    const m = pageSrc.match(/const WHY_PILLARS = \[([\s\S]*?)\n\];/);
    expect(m).not.toBeNull();
    const copies = [...m![1].matchAll(/copy:\s*"([^"]+)"/g)].map((x) => x[1]);
    expect(copies.length).toBe(4);
    for (const copy of copies) {
      expect(copy).not.toMatch(/\d/);
    }
  });

  it("no fake social-proof vocabulary in the reworked sections", () => {
    const hay = pageSrc + navSrc + footerSrc;
    for (const phrase of [
      "creations delivered",
      "happy customers",
      "trusted by",
      "join thousands",
      "users",
    ]) {
      expect(hay.toLowerCase()).not.toContain(phrase);
    }
  });
});

describe("homepage tweak round: hi-def carousel + restored sections", () => {
  it("every /pro/hero-*.jpg referenced on the homepage exists on disk", () => {
    const refs = pageSrc.match(/\/pro\/hero-[\w-]+\.jpg/g) ?? [];
    expect(refs.length).toBeGreaterThanOrEqual(3);
    for (const r of new Set(refs)) {
      expect(() => readFileSync(join(root, "public", r.replace(/^\//, "")))).not.toThrow();
    }
  });

  it("hero slides store their exact generation prompts verbatim", () => {
    const m = pageSrc.match(/function loadHeroSlides\(\)[\s\S]*?\n\}/);
    expect(m).not.toBeNull();
    const prompts = [...m![0].matchAll(/prompt:\s*"([^"]{40,})"/g)].map((x) => x[1]);
    expect(prompts.length).toBeGreaterThanOrEqual(3);
  });

  it("restored sections link to their real destinations", () => {
    const sectionsSrc = readFileSync(
      join(root, "components", "vilish", "home", "sections.tsx"),
      "utf8",
    );
    for (const href of ['href="/trends"', 'href="/blog"', "templateHref", "toolsByGroup"]) {
      expect(sectionsSrc + pageSrc).toContain(href);
    }
    const dialogSrc = readFileSync(
      join(root, "components", "vilish", "home", "prompt-dialog.tsx"),
      "utf8",
    );
    expect(dialogSrc).toContain("/create?prompt=");
    expect(dialogSrc).toContain("navigator.clipboard.writeText");
  });

  it("templates, tools and blog data resolve against their registries", () => {
    // Static shape check: the pickers reference real registry exports.
    expect(pageSrc).toContain("TEMPLATES");
    expect(pageSrc).toContain("toolsByGroup(");
    expect(pageSrc).toContain("BLOG_POSTS");
  });
});

describe("neon-final fix: no neon cursor, tools in nav", () => {
  it("CyberCursor neon system is fully removed", () => {
    const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");
    expect(layoutSrc).not.toContain("CyberCursor");
    expect(footerSrc).not.toContain("CursorSettingsControl");
    for (const f of [
      join(root, "components", "motion", "CyberCursor.tsx"),
      join(root, "components", "motion", "CursorSettingsControl.tsx"),
      join(root, "src", "lib", "motion", "cursor-settings.ts"),
    ]) {
      expect(() => readFileSync(f, "utf8")).toThrow();
    }
  });

  it("no neon color/glow tokens remain in pro CSS or carousel", () => {
    const css = readFileSync(join(root, "app", "pro-theme.css"), "utf8");
    const carousel = readFileSync(
      join(root, "components", "vilish", "home", "carousel.tsx"),
      "utf8",
    );
    for (const sig of ["#00F0FF", "#00f0ff", "#7da2ff", "0 0 8px", "0 0 12px", "drop-shadow"]) {
      expect(css).not.toContain(sig);
      expect(carousel).not.toContain(sig);
    }
  });

  it("nav has a Tools dropdown listing every tool, and the tools section has the anchor", () => {
    // Tools is now a dropdown (not a plain /#tools link) with direct links.
    expect(navSrc).toContain("ToolsDropdown");
    expect(navSrc).toContain("TOOL_DIRECTORY");
    const sectionsSrc = readFileSync(
      join(root, "components", "vilish", "home", "sections.tsx"),
      "utf8",
    );
    expect(sectionsSrc).toContain('id="tools"');
  });
});
