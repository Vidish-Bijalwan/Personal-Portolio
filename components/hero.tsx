"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

const SYSTEM_LINES = [
  { label: "SYSTEM", value: "ML RESEARCH & ENGINEERING" },
  { label: "ENGINEER", value: "VIDISH BIJALWAN" },
  { label: "VERSION", value: "2026.05" },
  { label: "FOCUS", value: "ML · DEEP LEARNING · GENAI" },
  { label: "STATUS", value: "TRAINING IN PROGRESS" },
]

// Days elapsed since the 365-day Deep-ML challenge began (2026-09-23)
function deepmlDay(): number {
  const start = Date.UTC(2026, 8, 23)
  const day = Math.floor((Date.now() - start) / 86400000) + 1
  return Math.min(365, Math.max(1, day))
}

const BOOT_SEQUENCE = [
  "SYS > Loading model weights...",
  "SYS > Restoring optimizer state...",
  `SYS > Deep-ML streak: epoch ${deepmlDay()}/365 active`,
  "SYS > Syncing platform telemetry...",
  "SYS > All systems nominal. Begin scroll to enter.",
]

export default function Hero() {
  const [bootIndex, setBootIndex] = useState(0)
  const [bootComplete, setBootComplete] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [liveStats, setLiveStats] = useState<{ leetcode: number | null; ghEvents: number | null }>({
    leetcode: null,
    ghEvents: null,
  })
  const containerRef = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const translateY = useTransform(scrollY, [0, 400], [0, -40])

  // Boot sequence
  useEffect(() => {
    if (bootIndex < BOOT_SEQUENCE.length) {
      const delay = bootIndex === 0 ? 200 : 340
      const t = setTimeout(() => setBootIndex((i) => i + 1), delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setBootComplete(true)
        const t2 = setTimeout(() => setScanDone(true), 800)
        const t3 = setTimeout(() => setRevealed(true), 1000)
        return () => { clearTimeout(t2); clearTimeout(t3) }
      }, 200)
      return () => clearTimeout(t)
    }
  }, [bootIndex])

  // Live platform telemetry — best-effort, silent fallback
  useEffect(() => {
    fetch("/api/leetcode")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.solved === "number") {
          setLiveStats((s) => ({ ...s, leetcode: d.solved }))
        }
      })
      .catch(() => {})
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const n = d?.activityGrid?.reduce((a: number, c: { count: number }) => a + c.count, 0)
        if (typeof n === "number") setLiveStats((s) => ({ ...s, ghEvents: n }))
      })
      .catch(() => {})
  }, [])

  const scrollToNext = () => {
    const el = document.getElementById("evolution")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="signal"
      ref={containerRef}
      className="relative min-h-screen overflow-hidden grid-overlay"
      style={{ paddingTop: "52px" }}
    >
      {/* Deep atmospheric gradient — spatial depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, hsl(220 10% 24% / 0.55) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 10% 80%, hsl(38 95% 56% / 0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 0%, hsl(38 95% 56% / 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Vertical rule — left anchor */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-[hsl(220,10%,24%)] pointer-events-none" />

      {/* Coordinate system — top right */}
      <div className="absolute top-[72px] right-8 pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.1em] text-[hsl(220,8%,40%)]">
          28.67°N 77.41°E
        </p>
        <p className="font-mono text-[10px] tracking-[0.1em] text-[hsl(220,8%,33%)] mt-1">
          {new Date().toISOString().split("T")[0]}
        </p>
      </div>

      {/* Main layout — asymmetric */}
      <motion.div
        style={{ opacity, y: translateY }}
        className="relative z-10 min-h-screen flex flex-col justify-center"
      >
        <div className="max-w-[1400px] mx-auto w-full px-8 md:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-16 md:gap-24 items-center">

            {/* LEFT — Editorial display typography */}
            <div className="relative">
              {/* Section marker */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-6 h-px bg-[hsl(38,95%,56%)]" />
                <span className="mono-label text-[10px]">ACT 01 · SIGNAL DETECTED</span>
              </div>

              {/* Giant display name — the signature element */}
              <div className="overflow-hidden mb-2">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: bootComplete ? "0%" : "100%" }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  <h1 className="display-xl text-[hsl(40,12%,94%)] leading-none">
                    VIDISH
                  </h1>
                </motion.div>
              </div>

              <div className="overflow-hidden mb-8">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: bootComplete ? "0%" : "100%" }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                  <h1
                    className="display-xl leading-none"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "1px hsl(40 12% 58%)",
                    }}
                  >
                    BIJALWAN
                  </h1>
                </motion.div>
              </div>

              {/* Amber scan line — appears after name reveal */}
              <div className="relative h-px mb-8 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: bootComplete ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  className="h-px bg-gradient-to-r from-[hsl(38,95%,56%)] via-[hsl(38,95%,56%/0.6)] to-transparent"
                />
              </div>

              {/* Role statement */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: bootComplete ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-[hsl(220,8%,70%)] text-lg leading-relaxed max-w-[520px] mb-12 font-light"
              >
                Building neural systems — deep learning, GenAI agents, and{" "}
                <span className="text-[hsl(40,12%,94%)]">retrieval infrastructure</span>{" "}
                that bridges research and production.
              </motion.p>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 12 }}
                transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-8"
              >
                <button
                  onClick={scrollToNext}
                  className="group flex items-center gap-3 font-mono text-xs tracking-[0.12em] text-[hsl(40,12%,94%)] hover:text-[hsl(38,95%,56%)] transition-colors duration-250"
                >
                  <span className="w-8 h-px bg-current transition-all duration-400 group-hover:w-16" />
                  ENTER ARCHIVE
                </button>

                <button
                  onClick={() => window.open("https://github.com/Vidish-Bijalwan", "_blank", "noopener,noreferrer")}
                  className="font-mono text-xs tracking-[0.12em] text-[hsl(220,8%,60%)] hover:text-[hsl(40,12%,94%)] transition-colors duration-250"
                >
                  → GITHUB
                </button>

                <button
                  onClick={() => window.open("https://www.linkedin.com/in/vidish-bijalwan", "_blank", "noopener,noreferrer")}
                  className="font-mono text-xs tracking-[0.12em] text-[hsl(220,8%,60%)] hover:text-[hsl(40,12%,94%)] transition-colors duration-250"
                >
                  → LINKEDIN
                </button>
              </motion.div>

              {/* Live telemetry chips */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 12 }}
                transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-2.5 mt-10"
              >
                {[
                  { label: "DEEP-ML", value: `DAY ${deepmlDay()}/365`, live: true },
                  { label: "LEETCODE", value: liveStats.leetcode !== null ? `${liveStats.leetcode} SOLVED` : "···", live: liveStats.leetcode !== null },
                  { label: "GITHUB", value: liveStats.ghEvents !== null ? `${liveStats.ghEvents} EVENTS / 28D` : "···", live: liveStats.ghEvents !== null },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[hsl(220,10%,24%)] bg-[hsl(222,14%,9%)]"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: chip.live ? "hsl(145,55%,45%)" : "hsl(220,8%,40%)",
                        boxShadow: chip.live ? "0 0 6px hsl(145,55%,45%,0.7)" : "none",
                      }}
                    />
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[hsl(220,8%,52%)]">
                      {chip.label}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[hsl(38,95%,56%)]">
                      {chip.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — System annotation panel */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: bootComplete ? 1 : 0, x: bootComplete ? 0 : 24 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Boot terminal */}
              <div
                className="surface-elevated p-6 mb-4"
                style={{ borderLeft: "2px solid hsl(38 95% 56% / 0.5)" }}
              >
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[hsl(220,10%,24%)]">
                  <div className="w-2 h-2 rounded-full bg-[hsl(38,95%,56%)] animate-pulse-amber" />
                  <span className="font-mono text-[10px] tracking-[0.15em] text-[hsl(220,8%,60%)]">
                    SYSTEM BOOT LOG
                  </span>
                </div>
                <div className="space-y-1.5">
                  {BOOT_SEQUENCE.slice(0, bootIndex).map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-[11px] text-[hsl(220,8%,60%)] leading-relaxed"
                    >
                      <span className="text-[hsl(38,95%,56%/0.7)]">›</span> {line.replace("SYS > ", "")}
                    </motion.p>
                  ))}
                  {bootIndex < BOOT_SEQUENCE.length && (
                    <span className="inline-block w-1.5 h-3 bg-[hsl(38,95%,56%)] animate-blink ml-1" />
                  )}
                </div>
              </div>

              {/* System specification table */}
              <div className="surface-panel py-0">
                {SYSTEM_LINES.map((line, i) => (
                  <motion.div
                    key={line.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: bootComplete ? 1 : 0 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                    className="flex items-baseline justify-between px-6 py-3 border-b border-[hsl(220,10%,22%)] last:border-b-0"
                  >
                    <span className="mono-label text-[10px]">{line.label}</span>
                    <span className={`font-mono text-[11px] tracking-[0.05em] ${
                      line.label === "STATUS"
                        ? "text-[hsl(145,55%,45%)]"
                        : line.label === "ENGINEER"
                        ? "text-[hsl(40,12%,94%)]"
                        : "text-[hsl(220,8%,78%)]"
                    }`}>
                      {line.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Floating coordinate label */}
              <p className="mt-4 text-right font-mono text-[10px] text-[hsl(220,8%,36%)]">
                REF–001 / SIGNAL
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom — scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: bootComplete ? 1 : 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-8 flex items-center gap-4"
        >
          <button
            onClick={scrollToNext}
            className="group flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-[hsl(220,8%,50%)] hover:text-[hsl(220,8%,70%)] transition-colors duration-400"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-[hsl(220,8%,40%)] group-hover:bg-[hsl(38,95%,56%)] transition-colors duration-400"
            />
            SCROLL TO ENTER SYSTEM
          </button>
        </motion.div>

        {/* Right edge — vertical system ID */}
        <div
          className="absolute right-8 bottom-24 pointer-events-none"
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="font-mono text-[9px] tracking-[0.25em] text-[hsl(220,8%,30%)]">
            ML · DL · GENAI — v2026
          </span>
        </div>
      </motion.div>
    </section>
  )
}
