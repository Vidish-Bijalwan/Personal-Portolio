"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function AnimatedCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState("default")
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if mobile on mount
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches)
      }
    }

    checkMobile()

    // Return early if mobile - no need to set up event listeners
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      return
    }

    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    const mouseDown = () => setCursorVariant("click")
    const mouseUp = () => setCursorVariant("default")
    const mouseEnterLink = () => setCursorVariant("hover")
    const mouseLeaveLink = () => setCursorVariant("default")
    const mouseEnterButton = () => setCursorVariant("button")
    const mouseLeaveButton = () => setCursorVariant("default")

    window.addEventListener("mousemove", mouseMove)
    window.addEventListener("mousedown", mouseDown)
    window.addEventListener("mouseup", mouseUp)

    // Only add these listeners after component is mounted
    setTimeout(() => {
      const links = document.querySelectorAll("a, button")
      links.forEach((link) => {
        link.addEventListener("mouseenter", mouseEnterLink)
        link.addEventListener("mouseleave", mouseLeaveLink)
      })

      const buttons = document.querySelectorAll(".btn-hover")
      buttons.forEach((button) => {
        button.addEventListener("mouseenter", mouseEnterButton)
        button.addEventListener("mouseleave", mouseLeaveButton)
      })
    }, 1000)

    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("mousemove", mouseMove)
      window.removeEventListener("mousedown", mouseDown)
      window.removeEventListener("mouseup", mouseUp)
      window.removeEventListener("resize", checkMobile)

      // Clean up link listeners
      const links = document.querySelectorAll("a, button")
      links.forEach((link) => {
        link.removeEventListener("mouseenter", mouseEnterLink)
        link.removeEventListener("mouseleave", mouseLeaveLink)
      })

      const buttons = document.querySelectorAll(".btn-hover")
      buttons.forEach((button) => {
        button.removeEventListener("mouseenter", mouseEnterButton)
        button.removeEventListener("mouseleave", mouseLeaveButton)
      })
    }
  }, [mounted])

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(var(--primary), 0.1)",
      border: "2px solid rgb(var(--primary))",
      transition: {
        type: "spring",
        mass: 0.6,
      },
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: "rgba(var(--primary), 0.2)",
      border: "2px solid rgb(var(--primary))",
      mixBlendMode: "difference",
    },
    click: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(var(--primary), 0.4)",
      border: "2px solid rgb(var(--primary))",
    },
    button: {
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      height: 64,
      width: 64,
      backgroundColor: "rgba(var(--primary), 0.05)",
      border: "2px solid rgba(var(--primary), 0.3)",
      mixBlendMode: "difference",
    },
  }

  if (isMobile || !mounted) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100]"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.8 }}
      />
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99] bg-primary/30 blur-sm"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 1.2, delay: 0.03 }}
      />
    </>
  )
}
