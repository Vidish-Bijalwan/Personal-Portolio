/**
 * Etch Ad Studio — step-3 accordion regressions.
 *
 * The customize step (app/ads) is a single-open accordion: concept, colors,
 * typography, layout. Selection state lives in ads-flow.tsx and is passed
 * down as props, so collapse/expand can never lose a pick; the freeform path
 * (concept === null) keeps its own-description state.
 *
 * Note: this repo's vitest pipeline cannot transform .tsx (tsconfig sets
 * jsx:preserve), so component behavior is pinned via file-content tests —
 * the same style as components/vilish/__tests__/header-auth.test.ts — plus
 * unit tests of the pure toggle rule in accordion-state.ts.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ACCORDION_SECTION_IDS, nextAccordionOpen } from "../accordion-state";
import { artForConcept } from "../concept-art";

const ADS = join(__dirname, "..");
const read = (f: string) => readFileSync(join(ADS, f), "utf8");

describe("nextAccordionOpen — single-open toggle rule", () => {
  it("opens a closed section", () => {
    expect(nextAccordionOpen(null, "palette")).toBe("palette");
  });

  it("switches: opening one section closes the previously open one", () => {
    expect(nextAccordionOpen("palette", "typography")).toBe("typography");
  });

  it("re-clicking the open section collapses everything", () => {
    expect(nextAccordionOpen("palette", "palette")).toBeNull();
  });

  it("covers the four customize sections in order", () => {
    expect([...ACCORDION_SECTION_IDS]).toEqual([
      "concept",
      "palette",
      "typography",
      "layout",
    ]);
  });
});

describe("accordion.tsx — single-open shell", () => {
  const src = read("accordion.tsx");

  it("is controlled: open section comes from props, toggle delegates up", () => {
    expect(src).toContain("openId: string | null");
    expect(src).toContain("onToggle: (id: string) => void");
    expect(src).toContain("onClick={() => onToggle(s.id)}");
  });

  it("renders exactly one panel: closed sections unmount their body", () => {
    expect(src).toContain("{open && (");
    expect(src).toContain('role="region"');
  });

  it("wires aria-expanded on every trigger for the open/closed state", () => {
    expect(src).toContain("aria-expanded={open}");
    expect(src).toContain("aria-controls={panelId}");
  });

  it("keeps no selection state — the summary echoes the caller's pick", () => {
    expect(src).not.toMatch(/useState/);
    expect(src).toContain("{s.summary}");
  });

  it("uses the shared toggle rule", () => {
    expect(src).toContain('from "./accordion-state"');
    expect(src).toContain("nextAccordionOpen");
  });
});

describe("ads-customize.tsx — selections live above the accordion", () => {
  const src = read("ads-customize.tsx");

  it("defaults to the first section open", () => {
    expect(src).toContain("initialOpenId = ACCORDION_SECTION_IDS[0]");
    expect(src).toContain("useState<string | null>(initialOpenId)");
  });

  it("toggles through the single-open rule", () => {
    expect(src).toContain("setOpenId((cur) => nextAccordionOpen(cur, id))");
  });

  it("concept section shows the pick-path picker and the freeform state", () => {
    // Pick path: selected concept + switcher grid.
    expect(src).toContain("onConceptChange(c.id)");
    expect(src).toContain('aria-pressed={selected}');
    // Freeform path: own-description notice with a way back to the bank.
    expect(src).toContain("Using your own description");
    expect(src).toContain("Browse the concept bank");
  });

  it("collapsed triggers keep showing the current picks (persistence)", () => {
    expect(src).toContain("summary: concept ? concept.name : ");
    expect(src).toContain("summary: paletteName");
    expect(src).toContain("summary: typographyName");
    expect(src).toContain("summary: layoutName");
  });

  it("palette / typography / layout pickers still call the caller's setters", () => {
    expect(src).toContain("onPaletteChange(p.name)");
    expect(src).toContain("onTypographyChange(t.name)");
    expect(src).toContain("onLayoutChange(l.name)");
  });

  it("keeps the live prompt preview and Review & create CTA accessible", () => {
    expect(src).toContain("Live prompt preview");
    expect(src).toContain("{finalPrompt}");
    expect(src).toContain("Review & create");
    // Desktop: sticky beside the accordion; mobile: sticky bottom bar.
    expect(src).toContain("lg:sticky lg:top-24");
    expect(src).toContain("sticky bottom-0");
  });
});

describe("ads-flow.tsx — step 3 wiring", () => {
  const src = read("ads-flow.tsx");

  it("renders AdsCustomize with the flow's selection state", () => {
    expect(src).toContain('import AdsCustomize from "./ads-customize"');
    expect(src).toContain("<AdsCustomize");
    expect(src).toContain("concept={concept}");
    expect(src).toContain("onConceptChange={");
    // Concept changes auto-advance the accordion to Colors.
    expect(src).toContain('setCustomizeOpenId("palette")');
    expect(src).toContain("onPaletteChange={setPaletteName}");
    expect(src).toContain("onTypographyChange={setTypographyName}");
    expect(src).toContain("onLayoutChange={setLayoutName}");
    expect(src).toContain("finalPrompt={finalPrompt}");
    expect(src).toContain("onBack={() => setStep(2)}");
    expect(src).toContain("onNext={() => setStep(4)}");
  });

  it("freeform skip path still clears the concept and jumps to styling", () => {
    expect(src).toContain("setConceptId(null); setStep(3)");
  });

  it("freeform path lets the accordion default to the first section open", () => {
    // customizeOpenId is null until a concept is picked; passing it through
    // as-is would force the accordion fully closed on the freeform path.
    // `?? undefined` lets AdsCustomize fall back to its documented default
    // (the Concept section), so step 3 never lands on four closed panels.
    expect(src).toContain("initialOpenId={customizeOpenId ?? undefined}");
  });
});

describe("concept-art fallbacks", () => {
  it("falls back to category art, then the site-wide default", () => {
    expect(artForConcept({ id: "does-not-exist", category: "food" })).toBe(
      "/pro/ad-burger.jpg"
    );
    expect(artForConcept({ id: "does-not-exist", category: "nope" })).toBe(
      "/pro/hero-headphones.jpg"
    );
  });
});
