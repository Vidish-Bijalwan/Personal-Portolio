"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  effect?: "ripple" | "shine" | "bounce" | "scale"
}

export default function AnimatedButton({
  children,
  className,
  variant = "default",
  size = "default",
  effect = "ripple",
  ...props
}: AnimatedButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (effect === "ripple") {
      const rect = e.currentTarget.getBoundingClientRect()
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)

    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative overflow-hidden transition-all",
        effect === "bounce" && isAnimating && "animate-[bounce_0.5s_ease-in-out]",
        effect === "scale" && isAnimating && "animate-[scale_0.3s_ease-in-out]",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}

      {effect === "ripple" && isAnimating && (
        <span
          className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
          style={{
            left: coords.x,
            top: coords.y,
            width: "200%",
            height: "200%",
            marginLeft: "-100%",
            marginTop: "-100%",
            transform: "scale(0)",
            opacity: "1",
          }}
        />
      )}

      {effect === "shine" && isAnimating && (
        <span
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transform: "translateX(-100%)",
            animation: "shimmer 1s ease-out",
          }}
        />
      )}
    </Button>
  )
}
