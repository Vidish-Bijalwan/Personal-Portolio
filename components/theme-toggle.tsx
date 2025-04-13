"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9"></div>
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-0 left-0" />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/10"
        initial={{ scale: 0 }}
        animate={theme === "dark" ? { scale: 1.5, opacity: 0 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, repeat: theme === "dark" ? Number.POSITIVE_INFINITY : 0, repeatType: "reverse" }}
      />
    </Button>
  )
}
