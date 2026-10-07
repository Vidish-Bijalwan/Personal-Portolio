"use client"

import { useEffect, useRef } from "react"
import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

/**
 * "The Generative Field" — Etch's signature ambient hero canvas.
 *
 * A slow-drifting field of ~90 luminous motes in white and cool
 * pro-accent tints at low alpha, with faint connecting lines when motes
 * are near, and a subtle mouse-reactive glow. Dark and restrained:
 * atmosphere, not fireworks. (Legacy tints removed 2026-10-07
 * for the pro identity.)
 *
 * Performance: devicePixelRatio-aware sizing, rAF paused when the tab is
 * hidden or the element scrolls off-screen (IntersectionObserver), O(n²)
 * neighbor checks on a capped mote count (~90 at density 1, scaled down on
 * small screens).
 *
 * prefers-reduced-motion → renders one static soft radial gradient, no
 * animation at all.
 */

interface GenerativeFieldProps {
  className?: string
  /** 1 = ~90 motes; scales with area and is clamped. */
  density?: number
}

// Pro tints: white / periwinkle accent / cool steel on near-black
// (legacy tints removed 2026-10-07)
const TINTS: Array<[number, number, number]> = [
  [245, 245, 243], // white
  [125, 162, 255], // pro accent
  [170, 180, 220], // pale periwinkle
  [148, 158, 180], // steel
  [90, 110, 160], // deep slate blue
]

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  tint: [number, number, number]
  alpha: number
  twinkle: number
  phase: number
}

export default function GenerativeField({ className, density = 1 }: GenerativeFieldProps) {
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)

  // ── Reduced motion: single static soft radial gradient ──────────────────
  if (reduced) {
    return (
      <div
        ref={wrapRef}
        className={className}
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(125,162,255,0.10), rgba(255,255,255,0.04) 55%, transparent 100%)",
        }}
      />
    )
  }

  return <FieldCanvas wrapRef={wrapRef} className={className} density={density} />
}

import { forwardRef } from "react"

interface FieldCanvasProps {
  className?: string
  density: number
  wrapRef: React.RefObject<HTMLDivElement | null>
}

function FieldCanvas({ className, density, wrapRef }: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Definitively-typed aliases: this TS version drops control-flow
    // narrowing inside nested function declarations, so the closures below
    // use these non-nullable bindings instead of the narrowed locals.
    const canvasEl: HTMLCanvasElement = canvas
    const wrapEl: HTMLDivElement = wrap
    const cx: CanvasRenderingContext2D = ctx

    let width = 0
    let height = 0
    let dpr = 1
    let motes: Mote[] = []
    let raf = 0
    let running = false
    let visible = true
    let tabVisible = !document.hidden
    const mouse = { x: -9999, y: -9999 }

    const LINK_DIST = 110

    function seed() {
      const area = width * height
      // ~90 motes on a full-bleed 1440×700 hero at density 1.
      const count = Math.max(24, Math.min(130, Math.round((area / 11200) * density)))
      motes = Array.from({ length: count }, () => spawn(true))
    }

    function spawn(anywhere = false): Mote {
      const speed = 0.06 + Math.random() * 0.22 // px/frame at 60fps — very slow
      const angle = Math.random() * Math.PI * 2
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 0.7 + Math.random() * 1.7,
        tint: TINTS[(Math.random() * TINTS.length) | 0],
        alpha: 0.25 + Math.random() * 0.45,
        twinkle: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      }
    }

    function resize() {
      const rect = wrapEl.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      canvasEl.width = Math.round(width * dpr)
      canvasEl.height = Math.round(height * dpr)
      cx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    function tick(t: number) {
      raf = requestAnimationFrame(tick)
      if (!visible || !tabVisible) return

      cx.clearRect(0, 0, width, height)

      // Ambient base wash so the field reads as one continuous glow.
      const wash = cx.createRadialGradient(
        width / 2,
        height * 0.45,
        0,
        width / 2,
        height * 0.45,
        Math.max(width, height) * 0.6
      )
      wash.addColorStop(0, "rgba(125,162,255,0.05)")
      wash.addColorStop(0.55, "rgba(255,255,255,0.02)")
      wash.addColorStop(1, "rgba(0,0,0,0)")
      cx.fillStyle = wash
      cx.fillRect(0, 0, width, height)

      // Faint connecting lines when motes are near.
      cx.lineWidth = 1
      for (let i = 0; i < motes.length; i++) {
        const a = motes[i]
        for (let j = i + 1; j < motes.length; j++) {
          const b = motes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST * LINK_DIST) {
            const closeness = 1 - Math.sqrt(d2) / LINK_DIST
            cx.strokeStyle = `rgba(139,140,250,${(0.07 * closeness).toFixed(3)})`
            cx.beginPath()
            cx.moveTo(a.x, a.y)
            cx.lineTo(b.x, b.y)
            cx.stroke()
          }
        }
      }

      // Motes: drift, twinkle, wrap at edges, mouse-reactive glow.
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        if (m.x < -8) m.x = width + 8
        if (m.x > width + 8) m.x = -8
        if (m.y < -8) m.y = height + 8
        if (m.y > height + 8) m.y = -8

        const dx = m.x - mouse.x
        const dy = m.y - mouse.y
        const md2 = dx * dx + dy * dy
        const glow = md2 < 140 * 140 ? 1 - Math.sqrt(md2) / 140 : 0

        const tw = 0.65 + 0.35 * Math.sin(m.phase + t * 0.0006 * m.twinkle)
        const a = m.alpha * tw + glow * 0.35
        const [r, g, b] = m.tint

        const grad = cx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6)
        grad.addColorStop(0, `rgba(${r},${g},${b},${a.toFixed(3)})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        cx.fillStyle = grad
        cx.beginPath()
        cx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2)
        cx.fill()
      }
    }

    const onMouseMove = (e: PointerEvent) => {
      const rect = canvasEl.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const onVisChange = () => {
      tabVisible = !document.hidden
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.02 }
    )

    resize()
    window.addEventListener("resize", resize)
    wrapEl.addEventListener("pointermove", onMouseMove)
    wrapEl.addEventListener("pointerleave", onMouseLeave)
    document.addEventListener("visibilitychange", onVisChange)
    io.observe(wrap)

    raf = requestAnimationFrame(tick)
    running = true

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("resize", resize)
      wrapEl.removeEventListener("pointermove", onMouseMove)
      wrapEl.removeEventListener("pointerleave", onMouseLeave)
      document.removeEventListener("visibilitychange", onVisChange)
    }
  }, [wrapRef, density])

  return (
    <div ref={wrapRef} className={className} aria-hidden="true" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  )
}
