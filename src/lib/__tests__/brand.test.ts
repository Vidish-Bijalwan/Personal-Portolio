/**
 * Etch — brand-name guard.
 *
 * The previous brand name must never appear anywhere in the codebase again
 * (case-insensitive). This scans every text file under the repo root — pages,
 * components, lib, styles, public assets, config — and fails on the first
 * hit, so a reverted or half-renamed file can never ship silently.
 *
 * Skipped: dependency/build output (node_modules, .next, dist, coverage),
 * VCS metadata (.git), and binary media extensions.
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Built dynamically so this guard file itself never contains the banned string.
const BANNED = ["pix", "aura"].join("");
const BANNED_RE = new RegExp(BANNED, "i");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "dist",
  "build",
  ".turbo",
  ".vercel",
]);

const BINARY_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".ico",
  ".mp4", ".webm", ".mov", ".mkv",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".pdf", ".zip", ".gz", ".br",
]);

function collectTextFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) collectTextFiles(full, out);
    } else if (st.isFile()) {
      const dot = entry.lastIndexOf(".");
      const ext = dot === -1 ? "" : entry.slice(dot).toLowerCase();
      if (!BINARY_EXTS.has(ext)) out.push(full);
    }
  }
}

describe("brand guard", () => {
  it("contains no trace of the previous brand name (case-insensitive)", () => {
    const root = process.cwd();
    const files: string[] = [];
    collectTextFiles(root, files);
    expect(files.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of files) {
      let text: string;
      try {
        text = readFileSync(file, "utf8");
      } catch {
        continue; // unreadable as text — not a brand-string carrier
      }
      if (BANNED_RE.test(text)) {
        offenders.push(relative(root, file));
        if (offenders.length >= 20) break;
      }
    }

    expect(
      offenders,
      offenders.length
        ? `Previous brand name found in:\n${offenders.join("\n")}`
        : "clean",
    ).toEqual([]);
  });
});
