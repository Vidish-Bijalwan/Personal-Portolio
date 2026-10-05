"use client"

import { useEffect, useRef, useState } from "react"
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"

/**
 * CyberCursor — neon ring + particle trail that AUGMENTS the native cursor.
 *
 * - Renders only on fine-pointer devices (desktop), never on touch.
 * - Renders nothing under prefers-reduced-motion.
 * - `pointer-events: none` at all times; the native cursor stays visible and
 *   fully functional — clicking, text selection and keyboard focus are
 *   untouched. No global `cursor: none`.
 * - The ring chases the pointer with spring physics (MOTION.springs.ui);
 *   a pooled set of glow particles trails behind with a looser spring for
 *   a stretchy, electric lag. All per-frame work is direct DOM writes, so
 *   there is zero React re-render cost at 60fps.
 */
const RING = MOTION.springs.ui // { stiffness: 260, damping: 28 }
const TRAIL_STIFFNESS = 140
const TRAIL_DAMPING = 20
const TRAIL_POOL_SIZE = 18
const TRAIL_COLORS = ["#00F0FF", "#D7FF3F", "#FF2D78", "#00F0FF"]

interface TrailParticle {
  el: HTMLDivElement | null
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, [data-cursor-hover]"

export default function CyberCursor() {
  const reduced = usePrefersReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<TrailParticle[]>([])

  // Gate: fine pointers only. SSR-safe — first render is null either way.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(pointer: fine)")
    setEnabled(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Build the particle pool once the cursor is live.
  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    const pool: TrailParticle[] = []
    for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
      const el = document.createElement("div")
      el.style.position = "absolute"
      el.style.top = "0"
      el.style.left = "0"
      el.style.pointerEvents = "none"
      el.style.opacity = "0"
      el.style.willChange = "transform, opacity"
      container.appendChild(el)
      pool.push({
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.45,
        size: 4,
        color: TRAIL_COLORS[0],
      })
    }
    particlesRef.current = pool
    return () => {
      pool.forEach((p) => p.el?.remove())
      particlesRef.current = []
    }
  }, [enabled])

  // Spring-chase loop + trail spawning. Direct DOM writes only.
  useEffect(() => {
    if (!enabled || reduced) return
    const ring = ringRef.current
    const dot = dotRef.current
    const pool = particlesRef.current
    if (!ring || !dot) return

    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    const vel = { x: 0, y: 0 }
    let last = performance.now()
    let raf = 0
    let spawnCursor = 0
    let lastSpawnX = -9999
    let lastSpawnY = -9999

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      // Spawn at most one particle per ~6px of travel.
      const dx = e.clientX - lastSpawnX
      const dy = e.clientY - lastSpawnY
      if (dx * dx + dy * dy > 36) {
        lastSpawnX = e.clientX
        lastSpawnY = e.clientY
        const p = pool[spawnCursor % pool.length]
        spawnCursor += 1
        p.x = pos.x
        p.y = pos.y
        p.vx = 0
        p.vy = 0
        p.life = p.maxLife
        p.size = 3 + Math.random() * 3
        p.color = TRAIL_COLORS[spawnCursor % TRAIL_COLORS.length]
        // Static visuals are set once at spawn — the per-frame loop only
        // touches transform/opacity (cheap, no style recalc).
        if (p.el) {
          p.el.style.width = `${p.size}px`
          p.el.style.height = `${p.size}px`
          p.el.style.borderRadius = "9999px"
          p.el.style.background = p.color
          p.el.style.boxShadow = `0 0 8px ${p.color}, 0 0 20px ${p.color}`
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now

      // Ring spring-chase (semi-implicit Euler).
      const k = RING.stiffness * dt
      const d = Math.exp(-RING.damping * dt)
      vel.x = (vel.x + (target.x - pos.x) * k) * d
      vel.y = (vel.y + (target.y - pos.y) * k) * d
      pos.x += vel.x * dt
      pos.y += vel.y * dt
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      // Center dot tracks the raw pointer — zero lag for precision feel.
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`

      for (const p of pool) {
        if (!p.el) continue
        if (p.life <= 0) {
          if (p.el.style.opacity !== "0") p.el.style.opacity = "0"
          continue
        }
        p.life -= dt
        const t = Math.max(p.life / p.maxLife, 0)
        const pk = TRAIL_STIFFNESS * dt
        const pd = Math.exp(-TRAIL_DAMPING * dt)
        p.vx = (p.vx + (pos.x - p.x) * pk) * pd
        p.vy = (p.vy + (pos.y - p.y) * pk) * pd
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.el.style.transform =
          `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${(0.4 + 0.6 * t).toFixed(3)})`
        p.el.style.opacity = (t * 0.85).toFixed(3)
      }

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled, reduced])

  // Subtle scale-up + color shift over interactive elements.
  useEffect(() => {
    if (!enabled || reduced) return
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      setHovering(!!target?.closest?.(INTERACTIVE_SELECTOR))
    }
    document.addEventListener("mouseover", onOver, { passive: true })
    return () => document.removeEventListener("mouseover", onOver)
  }, [enabled, reduced])

  // Fade out when the pointer leaves the window.
  useEffect(() => {
    if (!enabled || reduced) return
    const root = document.documentElement
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    root.addEventListener("mouseleave", onLeave)
    root.addEventListener("mouseenter", onEnter)
    return () => {
      root.removeEventListener("mouseleave", onLeave)
      root.removeEventListener("mouseenter", onEnter)
    }
  }, [enabled, reduced])

  if (!enabled || reduced) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-cyber-cursor
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      {/* Neon ring — scale animates via the independent `scale` property so the
          per-frame rAF `transform` writes never fight the hover transition. */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          border: `1.5px solid ${hovering ? "#D7FF3F" : "#00F0FF"}`,
          boxShadow: hovering
            ? "0 0 16px rgba(215,255,63,0.55), 0 0 40px rgba(215,255,63,0.25)"
            : "0 0 12px rgba(0,240,255,0.5), 0 0 32px rgba(0,240,255,0.22)",
          transform: "translate(-50%, -50%)",
          scale: hovering ? "1.6" : "1",
          transition:
            "scale 220ms cubic-bezier(0.16,1,0.3,1), border-color 220ms ease, box-shadow 220ms ease",
        }}
      />
      {/* Precision dot — tracks the raw pointer position. */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: 5,
          height: 5,
          borderRadius: 9999,
          background: "#D7FF3F",
          boxShadow: "0 0 8px #D7FF3F, 0 0 18px rgba(215,255,63,0.6)",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Trail particle divs are appended to this container by the pool effect. */}
    </div>
  )
}
