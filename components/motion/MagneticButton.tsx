"use client"

import { useRef, type ReactNode, type MouseEvent } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface MagneticButtonProps {
  /** Max pull in px toward the cursor at the bounding-box edge. */
  strength?: number
  className?: string
  children: ReactNode
}

/**
 * Spring-follows the cursor while it is inside the element's bounding box,
 * easing back to center on leave. Renders a plain wrapper when reduced
 * motion is preferred or the device has no fine pointer (touch).
 */
export default function MagneticButton({
  strength = 18,
  className,
  children,
}: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, MOTION.springs.lively)
  const sy = useSpring(y, MOTION.springs.lively)

  const canMagnet =
    !reduced &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: fine)").matches

  if (!canMagnet) {
    return <div className={className}>{children}</div>
  }

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Normalized offset from center, -1..1 on each axis.
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    x.set(nx * strength)
    y.set(ny * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
