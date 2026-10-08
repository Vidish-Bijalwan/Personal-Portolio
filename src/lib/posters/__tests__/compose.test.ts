/**
 * Poster Studio — prompt composer tests.
 */
import { describe, expect, it } from "vitest";
import {
  composePosterPrompt,
  composePromptPreview,
  paletteFor,
  sanitizeFieldValue,
} from "@/lib/posters/compose";
import { templateById } from "@/data/poster-templates/templates";

const T = templateById("food-burger-blast")!;

describe("sanitizeFieldValue", () => {
  it("strips quotes and newlines, collapses whitespace", () => {
    expect(sanitizeFieldValue('Say "hi"\nthere', 40)).toBe("Say hi there");
    expect(sanitizeFieldValue("  a   b  ", 40)).toBe("a b");
  });

  it("clamps to maxLength", () => {
    expect(sanitizeFieldValue("abcdefghij", 5)).toBe("abcde");
  });

  it("handles empty input", () => {
    expect(sanitizeFieldValue("", 10)).toBe("");
  });
});

describe("paletteFor", () => {
  it("returns the requested palette", () => {
    expect(paletteFor(T, "smoke").name).toBe("Smokehouse");
  });

  it("falls back to the first palette for unknown ids", () => {
    expect(paletteFor(T, "nope").id).toBe(T.palettes[0].id);
    expect(paletteFor(T, undefined).id).toBe(T.palettes[0].id);
  });
});

describe("composePosterPrompt", () => {
  it("substitutes field defaults and quotes every text element", () => {
    const prompt = composePosterPrompt(T, { fields: {} });
    expect(prompt).toContain('"BURGER BLAST"');
    expect(prompt).toContain('"Juicy. Cheesy. Unmissable."');
    expect(prompt).toContain('"50% OFF"');
    expect(prompt).toContain('"ORDER NOW"');
    expect(prompt).toContain("4:5 portrait");
  });

  it("uses custom field values", () => {
    const prompt = composePosterPrompt(T, {
      fields: { headline: "PIZZA PARTY", badge: "30% OFF" },
    });
    expect(prompt).toContain('"PIZZA PARTY"');
    expect(prompt).toContain('"30% OFF"');
    expect(prompt).not.toContain('"BURGER BLAST"');
  });

  it("sanitizes hostile input", () => {
    const prompt = composePosterPrompt(T, {
      fields: { headline: 'FREE" \n injected="yes' },
    });
    expect(prompt).not.toContain('FREE"');
    expect(prompt).toContain("FREE injected=yes");
  });

  it("applies the chosen palette", () => {
    const prompt = composePosterPrompt(T, { fields: {}, paletteId: "smoke" });
    expect(prompt).toContain("smoky charcoal-black");
  });

  it("appends free text when provided", () => {
    const prompt = composePosterPrompt(T, {
      fields: {},
      freeText: "make it more festive",
    });
    expect(prompt).toContain("make it more festive");
  });

  it("omits the free-text section when empty", () => {
    const prompt = composePosterPrompt(T, { fields: {} });
    expect(prompt).not.toContain("STYLE ADJUSTMENT");
  });

  it("enforces the text-discipline rule", () => {
    const prompt = composePosterPrompt(T, { fields: {} });
    expect(prompt).toContain("no garbled");
    expect(prompt).toContain("No watermark");
  });
});

describe("composePromptPreview", () => {
  it("truncates long prompts", () => {
    const preview = composePromptPreview(T, { fields: {} }, 50);
    expect(preview.length).toBeLessThanOrEqual(51);
    expect(preview.endsWith("…")).toBe(true);
  });
});
