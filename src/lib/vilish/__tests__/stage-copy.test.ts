import { describe, expect, it } from "vitest";
import { displayStage } from "@/lib/vilish/stage-copy";

describe("displayStage", () => {
  it("maps legacy grill/projector stages to professional copy", () => {
    expect(displayStage("Warming up the grill…")).toBe("Preparing your creation");
    expect(displayStage("Firing up the grill")).toBe("Preparing your creation");
    expect(displayStage("Cooking your creation")).toBe("Creating your image");
    expect(displayStage("Plating it up")).toBe("Running the quality check");
    expect(displayStage("Rendering frames")).toBe("Rendering your clip");
    expect(displayStage("Cutting the final")).toBe("Finalizing your clip");
    expect(displayStage("Setting up the projector…")).toBe("Preparing your clip");
  });

  it("is case-insensitive and trims", () => {
    expect(displayStage("  cooking your creation ")).toBe("Creating your image");
  });

  it("falls back for empty input", () => {
    expect(displayStage(null)).toBe("Preparing your creation");
    expect(displayStage("")).toBe("Preparing your creation");
  });

  it("passes unknown pipeline stages through unchanged", () => {
    expect(displayStage("Recording your voice-over")).toBe("Recording your voice-over");
    expect(displayStage("Polishing the final cut")).toBe("Polishing the final cut");
  });

  it("never returns grill/kitchen/projector metaphors for mapped stages", () => {
    const mapped = [
      "Warming up the grill…",
      "Cooking your creation",
      "Plating it up",
      "Rendering frames",
    ].map(displayStage);
    for (const label of mapped) {
      expect(label.toLowerCase()).not.toMatch(/grill|kitchen|burger|patty|plating|projector/);
    }
  });
});
