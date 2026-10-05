"use client"

import { useEffect, useRef, useState } from "react"
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"
import {
  accentHex,
  CURSOR_SETTINGS_EVENT,
  loadCursorSettings,
  type CursorSettings,
} from "@/src/lib/motion/cursor-settings"

/**
 * CyberCursor — pointer augmentation for the Pixaura motion system.
 *
 * Glitch fixes (root causes, not patches):
 * 1. Hover flapping: the old `mouseover -> setHovering(bool)` flipped state
 *    on every element boundary, restarting the ring's CSS scale transition
 *    mid-flight = visible stutter over dense UI. Now mouseover/mouseout are
 *    paired with a `relatedTarget` containment check, so hovering only
 *    changes when the pointer truly enters/leaves an interactive subtree.
 * 2. Transition fights: the ring scale was a CSS `scale` transition while
 *    rAF wrote `transform` every frame. Scale is now damped inside the same
 *    rAF loop — one writer, no restarts, no jitter.
 * 3. setState storms: hover state only updates on real transitions.
 *
 * Customization (footer gear -> CursorSettingsPopover): style
 * (aura ring / pulse dot / crosshair), accent color, on/off. Settings
 * persist to localStorage and broadcast live via CURSOR_SETTINGS_EVENT.
 *
 * - Fine-pointer devices only; nothing on touch.
 * - prefers-reduced-motion: static dot + ring tracking the raw pointer,
 *   no springs, no trail, no pulse.
 * - `pointer-events: none` always; the native cursor stays fully functional.
 */

