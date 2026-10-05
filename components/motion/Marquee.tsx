"use client"

import { type CSSProperties, type ReactNode } from "react"
import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface MarqueeProps {
  /** Pixels per second the track travels. */
  speed?: number
  /** Gap between items (px). */
  gap?: number
  pauseOnHover?: boolean
  className?: string
  children: ReactNode
}

/**
 * Seamless infinite marquee. Children are rendered twice and the track
 * translates -50%; the second copy is aria-hidden so screen readers only
 * hear the content once. Duration derives from speed so width changes don't
 * alter perceived velocity. Reduced motion → static single copy.
 */
export default function Marquee({
  speed = 60,
  gap = 32,
  pauseOnHover = true,
  className,
  children,
}: MarqueeProps) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <div className={className} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap }}>{children}</div>
      </div>
    )
  }

  // Long enough to feel infinite for typical content widths; the exact width
  // of the duplicated half only changes perceived speed slightly.
  const duration = Math.max(8, 1600 / speed)

  const trackStyle: CSSProperties = {
    display: "flex",
    width: "max-content",
    gap,
    animation: `v-marquee ${duration}s linear infinite`,
  }

  const copyStyle: CSSProperties = { display: "flex", gap, alignItems: "center", flexShrink: 0 }

  return (
    <div
      className={className}
      style={{ overflow: "hidden" }}
      onMouseEnter={pauseOnHover ? (e) => pauseOnHoverTrack(e.currentTarget, true) : undefined}
      onMouseLeave={pauseOnHover ? (e) => pauseOnHoverTrack(e.currentTarget, false) : undefined}
    >
      <div style={trackStyle} data-marquee-track>
        <div style={copyStyle}>{children}</div>
        {/* inert: the duplicate is purely visual — keyboard users must not
            tab into focusable controls (e.g. lightbox buttons) twice. */}
        <div style={copyStyle} aria-hidden="true" inert>
          {children}
        </div>
      </div>
      <style>{`@keyframes v-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

function pauseOnHoverTrack(root: HTMLElement, paused: boolean) {
  const track = root.querySelector<HTMLElement>("[data-marquee-track]")
  if (track) track.style.animationPlayState = paused ? "paused" : "running"
}
