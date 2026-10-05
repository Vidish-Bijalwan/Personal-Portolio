/**
 * Pixaura — typewriter placeholder for the composer.
 *
 * Pure state machine: each tick advances one character (typing or
 * deleting). The React hook in this module turns ticks into timers.
 * Unit-testable in isolation — no DOM, no timers in the logic itself.
 */

export const PROMPT_IDEAS: readonly string[] = [
  "A neon portrait of a street musician in the rain…",
  "Product photo of a handmade ceramic mug, soft studio light…",
  "A cozy mountain cabin at dusk, warm windows glowing…",
  "Bold poster art for a music festival, retro-futuristic…",
  "A watercolor fox in a misty forest, storybook style…",
] as const;

export type TypewriterPhase = "typing" | "holding" | "deleting";

export interface TypewriterState {
  idea: number;
  chars: number;
  phase: TypewriterPhase;
}

export const TYPE_DELAY_MS = 42;
export const HOLD_DELAY_MS = 1700;
export const DELETE_DELAY_MS = 16;

export function initialTypewriterState(): TypewriterState {
  return { idea: 0, chars: 0, phase: "typing" };
}

function ideaText(idea: number): string {
  return PROMPT_IDEAS[idea % PROMPT_IDEAS.length]!;
}

/** Current visible text for a state. */
export function typewriterText(s: TypewriterState): string {
  return ideaText(s.idea).slice(0, s.chars);
}

/** Milliseconds to wait before the next tick. */
export function typewriterDelay(s: TypewriterState): number {
  if (s.phase === "holding") return HOLD_DELAY_MS;
  if (s.phase === "deleting") return DELETE_DELAY_MS;
  return TYPE_DELAY_MS;
}

/** Advance one tick. */
export function advanceTypewriter(s: TypewriterState): TypewriterState {
  const full = ideaText(s.idea);
  if (s.phase === "typing") {
    if (s.chars < full.length) return { ...s, chars: s.chars + 1 };
    return { ...s, phase: "holding" };
  }
  if (s.phase === "holding") {
    return { ...s, phase: "deleting" };
  }
  // deleting
  if (s.chars > 0) return { ...s, chars: s.chars - 1 };
  return { idea: (s.idea + 1) % PROMPT_IDEAS.length, chars: 0, phase: "typing" };
}