const RING = MOTION.springs.ui // { stiffness: 260, damping: 28 }
const TRAIL_STIFFNESS = 140
const TRAIL_DAMPING = 20
const TRAIL_POOL_SIZE = 18
const CROSSHAIR_ARM = 14

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
  const [settings, setSettings] = useState<CursorSettings>(() => loadCursorSettings())
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const crossHRef = useRef<HTMLDivElement>(null)
  const crossVRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<TrailParticle[]>([])
  const hoveringRef = useRef(false)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  // Gate: fine pointers only. SSR-safe.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(pointer: fine)")
    setEnabled(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Live settings updates (footer gear popover).
  useEffect(() => {
    if (typeof window === "undefined") return
    const onSettings = (e: Event) => {
      const detail = (e as CustomEvent<CursorSettings>).detail
      if (detail) setSettings(detail)
    }
    window.addEventListener(CURSOR_SETTINGS_EVENT, onSettings)
    // Re-read on mount in case settings changed while unmounted.
    setSettings(loadCursorSettings())
    return () => window.removeEventListener(CURSOR_SETTINGS_EVENT, onSettings)
  }, [])

  const accent = accentHex(settings.accent)
  const live = enabled && settings.enabled

  // Build the particle pool once the cursor is live.
  useEffect(() => {
    if (!live || reduced || settingsRef.current.style !== "aura") return
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
      pool.push({ el, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.45, size: 4, color: accent })
    }
    particlesRef.current = pool
    return () => {
      pool.forEach((p) => p.el?.remove())
      particlesRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, reduced, settings.style])

  // Main loop: spring chase + trail + damped scale. Direct DOM writes only.
  useEffect(() => {
    if (!live || reduced) return
    const style = settingsRef.current.style
    const ring = ringRef.current
    const dot = dotRef.current
    const ch = crossHRef.current
    const cv = crossVRef.current
    const pool = particlesRef.current

    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    const vel = { x: 0, y: 0 }
    let scaleCur = 1
    let pulseT = 0
    let last = performance.now()
    let raf = 0
    let spawnCursor = 0
    let lastSpawnX = -9999
    let lastSpawnY = -9999

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (style === "aura") {
        const dx = e.clientX - lastSpawnX
        const dy = e.clientY - lastSpawnY
        if (dx * dx + dy * dy > 36) {
          lastSpawnX = e.clientX
          lastSpawnY = e.clientY
          const p = pool[spawnCursor % pool.length]
          if (p) {
            spawnCursor += 1
            p.x = pos.x
            p.y = pos.y
            p.vx = 0
            p.vy = 0
            p.life = p.maxLife
            p.size = 3 + Math.random() * 3
            p.color = accent
            if (p.el) {
              p.el.style.width = `${p.size}px`
              p.el.style.height = `${p.size}px`
              p.el.style.borderRadius = "9999px"
              p.el.style.background = p.color
              p.el.style.boxShadow = `0 0 8px ${p.color}, 0 0 20px ${p.color}`
            }
          }
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      pulseT += dt

      // Ring spring-chase (semi-implicit Euler).
      const k = RING.stiffness * dt
      const d = Math.exp(-RING.damping * dt)
      vel.x = (vel.x + (target.x - pos.x) * k) * d
      vel.y = (vel.y + (target.y - pos.y) * k) * d
      pos.x += vel.x * dt
      pos.y += vel.y * dt

      // Scale is damped here — never a CSS transition that restarts.
      const scaleTarget = hoveringRef.current ? 1.6 : 1
      scaleCur += (scaleTarget - scaleCur) * (1 - Math.exp(-12 * dt))

      if (ring && style === "aura") {
        ring.style.transform =
          `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scaleCur.toFixed(3)})`
      }
      if (dot) {
        const dotScale = style === "pulse" ? 1 + 0.35 * Math.sin(pulseT * 5) : scaleCur
        dot.style.transform =
          `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${dotScale.toFixed(3)})`
      }
      if (ch && cv && style === "crosshair") {
        const t = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
        ch.style.transform = t
        cv.style.transform = t
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, reduced, settings.style, accent])

  // Hover detection without flapping: only toggle when the pointer truly
  // enters or leaves an interactive subtree (relatedTarget containment).
  useEffect(() => {
    if (!live || reduced) return
    const setHover = (v: boolean) => {
      if (hoveringRef.current !== v) {
        hoveringRef.current = v
        setHovering(v)
      }
    }
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR)
      if (t) setHover(true)
    }
    const onOut = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR)
      const to = (e.relatedTarget as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR)
      if (t && !to) setHover(false)
    }
    document.addEventListener("mouseover", onOver, { passive: true })
    document.addEventListener("mouseout", onOut, { passive: true })
    return () => {
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout", onOut)
    }
  }, [live, reduced])

  // Reduced-motion static fallback: dot + ring track the raw pointer
  // directly. No springs, no trail, no pulse. Crosshair arms are parked
  // under the pointer too when that style is selected.
  useEffect(() => {
    if (!live || !reduced) return
    const els = [ringRef.current, dotRef.current, crossHRef.current, crossVRef.current].filter(
      (el): el is HTMLDivElement => !!el,
    )
    if (els.length === 0) return
    const onMove = (e: PointerEvent) => {
      const t = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      for (const el of els) el.style.transform = t
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [live, reduced])

  // Fade out when the pointer leaves the window.
  useEffect(() => {
    if (!live) return
    const root = document.documentElement
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    root.addEventListener("mouseleave", onLeave)
    root.addEventListener("mouseenter", onEnter)
    return () => {
      root.removeEventListener("mouseleave", onLeave)
      root.removeEventListener("mouseenter", onEnter)
    }
  }, [live])

  if (!live) return null

  // Under reduced motion every style degrades to the same calm dot + ring.
  const showRing = settings.style === "aura" || reduced;
  const showCrosshair = settings.style === "crosshair" && !reduced;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-cyber-cursor
      data-cursor-style={settings.style}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      {showRing && (
        <div
          ref={ringRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            border: `1.5px solid ${accent}`,
            boxShadow: hovering
              ? `0 0 16px ${accent}, 0 0 40px ${accent}55`
              : `0 0 12px ${accent}88, 0 0 32px ${accent}44`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      {showCrosshair && (
        <>
          <div
            ref={crossHRef}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: CROSSHAIR_ARM * 2,
              height: 1.5,
              background: accent,
              boxShadow: `0 0 12px ${accent}99`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            ref={crossVRef}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: 1.5,
              height: CROSSHAIR_ARM * 2,
              background: accent,
              boxShadow: `0 0 12px ${accent}99`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </>
      )}
      {/* Precision dot — always rendered (tracks raw pointer, zero lag). */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: settings.style === "pulse" ? 10 : 5,
          height: settings.style === "pulse" ? 10 : 5,
          borderRadius: 9999,
          background: accent,
          boxShadow: `0 0 8px ${accent}, 0 0 18px ${accent}99`,
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Trail particle divs are appended to this container by the pool effect. */}
    </div>
  )
}
