"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

const FUTURE_SYSTEMS = [
  {
    id: "FUT-001",
    status: "PLANNED",
    title: "Autonomous AI Agents with Persistent Memory",
    description:
      "Agents that accumulate, index, and retrieve context across sessions. Not stateless chatbots — true reasoning systems with episodic memory architectures.",
    horizon: "NEAR",
  },
  {
    id: "FUT-002",
    status: "RESEARCHING",
    title: "Multimodal Retrieval Infrastructure",
    description:
      "Unified retrieval systems across text, image, and structured data. Cross-modal embedding spaces for RAG pipelines that understand context beyond text.",
    horizon: "MID",
  },
  {
    id: "FUT-003",
    status: "PLANNED",
    title: "Open-Source RAG Framework",
    description:
      "A modular, composable retrieval-augmented generation toolkit designed for production. Observable, debuggable, fast.",
    horizon: "MID",
  },
  {
    id: "FUT-004",
    status: "EXPLORING",
    title: "AI-Native Developer Tooling",
    description:
      "Development environments designed from the ground up around AI assistance — not retrofitted. Interfaces that think alongside the engineer.",
    horizon: "FAR",
  },
  {
    id: "FUT-005",
    status: "EXPLORING",
    title: "Intelligence Augmentation Interfaces",
    description:
      "Systems that extend human reasoning rather than replace it. AI that surfaces the right information at the right moment — invisible until needed, powerful when activated.",
    horizon: "FAR",
  },
]

const horizonColors: Record<string, string> = {
  NEAR: "hsl(145,50%,38%)",
  MID: "hsl(38,90%,52%)",
  FAR: "hsl(210,5%,48%)",
}

const statusColors: Record<string, string> = {
  PLANNED: "hsl(210,5%,48%)",
  RESEARCHING: "hsl(38,90%,52%)",
  EXPLORING: "hsl(210,5%,38%)",
}

function FutureSystemRow({ sys, index }: { sys: typeof FUTURE_SYSTEMS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
      className="border-t border-[hsl(210,5%,14%)] py-8 grid grid-cols-1 md:grid-cols-[100px_1fr_auto] gap-4 md:gap-8 group hover:bg-[hsl(0,0%,5%)] transition-colors duration-250 -mx-8 md:-mx-16 px-8 md:px-16"
    >
      {/* ID + horizon */}
      <div className="flex md:flex-col items-start gap-3 md:gap-1">
        <span className="font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,24%)]">{sys.id}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: horizonColors[sys.horizon] }} />
          <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: horizonColors[sys.horizon] }}>
            {sys.horizon}
          </span>
        </div>
      </div>
      {/* Content */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[10px] tracking-[0.08em]" style={{ color: statusColors[sys.status] }}>
            {sys.status}
          </span>
        </div>
        <h3 className="text-[18px] font-semibold text-[hsl(40,10%,78%)] group-hover:text-[hsl(40,10%,92%)] transition-colors duration-250 leading-snug mb-2 tracking-tight">
          {sys.title}
        </h3>
        <p className="text-sm text-[hsl(210,5%,50%)] leading-relaxed max-w-xl">{sys.description}</p>
      </div>
      {/* Arrow */}
      <div className="hidden md:flex items-center text-[hsl(210,5%,24%)] group-hover:text-[hsl(38,90%,52%)] transition-colors duration-400">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 8h12M9 4l4 4-4 4" />
        </svg>
      </div>
    </motion.div>
  )
}

