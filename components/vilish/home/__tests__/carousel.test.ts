/**
 * Regression test for the intermittent black/empty hero carousel images
 * (reported 2026-10-10: caption pill renders, image frame stays black).
 *
 * Root cause: the carousel passed a DYNAMIC priority prop
 * (priority={isActive}) to next/image. Every autoplay tick flipped the
 * loading/fetchpriority attributes on live <img> elements, racing the
 * browser's image pipeline and intermittently leaving the frame black.
 *
 * Invariant: every next/image `priority` prop in the carousel must be a
 * STATIC expression (loop index or literal) — never render state such as
 * isActive/pos/activeIdx. This test reads the component source and fails
 * the moment a dynamic priority expression is (re)introduced.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAW = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "carousel.tsx"),
  "utf8"
);
// Strip comments so prose like "priority={isActive}" in an explanation
// isn't mistaken for a real prop.
const SRC = RAW.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

describe("HeroCarousel image priority invariant", () => {
  it("never passes render state to next/image priority", () => {
    const props = [...SRC.matchAll(/priority=\{([^}]*)\}/g)].map((m) => m[1].trim());
    // The carousel must render next/image with a priority prop (LCP hero).
    expect(props.length).toBeGreaterThan(0);
    for (const expr of props) {
      // Static only: loop index comparison or boolean literal.
      expect(expr).toMatch(/^(i === 1|true|false)$/);
    }
  });

  it("keeps the never-dynamic warning comment next to the priority prop", () => {
    expect(RAW).toContain("must NEVER be dynamic");
  });
});
