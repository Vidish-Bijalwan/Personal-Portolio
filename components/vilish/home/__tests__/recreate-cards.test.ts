/**
 * Fliki-style one-tap "Recreate" on the HOMEPAGE surfaces.
 *
 * /examples cards got their Recreate pill in PR #55 (exampleHref appends
 * ?prompt=). This file covers the remainder: the hero carousel caption CTA
 * and the homepage example gallery cards (PR #55 left both opening a
 * blank-prompt composer), the mobile vertical swipeable feed, and the
 * /create primary-intake prefill that makes "Recreate" truly one-tap.
 *
 * Follows the repo's file-content gate pattern: .tsx files are asserted via
 * source (node env has no DOM), pure logic via imports.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exampleHref } from "../../examples";

const here = dirname(fileURLToPath(import.meta.url));
const home = join(here, "..");
const root = join(here, "..", "..", "..", "..");

const carouselRaw = readFileSync(join(home, "carousel.tsx"), "utf8");
const galleryRaw = readFileSync(join(home, "gallery.tsx"), "utf8");
const intakeRaw = readFileSync(
  join(root, "components", "muse", "unified-intake.tsx"),
  "utf8",
);
const createPageRaw = readFileSync(
  join(root, "app", "create", "page.tsx"),
  "utf8",
);

// Strip comments so prose mentioning "Recreate" isn't mistaken for UI.
const strip = (s: string) =>
  s.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const carousel = strip(carouselRaw);
const gallery = strip(galleryRaw);

describe("hero carousel: one-tap Recreate", () => {
  it("caption CTA is a Recreate button, not a blank-composer link", () => {
    expect(carousel).toContain("Recreate");
    expect(carousel).toContain("RotateCcw");
    // The CTA renders the pre-built recreate href, not active.href.
    expect(carousel).toContain("href={recreate}");
    expect(carousel).not.toContain("Make one like this");
  });

  it("recreate href carries the slide's exact prompt via exampleHref", () => {
    expect(carousel).toContain("exampleHref({");
    expect(carousel).toContain("prompt: active.prompt");
    // Video demos land in video mode; image slides keep single-image.
    expect(carousel).toContain('"clip-5s"');
    expect(carousel).toContain('"single-image"');
  });
});

describe("homepage gallery: per-card Recreate + mobile feed", () => {
  it("every card has a visible one-tap Recreate link to the recreate deep link", () => {
    expect(gallery).toContain("Recreate");
    expect(gallery).toContain("RefreshCw");
    expect(gallery).toContain("href={item.href}");
    expect(gallery).toContain("aria-label={`Recreate: ${item.alt}`}");
  });

  it("Recreate is a sibling of the dialog button, never nested inside it", () => {
    const openIdx = gallery.indexOf("onClick={() => setOpenIndex(i)}");
    expect(openIdx).toBeGreaterThan(-1);
    const closeBtn = gallery.indexOf("</button>", openIdx);
    const recreateIdx = gallery.indexOf("Recreate", openIdx);
    expect(closeBtn).toBeGreaterThan(-1);
    expect(recreateIdx).toBeGreaterThan(closeBtn);
  });

  it("mobile renders a vertical swipeable feed, not a cramped 2-col grid", () => {
    expect(gallery).toContain("max-sm:grid-cols-1");
    expect(gallery).toContain("max-sm:snap-y");
    expect(gallery).toContain("max-sm:snap-proximity");
    expect(gallery).toContain("max-sm:overflow-y-auto");
    expect(gallery).toContain("max-sm:snap-start");
  });
});

describe("/create: primary intake prefill (no blank screen)", () => {
  it("UnifiedIntake accepts an initialPrompt prop", () => {
    expect(intakeRaw).toContain("initialPrompt?: string;");
    expect(intakeRaw).toContain("useState(initialPrompt ??");
  });

  it("/create passes ?prompt= into the primary intake, clamped to 2000 chars", () => {
    expect(createPageRaw).toContain("initialPrompt={initialPrompt}");
    expect(createPageRaw).toContain("sp.prompt.slice(0, 2000)");
  });
});

describe("exampleHref: carousel slide shapes", () => {
  it("video demo slides open video mode with the exact prompt", () => {
    const prompt =
      "Cinematic 5-second product ad: a luxury black chronograph, slow dolly-in.";
    const href = exampleHref({ service: "clip-5s", prompt });
    expect(href).toBe(`/create?media=video&prompt=${encodeURIComponent(prompt)}`);
  });

  it("image slides keep the single-image service with the exact prompt", () => {
    const href = exampleHref({ service: "single-image", prompt: "studio watch" });
    expect(href).toBe("/create?service=single-image&prompt=studio%20watch");
  });

  it("a missing prompt stays backwards compatible (no empty param)", () => {
    expect(exampleHref({ service: "clip-5s" })).toBe("/create?media=video");
  });
});
