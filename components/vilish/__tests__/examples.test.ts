/**
 * Examples pricing-transparency gate (Phase 3).
 * Every example resolves to a real catalog product; the displayed price is
 * always derived from the catalog — never hardcoded, never invented.
 * A manifest entry that fails the guard never renders with a guessed price.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  exampleHref,
  examplePrice,
  isExampleItem,
  toLightboxItem,
} from "../examples";
import { PRICE_CATALOG, priceOf } from "../../../src/lib/pricing/catalog";
import { formatINR } from "../../../src/lib/vilish/types";

const MANIFEST_PATH = new URL(
  "../../../public/examples/manifest.json",
  import.meta.url,
);

function loadManifest(): unknown[] {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

describe("examples pricing transparency", () => {
  it("manifest entries all resolve to real catalog services", () => {
    const items = loadManifest();
    // 13 originals + 8 new images + 4 new videos (showcase rotation, 2026-10-06).
    expect(items.length).toBe(25);
    for (const it of items) {
      expect(isExampleItem(it)).toBe(true);
    }
  });

  it("every example price is catalog-derived, never invented", () => {
    const catalogIds = new Set(PRICE_CATALOG.map((p) => p.id));
    for (const it of loadManifest().filter(isExampleItem)) {
      expect(catalogIds.has(it.service)).toBe(true);
      expect(examplePrice(it)).toBe(formatINR(priceOf(it.service)));
    }
  });

  it("rejects entries with unknown or missing services", () => {
    expect(
      isExampleItem({ src: "x", prompt: "y", service: "not-real", model: "m", category: "image" }),
    ).toBe(false);
    expect(
      isExampleItem({ src: "x", prompt: "y", model: "m", category: "image" }),
    ).toBe(false);
    expect(
      isExampleItem({
        src: "x",
        prompt: "y",
        price: "₹29",
        model: "m",
        category: "image",
      }),
    ).toBe(false);
  });

  it("make-one-like-this deep links open the right composer", () => {
    expect(exampleHref({ service: "clip-5s" })).toBe("/create?media=video");
    expect(exampleHref({ service: "single-image" })).toBe(
      "/create?service=single-image",
    );
    expect(exampleHref({ service: "product-photo" })).toBe(
      "/create?service=product-photo",
    );
  });

  it("manifest ships no hardcoded price strings", () => {
    const raw = readFileSync(MANIFEST_PATH, "utf8");
    expect(raw).not.toMatch(/₹\d/);
    expect(raw).not.toContain('"price"');
  });

  it("lightbox mapping carries the catalog-derived price", () => {
    for (const it of loadManifest().filter(isExampleItem)) {
      expect(toLightboxItem(it).price).toBe(examplePrice(it));
    }
  });

  it("no hardcoded ₹ amounts in the pricing-touching components", () => {
    const files = [
      "../../../components/vilish/examples-grid.tsx",
      "../../../components/vilish/nav.tsx",
      "../../../components/vilish/home/pricing-strip.tsx",
    ];
    for (const f of files) {
      const src = readFileSync(new URL(f, import.meta.url), "utf8");
      expect(src, f).not.toMatch(/₹\s?\d/);
    }
  });

  it("recreate deep links carry the exact prompt, encoded", () => {
    const prompt =
      "Cinematic 5-second product ad: a luxury watch, gold spotlight & drifting dust";
    expect(exampleHref({ service: "clip-5s", prompt })).toBe(
      `/create?media=video&prompt=${encodeURIComponent(prompt)}`,
    );
    expect(exampleHref({ service: "single-image", prompt })).toBe(
      `/create?service=single-image&prompt=${encodeURIComponent(prompt)}`,
    );
    // The encoded prompt round-trips back to the exact original prompt.
    const href = exampleHref({ service: "clip-5s", prompt });
    const back = decodeURIComponent(href.split("&prompt=")[1]);
    expect(back).toBe(prompt);
  });

  it("omits the prompt param when the prompt is empty or missing", () => {
    expect(exampleHref({ service: "clip-5s" })).toBe("/create?media=video");
    expect(exampleHref({ service: "single-image", prompt: "" })).toBe(
      "/create?service=single-image",
    );
  });
});
