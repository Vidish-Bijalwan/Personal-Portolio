"use client"

import { useEffect, useRef } from "react"
import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface FlyingElementsProps {
  className?: string
  /** 1 ≈ 42 particles; scaled down automatically on small screens. */
  density?: number
}

// Brand-adjacent tints, kept dim — atmosphere, not confetti.
const TINTS: Array<[number, number, number]> = [
  [79, 124, 255], // iris blue
  [139, 92, 246], // violet
  [255, 122, 110], // ember
  [245, 245, 243], // white
]

interface Particle {
  x: number // 0..1 normalized
  y: number
  vx: number // normalized units / second
  vy: number
  size: number // px at density 1
  tint: [number, number, number]
  alpha: number // peak alpha
  phase: number // twinkle phase
  twinkleSpeed: number
  angle: number
  spin: number
  depth: number // 0..1 — parallax weight
  shard: boolean // rotated rectangle vs. round mote
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * "Flying elements" — drifting light shards and glyphs floating across a
 * section with physics-feeling motion: slow drift, sine twinkle, gentle
 * spin, and subtle mouse-reactive parallax (deeper shards move more).
 *
 * Performance: DPR-aware canvas, capped particle count, rAF paused when the
 * element scrolls off-screen (IntersectionObserver) or the tab is hidden.
 *
 * prefers-reduced-motion → a handful of static soft dots, no canvas, no
 * animation.
 */
export default function FlyingElements({ className, density = 1 }: FlyingElementsProps) {
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Capture non-null references for the rAF / observer closures below.
    const wrapEl: HTMLDivElement = wrap
    const canvasEl: HTMLCanvasElement = canvas
    const paint: CanvasRenderingContext2D = ctx

    let raf = 0
    let running = false
    let last = 0
    let particles: Particle[] = []
    let dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    let mouseX = 0.5
    let mouseY = 0.5
    let smX = 0.5
    let smY = 0.5

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    function seed() {
      const count = Math.max(
        8,
        Math.min(
          64,
          Math.round(density * 42 * (w < 480 ? 0.45 : w < 900 ? 0.75 : 1))
        )
      )
      particles = Array.from({ length: count }, () => {
        const depth = Math.random()
        return {
          x: Math.random(),
          y: Math.random(),
          vx: rand(-0.012, 0.012),
          vy: rand(-0.02, -0.006),
          size: rand(1.5, 4.5),
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
          alpha: rand(0.12, 0.4),
          phase: rand(0, Math.PI * 2),
          twinkleSpeed: rand(0.4, 1.4),
          angle: rand(0, Math.PI * 2),
          spin: rand(-0.5, 0.5),
          depth,
          shard: Math.random() < 0.35,
        }
      })
    }

    function resize() {
      const rect = wrapEl.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvasEl.width = Math.floor(w * dpr)
      canvasEl.height = Math.floor(h * dpr)
      paint.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    function frame(t: number) {
      if (!running) return
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016)
      last = t

      // Eased mouse parallax.
      smX = lerp(smX, mouseX, 0.04)
      smY = lerp(smY, mouseY, 0.04)
      const px = (smX - 0.5) * 2
      const py = (smY - 0.5) * 2

      paint.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.angle += p.spin * dt
        // Wrap around edges so the field never empties.
        if (p.x < -0.05) p.x = 1.05
        if (p.x > 1.05) p.x = -0.05
        if (p.y < -0.08) p.y = 1.08
        if (p.y > 1.08) p.y = -0.08

        const tw = 0.55 + 0.45 * Math.sin(p.phase + t * 0.001 * p.twinkleSpeed)
        const alpha = p.alpha * tw
        const ox = px * 26 * p.depth
        const oy = py * 18 * p.depth
        const cx = p.x * w + ox
        const cy = p.y * h + oy
        const s = p.size * (0.6 + p.depth * 0.9)
        const [r, g, b] = p.tint

        paint.save()
        paint.globalAlpha = alpha
        paint.translate(cx, cy)
        if (p.shard) {
          paint.rotate(p.angle)
          paint.fillStyle = `rgba(${r},${g},${b},1)`
          paint.fillRect(-s * 1.6, -s * 0.45, s * 3.2, s * 0.9)
        } else {
          const grad = paint.createRadialGradient(0, 0, 0, 0, 0, s * 2.2)
          grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
          paint.fillStyle = grad
          paint.fillRect(-s * 2.2, -s * 2.2, s * 4.4, s * 4.4)
        }
        paint.restore()
      }
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const onMouse = (e: MouseEvent) => {
      const rect = wrapEl.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      mouseX = (e.clientX - rect.left) / rect.width
      mouseY = (e.clientY - rect.top) / rect.height
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    let visible = true
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting
          if (visible && !document.hidden) start()
          else stop()
        }
      },
      { threshold: 0.02 }
    )

    const ro = new ResizeObserver(resize)
    ro.observe(wrapEl)
    io.observe(wrapEl)
    window.addEventListener("mousemove", onMouse, { passive: true })
    document.addEventListener("visibilitychange", onVisibility)
    resize()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("mousemove", onMouse)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reduced, density])

  // Reduced motion: a few static soft dots, no canvas.
  if (reduced) {
    return (
      <div className={className} aria-hidden="true">
        {[
          { left: "12%", top: "30%", size: 5 },
          { left: "78%", top: "18%", size: 7 },
          { left: "64%", top: "72%", size: 4 },
          { left: "28%", top: "80%", size: 6 },
        ].map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/[0.14]"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
