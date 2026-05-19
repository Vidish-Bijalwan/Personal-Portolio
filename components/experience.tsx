"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

const timelineEvents = [
  {
    year: "2023",
    month: "AUG",
    id: "EVT-001",
    type: "INIT",
    title: "System Boot",
    subtitle: "B.Tech CSE · Graphic Era Hill University",
    body: "Enrolled in Computer Science & Engineering. First exposure to Python and algorithmic thinking. Curiosity about AI systems begins forming.",
    tags: ["Python", "Algorithms", "CS Foundations"],
    signal: "CURIOSITY",
    photo: true,
  },
  {
    year: "2024",
    month: "MAY",
    id: "EVT-002",
    type: "CERT",
    title: "Generative AI & LangChain",
    subtitle: "Udemy Certification",
    body: "Deep dive into LLM orchestration, prompt engineering, and chain-based AI workflows. First contact with retrieval-augmented generation patterns.",
    tags: ["LangChain", "LLMs", "RAG", "Prompt Engineering"],
    signal: "UPGRADE",
  },
  {
    year: "2024",
    month: "OCT",
    id: "EVT-003",
    type: "COMPETE",
    title: "Top 5 — Avishkar 2024",
    subtitle: "Graphic Era Hill University",
    body: "Engineered a real-time blood donor matching platform using location and blood-group algorithms. Presented directly to medical professionals and judges. First experience shipping under competitive pressure.",
    tags: ["Matching Algorithms", "Web Dev", "Healthcare"],
    signal: "MILESTONE",
  },
  {
    year: "2024",
    month: "OCT",
    id: "EVT-004",
    type: "CERT",
    title: "Innovation & Business Models",
    subtitle: "NPTEL · IIT Roorkee",
    body: "Explored how engineering systems translate into business value. Developed frameworks for thinking about AI products beyond technical implementation.",
    tags: ["Product Thinking", "Innovation", "IIT Roorkee"],
    signal: "EXPAND",
  },
  {
    year: "2025",
    month: "JUN",
    id: "EVT-005",
    type: "CERT",
    title: "10+ End-to-End ML Projects",
    subtitle: "Udemy Bootcamp",
    body: "Systematic deep-dive into production ML: churn prediction, revenue forecasting, computer vision pipelines, model evaluation and deployment on Streamlit and FastAPI.",
    tags: ["Scikit-learn", "XGBoost", "FastAPI", "Streamlit", "PyTorch"],
    signal: "UPGRADE",
  },
  {
    year: "2025",
    month: "AUG",
    id: "EVT-006",
    type: "CERT",
    title: "DevOps on AWS",
    subtitle: "AWS Training & Certification",
    body: "Infrastructure thinking enters the stack. CI/CD pipelines, containerization, cloud deployment patterns — shifting toward systems engineering mindset.",
    tags: ["AWS", "DevOps", "CI/CD", "Cloud"],
    signal: "INFRASTRUCTURE",
  },
  {
    year: "2025",
    month: "NOV",
    id: "EVT-007",
    type: "WIN",
    title: "🏆 Winner — SAARTHI Hackathon",
    subtitle: "IEEE · Graphic Era Hill University · Best Startup Idea",
    body: "1st place. Built an ESP32-CAM based assistive AI device for visually and hearing impaired users — real-time obstacle detection, voice command interface, and LLM-based human-computer interaction. From concept to working prototype in 24 hours.",
    tags: ["ESP32-CAM", "Computer Vision", "LLM Integration", "IoT", "Accessibility"],
    signal: "WIN",
    proof: "/media__1777568972995.png",
  },
  {
    year: "2026",
    month: "MAR",
    id: "EVT-008",
    type: "CERT",
    title: "Robotics & Controls Job Simulation",
    subtitle: "Johnson & Johnson · Forage",
    body: "Applied control systems thinking to robotics simulation. Cross-disciplinary engineering — from AI to physical systems.",
    tags: ["Robotics", "Control Systems", "J&J"],
    signal: "EXPAND",
  },
  {
    year: "2026",
    month: "MAY",
    id: "EVT-009",
    type: "WIN",
    title: "🏆 Free Fire Esports Champion",
    subtitle: "IEEE · Team Lead (IGL)",
    body: "Led 4-player squad to championship victory. Strategic execution under pressure, real-time decision making, team coordination — the same skills that transfer to engineering leadership.",
    tags: ["Team Leadership", "Strategy", "IGL"],
    signal: "WIN",
    proof: "https://www.instagram.com/p/DXtGB-hkQD4/?img_index=5",
  },
  {
    year: "2026",
    month: "NOW",
    id: "EVT-010",
    type: "ACTIVE",
    title: "Building Intelligence Infrastructure",
    subtitle: "Active Systems · Ongoing",
    body: "Exploring RAG pipelines, vector databases, retrieval systems. Building toward autonomous AI agents with persistent memory. This portfolio is a live artifact of that evolution.",
    tags: ["RAG", "Vector DBs", "AI Agents", "Retrieval", "Active"],
    signal: "ACTIVE",
  },
]

