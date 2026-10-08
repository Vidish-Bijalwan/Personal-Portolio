/**
 * Poster Studio — no-new-payment-logic guard.
 *
 * The poster customizer must reuse the existing /create generation + unlock
 * flow verbatim. This test scans the poster feature's source files and fails
 * if any payment/order logic crept in (payment APIs, Cashfree, order creation,
 * price hardcoding).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const POSTER_FILES = [
  "app/posters/page.tsx",
  "app/posters/poster-gallery.tsx",
  "app/posters/[id]/page.tsx",
  "app/posters/[id]/poster-customizer.tsx",
  "src/data/poster-templates/templates.ts",
  "src/lib/posters/compose.ts",
];

const FORBIDDEN = [
  /\/api\/gen\/.*\/payment/,
  /\/api\/gen\/.*\/unlock/,
  /\/api\/orders/,
  /cashfree/i,
  /createOrder/i,
  /signature verification/i, // webhook signature verification belongs to the payment module
];

describe("poster studio — no new payment logic", () => {
  for (const rel of POSTER_FILES) {
    it(`${rel} contains no payment/order logic`, () => {
      const src = readFileSync(join(__dirname, "..", "..", "..", "..", rel), "utf8");
      for (const pattern of FORBIDDEN) {
        expect(src, `${rel} matches ${pattern}`).not.toMatch(pattern);
      }
    });
  }

  it("customizer deep-links to /create with the standard service", () => {
    const src = readFileSync(
      join(__dirname, "..", "..", "..", "..", "app/posters/[id]/poster-customizer.tsx"),
      "utf8",
    );
    expect(src).toContain("/create?service=");
    expect(src).toContain("single-image");
  });

  it("prices come from the canonical catalog, never hardcoded", () => {
    const src = readFileSync(
      join(__dirname, "..", "..", "..", "..", "app/posters/[id]/poster-customizer.tsx"),
      "utf8",
    );
    expect(src).toContain("priceOf");
    expect(src).not.toMatch(/₹\s*15/);
  });
});
