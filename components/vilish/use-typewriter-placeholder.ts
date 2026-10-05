"use client";

import { useEffect, useState } from "react";
import {
  advanceTypewriter,
  initialTypewriterState,
  PROMPT_IDEAS,
  typewriterDelay,
  typewriterText,
} from "@/src/lib/vilish/typewriter";
import { usePrefersReducedMotion } from "@/src/lib/motion/theme";

/**
 * Animated placeholder for the composer textarea.
 *
 * Cycles PROMPT_IDEAS with a typewriter effect while `active` (empty
 * prompt + not focused). Under prefers-reduced-motion the ideas rotate
 * as whole static strings — no per-character animation.
 * Returns null when the placeholder should not animate.
 */
export function useTypewriterPlaceholder(active: boolean): string | null {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState(initialTypewriterState);
  const [staticIndex, setStaticIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      const t = setInterval(
        () => setStaticIndex((i) => (i + 1) % PROMPT_IDEAS.length),
        4000,
      );
      return () => clearInterval(t);
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (s: ReturnType<typeof initialTypewriterState>) => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        const next = advanceTypewriter(s);
        setState(next);
        tick(next);
      }, typewriterDelay(s));
    };
    tick(state);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);

  if (!active) return null;
  if (reduced) return PROMPT_IDEAS[staticIndex]!;
  return typewriterText(state);
}