export default function Contact() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open email client as fallback
    const subject = encodeURIComponent(`Message from ${formState.name}`)
    const body = encodeURIComponent(`${formState.message}\n\n— ${formState.name} (${formState.email})`)
    window.location.href = `mailto:vidishbijalwan@gmail.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <section
      id="future"
      className="relative py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(0,0%,4%) 0%, hsl(0,0%,3%) 60%, hsl(0,0%,2%) 100%)",
      }}
    >
      {/* Environment — minimal, philosophical, open-ended */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, hsl(38 90% 52% / 0.2), transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle at bottom left, hsl(38 90% 52% / 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Section header */}
        <div ref={headerRef} className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[hsl(38,90%,52%)]" />
            <span className="mono-label text-[10px]">ACT 05 · FUTURE SYSTEMS</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="heading-editorial text-[hsl(40,10%,88%)] max-w-2xl leading-tight"
          >
            Engineering the next layer of intelligence.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 text-base text-[hsl(210,5%,48%)] max-w-lg font-light leading-relaxed"
          >
            These are not products. These are systems on the build list — a map of where engineering intent is pointing.
          </motion.p>
        </div>

        {/* Future systems list */}
        <div className="mb-24">
          <div className="border-b border-[hsl(210,5%,14%)]">
            {FUTURE_SYSTEMS.map((sys, i) => (
              <FutureSystemRow key={sys.id} sys={sys} index={i} />
            ))}
          </div>
        </div>

        {/* Horizon legend */}
        <div className="flex items-center gap-8 mb-24">
          {[{ label: "NEAR · 0–12mo", key: "NEAR" }, { label: "MID · 1–3yr", key: "MID" }, { label: "FAR · 3yr+", key: "FAR" }].map(({ label, key }) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: horizonColors[key] }} />
              <span className="font-mono text-[10px] tracking-[0.08em] text-[hsl(210,5%,38%)]">{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[hsl(210,5%,12%)] mb-20" />

        {/* Contact section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-24">
          {/* Left — contact channels */}
          <div>
            <p className="mono-label mb-8">OPEN CHANNELS</p>
            <div className="space-y-0 mb-12">
              {[
                { label: "EMAIL", value: "vidishbijalwan@gmail.com", href: "mailto:vidishbijalwan@gmail.com" },
                { label: "GITHUB", value: "github.com/Vidish-Bijalwan", href: "https://github.com/Vidish-Bijalwan" },
                { label: "LINKEDIN", value: "linkedin.com/in/vidish-bijalwan", href: "https://www.linkedin.com/in/vidish-bijalwan" },
                { label: "LEETCODE", value: "leetcode.com/u/vidishofficial", href: "https://leetcode.com/u/vidishofficial" },
              ].map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-4 border-b border-[hsl(210,5%,12%)] group hover:border-[hsl(38,90%,52%,0.3)] transition-colors duration-250"
                >
                  <span className="mono-label text-[10px]">{ch.label}</span>
                  <span className="font-mono text-[12px] text-[hsl(210,5%,52%)] group-hover:text-[hsl(38,90%,52%)] transition-colors duration-250">
                    → {ch.value}
                  </span>
                </a>
              ))}
            </div>

            {/* Resume */}
            <a
              href="/vidish_resume6sem.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] text-[hsl(40,10%,78%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250 border border-[hsl(210,5%,18%)] hover:border-[hsl(38,90%,52%,0.4)] px-6 py-3 transition-colors duration-250"
            >
              <span>↓ DOWNLOAD RESUME</span>
            </a>
          </div>

          {/* Right — message form */}
          <div>
            <p className="mono-label mb-8">SEND MESSAGE</p>
            {submitted ? (
              <div
                className="p-8 text-center"
                style={{
                  border: "1px solid hsl(145,50%,38%,0.3)",
                  background: "hsl(145,50%,38%,0.04)",
                }}
              >
                <p className="font-mono text-sm text-[hsl(145,50%,38%)]">Message transmitted.</p>
                <p className="mono-label mt-2">CHANNEL OPEN</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "IDENTIFIER", type: "text", placeholder: "Your name" },
                  { key: "email", label: "RETURN ADDRESS", type: "email", placeholder: "your@email.com" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mono-label block mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={formState[field.key as keyof typeof formState]}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, [field.key]: e.target.value }))
                      }
                      className="w-full px-4 py-3 font-mono text-sm text-[hsl(40,10%,80%)] placeholder:text-[hsl(210,5%,30%)] outline-none focus:border-[hsl(38,90%,52%,0.5)] transition-colors duration-250"
                      style={{
                        background: "hsl(0,0%,6%)",
                        border: "1px solid hsl(210,5%,14%)",
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label className="mono-label block mb-2">MESSAGE</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Your message..."
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    className="w-full px-4 py-3 font-mono text-sm text-[hsl(40,10%,80%)] placeholder:text-[hsl(210,5%,30%)] outline-none resize-none focus:border-[hsl(38,90%,52%,0.5)] transition-colors duration-250"
                    style={{
                      background: "hsl(0,0%,6%)",
                      border: "1px solid hsl(210,5%,14%)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 font-mono text-[12px] tracking-[0.15em] text-[hsl(0,0%,4%)] bg-[hsl(38,90%,52%)] hover:bg-[hsl(38,90%,45%)] transition-colors duration-250"
                >
                  TRANSMIT →
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-16 font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,20%)] text-right">
          REF–005 / FUTURE
        </p>
      </div>
    </section>
  )
}
