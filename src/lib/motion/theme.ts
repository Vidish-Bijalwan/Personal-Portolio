"use client"

import { useEffect, useState } from "react"

/**
 * Pixaura — motion theme.
 *
 * One file owns every timing, spring, stagger and travel value used across
 * the motion system so animation feels like a single instrument, not a bag
 * of one-offs. Pair with the design tokens in app/globals.css.
 */

/** Cubic-bezier for decisive exits: fast start, gentle settle. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const MOTION = {
  /** Raw durations (seconds) for plain transitions. */
  durations: {
    instant: 0.12,
    fast: 0.2,
    base: 0.4,
    slow: 0.8,
  },

  /** Framer-motion spring presets, from hard UI snaps to slow ambience. */
  springs: {
    /** Crisp micro-interactions: buttons, toggles, focus rings. */
    snap: { stiffness: 500, damping: 32 },
    /** General UI movement: cards, panels, page chrome. */
    ui: { stiffness: 260, damping: 28 },
    /** Soft settles: tooltips, menus, reveal landings. */
    gentle: { stiffness: 150, damping: 22 },
    /** Playful overshoot (subtle): badges, counters, likes. */
    lively: { stiffness: 320, damping: 18 },
    /** Barely-there ambient drift: glows, fields, parallax. */
    ambient: { stiffness: 45, damping: 16 },
  },

  /** Orchestrated entrance delays between siblings (seconds). */
  stagger: {
    tight: 0.05,
    base: 0.09,
    relaxed: 0.16,
  },

  /** Spatial travel distances (px) for hover / enter / section motion. */
  travel: {
    hover: 3,
    enter: 24,
    section: 48,
  },
} as const

export type MotionSprings = typeof MOTION.springs
export type MotionSpringName = keyof MotionSprings

/**
 * SSR-safe prefers-reduced-motion hook.
 * Returns `false` during SSR and on the first client render, then subscribes
 * to the media query so every animation can degrade to a calm static state.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}
