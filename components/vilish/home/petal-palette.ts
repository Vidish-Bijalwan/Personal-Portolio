/* ── Gold petal palette — theme adaptation for PetalDrift ──────────
   Pure module (no JSX) so it stays unit-testable under the project's
   vitest config. Light theme gets a deeper antique gold that reads on
   near-white; dark theme gets a luminous brighter gold.                */

export interface PetalPalette {
  /** Petal face gradient stops (base → mid → tip). */
  stops: [string, string, string];
  /** Soft rim highlight, drawn near the petal's top. */
  highlight: string;
  alphaMin: number;
  alphaMax: number;
}

/** Pure — covered by __tests__/petal-drift.test.ts. */
export function resolvePetalPalette(isLight: boolean): PetalPalette {
  if (isLight) {
    // Deeper antique gold: must read against near-white backgrounds.
    return {
      stops: ["#b8892f", "#8a6825", "#6b4f1a"],
      highlight: "rgba(255, 243, 210, 0.5)",
      alphaMin: 0.34,
      alphaMax: 0.72,
    };
  }
  // Luminous brighter gold on dark backgrounds.
  return {
    stops: ["#f7de96", "#e4ba5d", "#c6a15b"],
    highlight: "rgba(255, 248, 224, 0.75)",
    alphaMin: 0.22,
    alphaMax: 0.55,
  };
}
