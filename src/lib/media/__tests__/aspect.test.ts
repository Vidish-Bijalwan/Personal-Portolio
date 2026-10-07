import { describe, expect, it } from "vitest";
import { cssAspectRatio } from "@/lib/media/aspect";

describe("cssAspectRatio (watch-page video crop fix)", () => {
  it("converts W:H labels to CSS aspect-ratio", () => {
    expect(cssAspectRatio("16:9")).toBe("16 / 9");
    expect(cssAspectRatio("9:16")).toBe("9 / 16");
    expect(cssAspectRatio("1:1")).toBe("1 / 1");
    expect(cssAspectRatio("4:5")).toBe("4 / 5");
  });

  it("falls back to 16/9 for unknown or empty input", () => {
    expect(cssAspectRatio("")).toBe("16 / 9");
    expect(cssAspectRatio(null)).toBe("16 / 9");
    expect(cssAspectRatio(undefined)).toBe("16 / 9");
    expect(cssAspectRatio("widescreen")).toBe("16 / 9");
    expect(cssAspectRatio("0:0")).toBe("16 / 9");
  });
});
