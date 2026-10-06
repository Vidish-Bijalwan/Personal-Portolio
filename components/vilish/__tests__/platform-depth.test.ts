/**
 * Platform-depth page gate (2026-10-06): new routes carry no hardcoded
 * prices, the tool detail route covers all 12 tools, and the sitemap
 * includes every new route.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TOOL_DIRECTORY } from "../../../src/lib/tools/directory";
import { USE_CASES } from "../../../src/lib/usecases/usecases";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");

const NEW_FILES = [
  join("app", "tools", "[tool]", "page.tsx"),
  join("components", "vilish", "usecase-page.tsx"),
  join("app", "for-sellers", "page.tsx"),
  join("app", "for-creators", "page.tsx"),
  join("app", "for-marketers", "page.tsx"),
  join("app", "sitemap.ts"),
];

const HARDCODED_RUPEE = /₹\s*\d/;

const BANNED = [
  "talking photo",
  "voice cloning",
  "ai song",
  "ai influencer",
  "creations delivered",
  "happy customers",
  "trusted by",
  "join thousands",
];

describe("platform-depth pages: no hardcoded prices", () => {
  for (const rel of NEW_FILES) {
    it(`${rel} has zero hardcoded ₹ amounts`, () => {
      const src = readFileSync(join(root, ...rel.split("/")), "utf8");
      expect(src).not.toMatch(HARDCODED_RUPEE);
    });
  }

  it("new pages promise nothing unsupported and prove nothing fake", () => {
    const hay = NEW_FILES.map((rel) =>
      readFileSync(join(root, ...rel.split("/")), "utf8"),
    )
      .join("\n")
      .toLowerCase();
    for (const banned of BANNED) {
      expect(hay).not.toContain(banned);
    }
  });
});

describe("tool detail route", () => {
  it("dynamic route file exists and handles unknown ids", () => {
    const src = readFileSync(join(root, "app", "tools", "[tool]", "page.tsx"), "utf8");
    expect(src).toContain("notFound()");
    expect(src).toContain("generateStaticParams");
  });

  it("static params would cover all 12 tools", () => {
    // generateStaticParams maps TOOL_DIRECTORY 1:1 — assert the mapping source.
    expect(TOOL_DIRECTORY).toHaveLength(12);
    const ids = TOOL_DIRECTORY.map((t) => t.id);
    expect(new Set(ids).size).toBe(12);
  });
});

describe("sitemap", () => {
  it("includes tool detail routes and use-case routes", () => {
    const src = readFileSync(join(root, "app", "sitemap.ts"), "utf8");
    expect(src).toContain("TOOL_DIRECTORY");
    expect(src).toContain("USE_CASES");
    expect(src).toContain("/tools/${t.id}");
    expect(src).toContain("/${u.slug}");
  });
});
