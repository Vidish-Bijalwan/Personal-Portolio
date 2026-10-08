/**
 * Poster Studio — sample-output mock helper tests.
 *
 * Guards the style-direction interpretation and color helpers that drive
 * the client-side "Sample output" mock (gallery demo preview + customizer).
 */
import { describe, expect, it } from "vitest";
import { contrastText, shade, styleFlags } from "@/lib/posters/sample-output";

describe("styleFlags", () => {
  it("detects the script treatment (café morning)", () => {
    const f = styleFlags(
      "Headline mixing elegant script lettering with a clean serif. Small round NEW sticker badge. Airy, premium café aesthetic with generous whitespace around the hero.",
    );
    expect(f.script).toBe(true);
    expect(f.serif).toBe(false);
    expect(f.airy).toBe(true);
    expect(f.roundBadge).toBe(true);
  });

  it("detects slanted energy (dj rave)", () => {
    const f = styleFlags(
      "Slanted, aggressive condensed headline with motion energy. Sharp diagonal composition. Sticker date chip. Raw club-flyer intensity.",
    );
    expect(f.slanted).toBe(true);
    expect(f.script).toBe(false);
    expect(f.roundBadge).toBe(true);
  });

  it("detects the discount-hero starburst (mega sale)", () => {
    const f = styleFlags(
      "The discount numeral IS the hero — enormous, dominating the center. Starburst badge shapes. Urgent, loud, unmissable sale energy. CTA bar along the bottom.",
    );
    expect(f.roundBadge).toBe(true);
    expect(f.slanted).toBe(false);
  });

  it("renders ribbon badges as non-round (real estate)", () => {
    const f = styleFlags(
      "Property photo dominating the upper half. Clean feature checklist with checkmark icons below. FOR SALE badge ribbon. Professional contact CTA bar at the bottom. Trustworthy, premium.",
    );
    expect(f.roundBadge).toBe(false);
  });

  it("falls back to the default bold treatment for unknown phrasing", () => {
    const f = styleFlags("Some completely novel design direction.");
    expect(f).toEqual({
      script: false,
      serif: false,
      slanted: false,
      airy: false,
      roundBadge: false,
    });
  });

  it("prefers script over serif when both words appear", () => {
    const f = styleFlags("elegant script lettering with a clean serif");
    expect(f.script).toBe(true);
    expect(f.serif).toBe(false);
  });
});

describe("contrastText", () => {
  it("returns dark ink on light backgrounds", () => {
    expect(contrastText("#FFFFFF")).toBe("#17130E");
    expect(contrastText("#F5EFE6")).toBe("#17130E");
  });

  it("returns white on dark backgrounds", () => {
    expect(contrastText("#0A0A0A")).toBe("#FFFFFF");
    expect(contrastText("#000000")).toBe("#FFFFFF");
    expect(contrastText("#1C1C1E")).toBe("#FFFFFF");
  });

  it("handles 3-digit hex", () => {
    expect(contrastText("#fff")).toBe("#17130E");
    expect(contrastText("#000")).toBe("#FFFFFF");
  });

  it("falls back to white on malformed input", () => {
    expect(contrastText("not-a-color")).toBe("#FFFFFF");
  });
});

describe("shade", () => {
  it("darkens toward black", () => {
    expect(shade("#FFFFFF", 1)).toBe("#000000");
    expect(shade("#FFFFFF", 0)).toBe("#FFFFFF");
    expect(shade("#FFFFFF", 0.5)).toBe("#808080");
  });

  it("clamps the amount to 0..1", () => {
    expect(shade("#FFFFFF", 2)).toBe("#000000");
    expect(shade("#FFFFFF", -1)).toBe("#FFFFFF");
  });

  it("returns the input unchanged when it cannot parse", () => {
    expect(shade("nope", 0.5)).toBe("nope");
  });
});
