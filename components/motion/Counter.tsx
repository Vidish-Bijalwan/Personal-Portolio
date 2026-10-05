"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue } from "framer-motion"
import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface CounterProps {
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

/** Formats 1234.5 → "1,234.5" with the requested decimal precision. */
function format(value: number, decimals: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Animated number counter. Counts 0 → `to` the first time it scrolls into
 * view. Reduced-motion users (or SSR) see the final value immediately.
 */
export default function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: CounterProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" })
  const raw = useMotionValue(0)

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(raw, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${prefix}${format(v, decimals)}${suffix}`
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, to, duration, decimals, prefix, suffix])

  // Static text: reduced motion and SSR render the final value immediately —
  // the span reserves space from first paint, so no layout shift.
  const initialText = `${prefix}${format(reduced ? to : 0, decimals)}${suffix}`

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {initialText}
    </span>
  )
}
