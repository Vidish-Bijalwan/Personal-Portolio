"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AnimatedThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-12 h-6 rounded-full bg-muted"></div>
  }

  const isDark = theme === "dark"

  return (
    <motion.button
      className="w-12 h-6 rounded-full bg-muted relative flex items-center p-1 cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      initial={false}
      animate={{ backgroundColor: isDark ? "rgb(30, 30, 46)" : "rgb(220, 220, 230)" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full absolute"
        initial={false}
        animate={{
          x: isDark ? 26 : 2,
          backgroundColor: isDark ? "rgb(236, 233, 255)" : "rgb(255, 204, 0)",
          boxShadow: isDark ? "0 0 5px 2px rgba(236, 233, 255, 0.3)" : "0 0 5px 2px rgba(255, 204, 0, 0.3)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* Stars (visible in dark mode) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-around px-6"
        initial={false}
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-white rounded-full"
            initial={false}
            animate={{
              scale: isDark ? [1, 1.5, 1] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Sun rays (visible in light mode) */}
      <motion.div
        className="absolute left-1 top-1 w-4 h-4"
        initial={false}
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-0.5 bg-yellow-500 origin-left"
            style={{
              left: "50%",
              top: "50%",
              rotate: `${i * 45}deg`,
              translateX: "0%",
              translateY: "-50%",
            }}
            initial={false}
            animate={{
              scaleX: isDark ? 0 : [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </motion.button>
  )
}
