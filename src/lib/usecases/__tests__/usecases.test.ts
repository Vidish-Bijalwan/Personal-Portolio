/**
 * Use-case pages gate (2026-10-06): /for-sellers, /for-creators, /for-marketers.
 *
 * - 3 slugs, every toolId resolving via toolById.
 * - Every example image exists on disk; every example service is a real
 *   catalog product (so price + deep link derive correctly).
 * - Every template id exists in TEMPLATES.
 * - No hardcoded ₹ literals, no fake social-proof vocabulary,
 *   no unsupported-feature promises in the data module.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { toolById } from "../../tools/directory";
import { PRICE_CATALOG } from "../../pricing/catalog";
import { TEMPLATES } from "../../trends/templates";
import { USE_CASES, useCaseBySlug } from "../usecases";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const pub = join(root, "public");

const BANNED = [
  "talking photo",
  "voice cloning",
  "ai song",
  "ai influencer",
  "translator",
  "dubbing",
  "creations delivered",
  "happy customers",
  "trusted by",
  "join thousands",
];

const HARDCODED_RUPEE = /₹\s*\d/;
const VALID_SERVICES = new Set(PRICE_CATALOG.map((p) => p.id));
const TEMPLATE_IDS = new Set(TEMPLATES.map((t) => t.id));

describe("use cases", () => {
  it("defines exactly the 3 approved use cases", () => {
    expect(USE_CASES).toHaveLength(3);
    for (const slug of ["for-sellers", "for-creators", "for-marketers"]) {
      expect(useCaseBySlug(slug)?.slug).toBe(slug);
    }
    expect(useCaseBySlug("for-aliens")).toBeUndefined();
  });

  it("every featured tool id resolves", () => {
    for (const u of USE_CASES) {
      expect(u.toolIds.length).toBeGreaterThanOrEqual(3);
      for (const id of u.toolIds) {
        expect(toolById(id), `${u.slug}: tool ${id}`).toBeDefined();
      }
    }
  });

  it("every example image exists and maps to a real catalog service", () => {
    for (const u of USE_CASES) {
      expect(u.examples).toHaveLength(3);
      for (const ex of u.examples) {
        expect(existsSync(join(pub, ex.src.replace(/^\//, ""))), `${u.slug}: ${ex.src}`).toBe(true);
        expect(VALID_SERVICES.has(ex.service), `${u.slug}: service ${ex.service}`).toBe(true);
        expect(ex.caption.length).toBeGreaterThan(3);
      }
      expect(existsSync(join(pub, u.heroImage.replace(/^\//, ""))), `${u.slug}: hero`).toBe(true);
    }
  });

  it("every template id exists in TEMPLATES", () => {
    for (const u of USE_CASES) {
      expect(u.templates.length).toBeGreaterThanOrEqual(2);
      for (const t of u.templates) {
        expect(TEMPLATE_IDS.has(t.id), `${u.slug}: template ${t.id}`).toBe(true);
      }
    }
  });

  it("faqs are substantial and honest", () => {
    for (const u of USE_CASES) {
      expect(u.faqs.length).toBeGreaterThanOrEqual(4);
      expect(u.faqs.length).toBeLessThanOrEqual(6);
      for (const f of u.faqs) {
        expect(f.q.length).toBeGreaterThan(8);
        expect(f.a.length).toBeGreaterThan(30);
      }
      expect(u.metaDescription.length).toBeGreaterThan(60);
      expect(u.metaDescription.length).toBeLessThan(200);
    }
  });

  it("copy promises nothing unsupported and proves nothing fake", () => {
    const copy = USE_CASES.flatMap((u) => [
      u.title,
      u.titleAccent,
      u.subtitle,
      u.kicker,
      ...u.faqs.flatMap((f) => [f.q, f.a]),
    ])
      .join(" | ")
      .toLowerCase();
    for (const banned of BANNED) {
      expect(copy).not.toContain(banned);
    }
  });

  it("data module carries zero hardcoded ₹ literals", () => {
    const src = readFileSync(join(root, "src", "lib", "usecases", "usecases.ts"), "utf8");
    expect(src).not.toMatch(HARDCODED_RUPEE);
  });
});