const signalColors: Record<string, string> = {
  CURIOSITY:      "hsl(210,5%,48%)",
  UPGRADE:        "hsl(38,90%,52%)",
  MILESTONE:      "hsl(38,90%,52%)",
  EXPAND:         "hsl(210,5%,58%)",
  INFRASTRUCTURE: "hsl(38,90%,52%)",
  WIN:            "hsl(40,10%,88%)",
  ACTIVE:         "hsl(145,50%,38%)",
  INIT:           "hsl(210,5%,58%)",
}

const typeLabels: Record<string, string> = {
  INIT:    "INIT",
  CERT:    "CERT",
  COMPETE: "COMPETITION",
  WIN:     "VICTORY",
  ACTIVE:  "ACTIVE",
}

function TimelineNode({ event, index }: { event: typeof timelineEvents[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const isLeft = index % 2 === 0

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_40px_1fr] md:grid-cols-[1fr_48px_1fr] gap-0">
      {/* Left content */}
      <div className={`pb-16 ${isLeft ? "pr-8 md:pr-12" : "pr-8 md:pr-12 opacity-0 pointer-events-none"}`}>
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
          >
            <NodeContent event={event} align="right" />
          </motion.div>
        )}
      </div>

      {/* Spine + Node */}
      <div className="flex flex-col items-center">
        <div className="h-full w-px bg-[hsl(210,5%,14%)]" />
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 + 0.1 }}
          className="shrink-0 w-3 h-3 rounded-full border-2 z-10 my-2"
          style={{
            borderColor: signalColors[event.signal] ?? "hsl(210,5%,28%)",
            backgroundColor:
              event.signal === "ACTIVE"
                ? "hsl(145,50%,38%)"
                : event.type === "WIN"
                ? "hsl(40,10%,88%)"
                : "hsl(0,0%,4%)",
            boxShadow:
              event.signal === "ACTIVE"
                ? "0 0 8px hsl(145 50% 38% / 0.5)"
                : event.type === "WIN"
                ? "0 0 8px hsl(40 10% 88% / 0.3)"
                : "none",
          }}
        />
      </div>

      {/* Right content */}
      <div className={`pb-16 ${!isLeft ? "pl-8 md:pl-12" : "pl-8 md:pl-12 opacity-0 pointer-events-none"}`}>
        {!isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
          >
            <NodeContent event={event} align="left" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function NodeContent({ event, align }: { event: typeof timelineEvents[0]; align: "left" | "right" }) {
  const hasProof = "proof" in event && event.proof
  const hasPhoto = "photo" in event && event.photo

  return (
    <div className={`${align === "right" ? "text-right" : "text-left"}`}>
      {/* Year / timestamp */}
      <div className={`flex items-center gap-2 mb-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
        <span className="font-mono text-[10px] tracking-[0.15em] text-[hsl(210,5%,28%)]">
          {event.month} {event.year}
        </span>
        <span className="mono-label text-[9px]">·</span>
        <span
          className="font-mono text-[9px] tracking-[0.12em] uppercase"
          style={{ color: signalColors[event.signal] }}
        >
          {typeLabels[event.type]}
        </span>
      </div>

      {/* Event ID */}
      <span className="font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,22%)] block mb-1">
        {event.id}
      </span>

      {/* Title */}
      <h3 className="text-[18px] font-semibold leading-snug text-[hsl(40,10%,88%)] mb-1 tracking-tight">
        {event.title}
      </h3>

      {/* Subtitle */}
      <p className="font-mono text-[11px] tracking-[0.05em] text-[hsl(210,5%,48%)] mb-3">
        {event.subtitle}
      </p>

      {/* Profile photo at init node */}
      {hasPhoto && (
        <div className={`mb-3 ${align === "right" ? "flex justify-end" : ""}`}>
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[hsl(210,5%,18%)] grayscale">
            <Image src="/profile.png" alt="Vidish Bijalwan" width={56} height={56} className="object-cover" />
          </div>
        </div>
      )}

      {/* Body */}
      <p className="text-sm text-[hsl(210,5%,58%)] leading-relaxed mb-3">
        {event.body}
      </p>

      {/* Tags */}
      <div className={`flex flex-wrap gap-1.5 mb-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
        {event.tags.map((tag) => (
          <span key={tag} className="sys-tag">{tag}</span>
        ))}
      </div>

      {/* Proof link */}
      {hasProof && (
        <a
          href={event.proof as string}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[hsl(38,90%,52%)] hover:text-[hsl(40,10%,88%)] transition-colors duration-250 mt-1"
        >
          → VIEW PROOF
        </a>
      )}
    </div>
  )
}

export default function Experience() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section
      id="evolution"
      className="relative py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(0,0%,4%) 0%, hsl(0,0%,6%) 40%, hsl(0,0%,4%) 100%)",
      }}
    >
      {/* Environment — archival texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 47px, hsl(210 5% 14% / 0.3) 47px, hsl(210 5% 14% / 0.3) 48px)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Section header */}
        <div ref={headerRef} className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[hsl(38,90%,52%)]" />
            <span className="mono-label text-[10px]">ACT 02 · EVOLUTION OF A BUILDER</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="heading-editorial text-[hsl(40,10%,88%)] max-w-lg"
          >
            A documentary of engineering evolution.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-sm text-[hsl(210,5%,48%)] max-w-md font-light"
          >
            From early curiosity to active infrastructure building. Each node is a system checkpoint.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {timelineEvents.map((event, i) => (
            <TimelineNode key={event.id} event={event} index={i} />
          ))}

          {/* End cap */}
          <div className="flex flex-col items-center" style={{ marginLeft: "calc(50% - 20px)", width: "40px" }}>
            <div className="w-px h-8 bg-[hsl(210,5%,14%)]" />
            <div className="font-mono text-[9px] tracking-[0.15em] text-[hsl(210,5%,22%)] mt-2">
              ONGOING
            </div>
          </div>
        </div>

        {/* Certifications row */}
        <div className="mt-24 pt-16 border-t border-[hsl(210,5%,14%)]">
          <div className="flex items-center gap-3 mb-10">
            <span className="mono-label text-[10px]">CERTIFICATION REGISTRY</span>
            <div className="flex-1 h-px bg-[hsl(210,5%,14%)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(210,5%,14%)]">
            {[
              { title: "Generative AI & LangChain", issuer: "Udemy", date: "May 2024" },
              { title: "Innovation & Business Models", issuer: "NPTEL · IIT Roorkee", date: "Oct 2024" },
              { title: "10+ End-to-End ML Projects", issuer: "Udemy", date: "Jun 2025" },
              { title: "DevOps on AWS", issuer: "AWS Training & Certification", date: "Aug 2025" },
              { title: "Robotics & Controls Job Simulation", issuer: "Johnson & Johnson · Forage", date: "Mar 2026" },
            ].map((cert) => (
              <div key={cert.title} className="bg-[hsl(0,0%,4%)] p-6 hover:bg-[hsl(0,0%,7%)] transition-colors duration-250 group">
                <p className="font-mono text-[10px] tracking-[0.1em] text-[hsl(210,5%,32%)] mb-2">{cert.date}</p>
                <p className="text-sm text-[hsl(40,10%,88%)] font-medium leading-snug mb-1 group-hover:text-[hsl(38,90%,52%)] transition-colors duration-250">
                  {cert.title}
                </p>
                <p className="font-mono text-[11px] text-[hsl(210,5%,42%)]">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
