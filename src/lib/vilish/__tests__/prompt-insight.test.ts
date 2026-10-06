/**
 * Prompt-insight keyword tests — the watch room's "what we understood"
 * chips must only report what the prompt literally contains.
 */
import { describe, expect, it } from "vitest";
import { promptInsight } from "../prompt-insight";

describe("promptInsight", () => {
  it("detects styles from literal keywords", () => {
    const r = promptInsight("cinematic neon portrait of a dancer, dramatic light");
    expect(r.styles).toContain("Cinematic");
    expect(r.styles).toContain("Neon");
    expect(r.styles).toContain("Portrait");
    expect(r.mood).toBe("Dramatic");
  });

  it("detects photo/photoreal and multi-word styles", () => {
    expect(promptInsight("an ultra photorealistic cat").styles).toContain("Photoreal");
    expect(promptInsight("a studio photo of a watch").styles).toContain("Photo");
    expect(promptInsight("village in oil painting style").styles).toContain("Oil painting");
    expect(promptInsight("city, 3d render").styles).toContain("3D render");
    expect(promptInsight("soft watercolor landscape").styles).toEqual(
      expect.arrayContaining(["Watercolor", "Landscape"])
    );
  });

  it("never invents: plain prompts get empty styles and null mood", () => {
    const r = promptInsight("a red sneaker floating");
    expect(r.styles).toEqual([]);
    expect(r.mood).toBeNull();
    expect(r.subject).toBe("red sneaker floating");
  });

  it("strips stopwords and caps the subject at 5 words", () => {
    const r = promptInsight(
      "please make me a picture of a very happy golden retriever puppy playing in the garden"
    );
    expect(r.subject).toBe("happy golden retriever puppy playing");
  });

  it("falls back to 'your idea' when nothing meaningful remains", () => {
    expect(promptInsight("").subject).toBe("your idea");
    expect(promptInsight("   ").subject).toBe("your idea");
    expect(promptInsight(null).subject).toBe("your idea");
    expect(promptInsight("a").styles).toEqual([]);
  });

  it("matches case-insensitively and picks the first mood", () => {
    const r = promptInsight("EPIC cozy cabin");
    expect(r.mood).toBe("Cozy"); // Cozy comes before Epic in the keyword list
  });

  it("does not match partial words", () => {
    // "neonatal" must not trigger the Neon style
    const r = promptInsight("neonatal unit illustration");
    expect(r.styles).not.toContain("Neon");
  });
});
