"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { EASE_OUT, MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface RevealProps {
  delay?: number
  /** Rise distance in px (0 = fade only). */
  y?: number
  /** If true (default), animates once the first time it enters view. */
  once?: boolean
  className?: string
  children: ReactNode
}

/**
 * Fade-and-rise reveal on scroll into view.
 * Reduced-motion users get a static render — no shift, no flash.
 */
export default function Reveal({
  delay = 0,
  y = MOTION.travel.enter,
  once = true,
  className,
  children,
}: RevealProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: MOTION.durations.base, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
