/**
 * Gate test: no periwinkle-blue accent remnants.
 *
 * Site pro theme (2026-10-07 — Vidish verdict) uses champagne gold
 * (--pro-accent / --pro-accent-strong). This test fails if any old blue
 * accent hexes or blue/sky/indigo Tailwind classes remain in shipped source.
 *
 * Allowlisted:
 *  - components/logo.tsx and components/vilish/wordmark.tsx — brand wordmark,
 *    deliberately untouched.
 *  - comment-only mentions (historical notes like "replaces periwinkle").
 *  - this test file itself.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = join(__dirname, "..", "..", "..");
const SCAN_DIRS = ["app", "components", "src", "lib", "utils", "hooks", "styles"];
const SCAN_EXTS = new Set([".ts", ".tsx", ".css", ".js", ".jsx"]);

const BLUE_HEXES = [
  "#7da2ff",
  "#6b8cff",
  "#5b7fff",
  "#4a6cf7",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
] as const;

// Matches e.g. bg-blue-500, text-blue-200, from-blue-600, via-sky-300, indigo-100,
// and arbitrary-value forms like text-[#7da2ff] (handled via hex list anyway).
const BLUE_CLASS_RE =
  /(?:^|[\s"'`])(?:bg|text|border|ring|from|via|to|decoration|placeholder|fill|stroke|outline|shadow|divide|accent)-(?:blue|sky|indigo)-\d{1,3}(?:\/\d{1,3})?(?:[\s"'`]|$)/;

const ALLOWLISTED_FILES = new Set([
  join(ROOT, "components", "logo.tsx"),
  join(ROOT, "components", "vilish", "wordmark.tsx"),
  join(__filename),
]);

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "__tests__") continue;
      yield* walk(full);
    } else if (SCAN_EXTS.has(extname(entry))) {
      yield full;
    }
  }
}

function stripComments(src: string, ext: string): string {
  if (ext === ".css") {
    // Keep url(...) contents untouched but they can't contain our hexes in practice.
    return src.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  // .ts/.tsx/.js/.jsx: block comments, line comments. JSX can't contain raw "<!--".
  // Avoid clobbering string literals containing "//" (e.g. URLs) by requiring
  // the line comment to NOT be preceded by a quote or colon (scheme://).
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

describe("no-blue-accent gate", () => {
  it("no hardcoded blue accent hexes in source (comments excluded)", () => {
    const violations: string[] = [];
    for (const dir of SCAN_DIRS) {
      for (const file of walk(join(ROOT, dir))) {
        if (ALLOWLISTED_FILES.has(file)) continue;
        const code = stripComments(readFileSync(file, "utf8"), extname(file));
        for (const hex of BLUE_HEXES) {
          if (code.toLowerCase().includes(hex)) {
            violations.push(`${file} contains ${hex}`);
          }
        }
        if (/periwinkle/i.test(code)) {
          violations.push(`${file} mentions periwinkle`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no blue/sky/indigo Tailwind color classes in app/ and components/", () => {
    const violations: string[] = [];
    for (const dir of ["app", "components"]) {
      for (const file of walk(join(ROOT, dir))) {
        if (ALLOWLISTED_FILES.has(file)) continue;
        const code = stripComments(readFileSync(file, "utf8"), extname(file));
        if (BLUE_CLASS_RE.test(code)) {
          violations.push(file);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("usecase accents resolve to the pro gold token", () => {
    const src = readFileSync(
      join(ROOT, "src", "lib", "usecases", "usecases.ts"),
      "utf8",
    );
    const matches = [...src.matchAll(/accent:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(matches.length).toBeGreaterThan(0);
    for (const accent of matches) {
      expect(accent).toBe("var(--pro-accent)");
    }
  });
});
