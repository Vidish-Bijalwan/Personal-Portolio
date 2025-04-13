"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface MicroInteractionProps {
  children: React.ReactNode
  type?: "hover" | "click" | "focus"
  effect?: "scale" | "rotate" | "shake" | "pulse" | "bounce"
  intensity?: "subtle" | "medium" | "strong"
  duration?: number
}

export default function MicroInteraction({
  children,
  type = "hover",
  effect = "scale",
  intensity = "medium",
  duration = 0.3,
}: MicroInteractionProps) {
  const [isActive, setIsActive] = useState(false)

  // Define animation variants based on effect and intensity
  const getVariants = () => {
    const intensityValues = {
      subtle: { scale: 1.05, rotate: 2, shake: 2, pulse: 1.05, bounce: 5 },
      medium: { scale: 1.1, rotate: 5, shake: 5, pulse: 1.1, bounce: 10 },
      strong: { scale: 1.2, rotate: 10, shake: 10, pulse: 1.2, bounce: 15 },
    }

    const value = intensityValues[intensity][effect]

    switch (effect) {
      case "scale":
        return {
          initial: { scale: 1 },
          active: { scale: value },
        }
      case "rotate":
        return {
          initial: { rotate: 0 },
          active: { rotate: value },
        }
      case "shake":
        return {
          initial: { x: 0 },
          active: {
            x: [0, -value, value, -value, value, 0],
            transition: { duration: 0.5 },
          },
        }
      case "pulse":
        return {
          initial: { scale: 1 },
          active: {
            scale: [1, value, 1],
            transition: { duration: 0.5, repeat: 1 },
          },
        }
      case "bounce":
        return {
          initial: { y: 0 },
          active: {
            y: [0, -value, 0],
            transition: { duration: 0.5, times: [0, 0.5, 1] },
          },
        }
      default:
        return {
          initial: {},
          active: {},
        }
    }
  }

  const variants = getVariants()

  // Event handlers
  const handleMouseEnter = () => {
    if (type === "hover") setIsActive(true)
  }

  const handleMouseLeave = () => {
    if (type === "hover") setIsActive(false)
  }

  const handleClick = () => {
    if (type === "click") {
      setIsActive(true)
      setTimeout(() => setIsActive(false), duration * 1000)
    }
  }

  const handleFocus = () => {
    if (type === "focus") setIsActive(true)
  }

  const handleBlur = () => {
    if (type === "focus") setIsActive(false)
  }

  return (
    <motion.div
      initial="initial"
      animate={isActive ? "active" : "initial"}
      variants={variants}
      transition={{ duration }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </motion.div>
  )
}
