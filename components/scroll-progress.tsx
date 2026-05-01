"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export default function ScrollProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Update visibility based on scroll position
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Update scroll percentage
    const updateScrollPercentage = () => {
      try {
        const currentProgress = scrollYProgress.get()
        if (currentProgress !== undefined) {
          setScrollPercentage(Math.round(currentProgress * 100))
        }
      } catch (error) {
        console.warn("Error updating scroll percentage:", error)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Set up an interval to safely update the percentage
    const intervalId = setInterval(updateScrollPercentage, 100)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(intervalId)
    }
  }, [mounted, scrollYProgress])

  if (!mounted) return null

  // Create a spring animation based on scrollYProgress

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX, opacity: isVisible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.3 } }}
      />

      <motion.div
        className="fixed bottom-8 right-24 bg-background rounded-full shadow-lg z-50 px-3 py-1 text-sm border border-border"
        style={{ opacity: isVisible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.3 } }}
      >
        <motion.span>{scrollPercentage}% scrolled</motion.span>
      </motion.div>
    </>
  )
}
