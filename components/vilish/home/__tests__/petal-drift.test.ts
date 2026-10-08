import { describe, expect, it } from "vitest";
import { resolvePetalPalette } from "../petal-palette";

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("resolvePetalPalette", () => {
  it("uses valid hex stops and sane alpha ranges in both themes", () => {
    for (const isLight of [true, false]) {
      const p = resolvePetalPalette(isLight);
      expect(p.stops).toHaveLength(3);
      for (const s of p.stops) {
        expect(s).toMatch(/^#[0-9a-f]{6}$/i);
      }
      expect(p.alphaMin).toBeGreaterThan(0);
      expect(p.alphaMax).toBeLessThanOrEqual(1);
      expect(p.alphaMin).toBeLessThan(p.alphaMax);
    }
  });

  it("adapts tone to theme: deeper antique gold on light, luminous gold on dark", () => {
    const light = resolvePetalPalette(true);
    const dark = resolvePetalPalette(false);
    // Palettes must differ so the toggle is visible.
    expect(light.stops).not.toEqual(dark.stops);
    // Light-theme petals are darker (readable on near-white bg);
    // dark-theme petals are brighter (luminous on dark bg).
    const lightMid = luminance(light.stops[1]);
    const darkMid = luminance(dark.stops[1]);
    expect(lightMid).toBeLessThan(0.2);
    expect(darkMid).toBeGreaterThan(0.4);
    expect(darkMid).toBeGreaterThan(lightMid);
  });
});
