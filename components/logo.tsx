"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Logo() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-10 h-10"></div>

  const isDark = theme !== "light"

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle, ${
            isDark ? "rgba(147, 197, 253, 0.3)" : "rgba(147, 197, 253, 0.2)"
          } 0%, transparent 70%)`,
        }}
      />
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 5L5 20L20 35L35 20L20 5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12.5 20L20 27.5L27.5 20L20 12.5L12.5 20Z" fill={isDark ? "#93c5fd" : "#93c5fd"} />
      </svg>
    </div>
  )
}
