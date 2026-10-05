"use client"

import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface SiteBackdropProps {
  className?: string
}

/**
 * Global ambient site backdrop (mounted once in the root layout).
 *
 * A fixed, full-viewport layer sitting behind everything: a barely-there
 * neon glow at the top and bottom of the viewport plus a faint film-grain
 * noise. Deliberately quiet — hero video and section backgrounds own the
 * motion; this just stops large dark areas from feeling dead.
 *
 * prefers-reduced-motion → the same static gradients, no drift.
 * Pointer-events are off; it is aria-hidden decorative chrome.
 */
export default function SiteBackdrop({ className }: SiteBackdropProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: "#080808" }}
    >
      {/* top neon glow */}
      <div
        className="absolute inset-x-0 top-0 h-[46vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% -20%, rgba(0,240,255,0.07) 0%, rgba(255,45,120,0.045) 45%, transparent 100%)",
        }}
      />
      {/* bottom lime glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 120%, rgba(215,255,63,0.05) 0%, rgba(255,45,120,0.04) 50%, transparent 100%)",
        }}
      />
      {/* ultra-slow drifting sheen — omitted for reduced motion */}
      {!reduced && (
        <div
          className="v-site-backdrop-drift absolute inset-x-[-20%] top-[10%] h-[60vh]"
          style={{
            background:
              "radial-gradient(ellipse 40% 60% at 60% 40%, rgba(0,240,255,0.05) 0%, transparent 70%)",
          }}
        />
      )}
      {/* faint film grain */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "140px 140px",
        }}
      />
      {!reduced && (
        <style>{`@keyframes v-site-backdrop-drift { 0% { transform: translate3d(-4%,0,0); } 50% { transform: translate3d(4%,2%,0); } 100% { transform: translate3d(-4%,0,0); } } .v-site-backdrop-drift { animation: v-site-backdrop-drift 70s ease-in-out infinite; will-change: transform; }`}</style>
      )}
    </div>
  )
}
