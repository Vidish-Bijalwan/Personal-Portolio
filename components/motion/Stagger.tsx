"use client"

import { type ReactNode } from "react"
import { motion, type Variants } from "framer-motion"
import { EASE_OUT, MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: MOTION.stagger.base, delayChildren: 0.05 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: MOTION.travel.enter },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.durations.base, ease: EASE_OUT },
  },
}

interface StaggerProps {
  className?: string
  children: ReactNode
}

/** Container that staggers any <StaggerItem> children on scroll into view. */
export function Stagger({ className, children }: StaggerProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  className?: string
  children: ReactNode
}

/** Must be a direct (or nested) child of <Stagger>. */
export function StaggerItem({ className, children }: StaggerItemProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}

export default Stagger
