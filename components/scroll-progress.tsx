"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        <motion.span>{Math.round(scrollYProgress.get() * 100)}% scrolled</motion.span>
      </motion.div>
    </>
  )
}
