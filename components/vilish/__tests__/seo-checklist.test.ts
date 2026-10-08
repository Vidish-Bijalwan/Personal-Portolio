/**
 * Etch — SEO + conversion checklist guards.
 *
 * File-content tests for the 2026-10-07 SEO pass: every assertion reads the
 * source tree (like brand.test.ts) so regressions fail fast without a browser.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../..", import.meta.url).pathname.replace(/\/$/, "");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

function pngSize(p: string): { w: number; h: number } {
  const buf = readFileSync(join(ROOT, p));
  // PNG signature + IHDR chunk: width/height are big-endian u32 at 16/20.
  expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

describe("og social image", () => {
  it("public/og-image.png exists at exactly 1200x630", () => {
    expect(existsSync(join(ROOT, "public/og-image.png"))).toBe(true);
    expect(pngSize("public/og-image.png")).toEqual({ w: 1200, h: 630 });
  });

  it("root layout wires the og image into openGraph + twitter", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain("/og-image.png");
    expect(layout).toContain("summary_large_image");
  });
});

describe("404 + privacy", () => {
  it("custom 404 exists with recovery links", () => {
    const nf = read("app/not-found.tsx");
    for (const href of ['"/"', '"/create"', '"/examples"', '"/pricing"']) {
      expect(nf).toContain(href);
    }
  });

  it("privacy page exists with metadata and footer links to it", () => {
    const pp = read("app/privacy/page.tsx");
    expect(pp).toContain("Privacy policy | Etch");
    expect(read("components/vilish/footer.tsx")).toContain('href: "/privacy"');
  });
});

describe("unique titles + descriptions", () => {
  const PAGES = [
    "app/pricing/layout.tsx",
    "app/create/page.tsx",
    "app/examples/page.tsx",
    "app/about/page.tsx",
    "app/video-studio/layout.tsx",
    "app/privacy/page.tsx",
    "app/tools/page.tsx",
  ];

  it("every key page declares a title and description mentioning Etch", () => {
    for (const p of PAGES) {
      const src = read(p);
      expect(src, p).toContain("title:");
      expect(src, p).toContain("description:");
      expect(src, p).toContain("Etch");
    }
  });

  it("titles are unique across key pages", () => {
    const titles = PAGES.map((p) => {
      const m = read(p).match(/title:\s*"([^"]+)"/);
      expect(m, p).not.toBeNull();
      return m![1];
    });
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("structured data", () => {
  it("homepage has Organization + WebSite JSON-LD", () => {
    const home = read("app/page.tsx");
    expect(home).toContain('"@type": "Organization"');
    expect(home).toContain('"@type": "WebSite"');
  });

  it("homepage FAQ uses FAQPage JSON-LD built from the rendered FAQ copy", () => {
    const home = read("app/page.tsx");
    expect(home).toContain('"@type": "FAQPage"');
    // Schema must map over the faqs array — no duplicated hardcoded Q&A that can drift.
    expect(home).toContain("mainEntity: faqs.map");
  });

  it("tool pages have BreadcrumbList JSON-LD", () => {
    expect(read("app/tools/[tool]/page.tsx")).toContain('"@type": "BreadcrumbList"');
  });

  it("use-case pages have visual breadcrumbs + BreadcrumbList JSON-LD", () => {
    const uc = read("components/vilish/usecase-page.tsx");
    expect(uc).toContain('aria-label="Breadcrumb"');
    expect(uc).toContain('"@type": "BreadcrumbList"');
  });
});

describe("conversion", () => {
  it("sticky mobile CTA exists, renders in root layout, hides on /create + /admin", () => {
    const cta = read("components/vilish/sticky-mobile-cta.tsx");
    expect(cta).toContain('"/create"');
    expect(cta).toContain('"/admin"');
    expect(cta).toContain("sm:hidden");
    expect(read("app/layout.tsx")).toContain("StickyMobileCTA");
  });

  it("pricing has at least five FAQs with FAQPage JSON-LD", () => {
    const pricing = read("app/pricing/page.tsx");
    const faqs = pricing.match(/q: "/g) ?? [];
    expect(faqs.length).toBeGreaterThanOrEqual(5);
    expect(pricing).toContain('"@type": "FAQPage"');
  });

  it("homepage keeps at least five FAQs", () => {
    const home = read("app/page.tsx");
    const faqs = home.match(/q: "/g) ?? [];
    expect(faqs.length).toBeGreaterThanOrEqual(5);
  });

  it("thank-you banner shows on ?paid=1 and the payment modal navigates there", () => {
    const gen = read("app/generation/[id]/page.tsx");
    expect(gen).toContain('get("paid")');
    expect(gen).toContain("Payment confirmed");
    expect(read("components/vilish/payment-modal.tsx")).toContain("?paid=1");
  });
});

describe("sitemap + robots", () => {
  it("sitemap covers /privacy and /video-studio", () => {
    const sm = read("app/sitemap.ts");
    expect(sm).toContain('"/privacy"');
    expect(sm).toContain('"/video-studio"');
  });

  it("robots allows all and points at the sitemap", () => {
    const rb = read("app/robots.ts");
    expect(rb).toContain('allow: "/"');
    expect(rb).toContain("sitemap");
  });

  it("admin routes are noindexed", () => {
    expect(read("app/admin/layout.tsx")).toContain("index: false");
  });
});

describe("alt text", () => {
  function* tsxFiles(dir: string): Generator<string> {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__" || entry.name === "node_modules") continue;
        yield* tsxFiles(full);
      } else if (entry.name.endsWith(".tsx")) {
        yield full;
      }
    }
  }

  it("every <img> and <Image> has an alt attribute", () => {
    const bad: string[] = [];
    for (const dir of [join(ROOT, "app"), join(ROOT, "components")]) {
      for (const f of tsxFiles(dir)) {
        const src = readFileSync(f, "utf8");
        for (const m of src.matchAll(/<(img|Image)\b/g)) {
          // scan the tag: naive quote-aware walk to the closing >
          let j = m.index!;
          let quote: string | null = null;
          let parens = 0;
          while (j < src.length) {
            const c = src[j];
            if (quote) {
              if (c === quote) quote = null;
            } else if (c === '"' || c === "'") {
              quote = c;
            } else if (c === "(") {
              parens++;
            } else if (c === ")") {
              parens--;
            } else if (c === ">" && parens === 0) {
              break;
            }
            j++;
          }
          const tag = src.slice(m.index!, j + 1);
          if (!/\balt\s*=/.test(tag)) bad.push(`${f}:${src.slice(0, m.index!).split("\n").length}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
