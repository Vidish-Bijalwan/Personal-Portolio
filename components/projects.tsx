"use client"

import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"

const systems = [
  {
    id: "SYS-001",
    status: "DEPLOYED",
    title: "Saarthi — Assistive AI Device",
    domain: "ACCESSIBILITY · IOT · VISION",
    year: "2025",
    problem:
      "Visually and hearing impaired users lack affordable, portable assistive technology that operates in real-time without cloud dependency.",
    approach:
      "Built an edge-computed IoT solution using ESP32-CAM with onboard inference. Integrated LLM-based HCI for natural language interaction without latency.",
    stack: ["ESP32-CAM", "Computer Vision", "LLM Integration", "Python", "IoT"],
    architecture: [
      "INPUT   :: Camera feed (30fps) + Microphone",
      "PROC    :: ESP32-CAM onboard inference",
      "MODULE  :: Obstacle detection model",
      "MODULE  :: Voice command recognition",
      "LLM     :: Human-computer interaction layer",
      "OUTPUT  :: Audio feedback + haptic signal",
    ],
    results: "Won 1st place — SAARTHI Hackathon 2025, IEEE. Prototype demonstrated to 200+ attendees.",
    github: "https://github.com/Vidish-Bijalwan",
    live: null,
  },
  {
    id: "SYS-002",
    status: "DEPLOYED",
    title: "Customer Churn Prediction Engine",
    domain: "ML SYSTEMS · FORECASTING · ANALYTICS",
    year: "2025",
    problem:
      "Businesses lose revenue to preventable customer churn because attrition signals aren't identified early enough for intervention.",
    approach:
      "Ensemble ML pipeline combining XGBoost and LightGBM with SHAP-based explainability. Business-oriented output: probability scores + actionable retention signals.",
    stack: ["Python", "XGBoost", "LightGBM", "SHAP", "Pandas", "Scikit-learn"],
    architecture: [
      "INPUT   :: Customer behavioral + transaction data",
      "PROC    :: Feature engineering pipeline",
      "MODEL   :: XGBoost + LightGBM ensemble",
      "EXPLAIN :: SHAP value attribution",
      "OUTPUT  :: Churn probability + retention signals",
      "DEPLOY  :: FastAPI endpoint + Streamlit dashboard",
    ],
    results: "High-accuracy churn prediction. SHAP explanations surfaced top behavioral churn drivers.",
    github: "https://github.com/Vidish-Bijalwan/Churn-And-Revenue-Forecaster",
    live: null,
  },
  {
    id: "SYS-003",
    status: "LIVE",
    title: "Traffic Flow Optimizer",
    domain: "GRAPH ALGORITHMS · VISUALIZATION · WEB",
    year: "2024",
    problem:
      "Urban traffic congestion is poorly modeled by static route systems that don't account for real-time flow or graph topology.",
    approach:
      "Graph-based traffic simulation with Dijkstra + A* pathfinding. Interactive visualization built on Streamlit for real-time flow analysis and route optimization suggestions.",
    stack: ["Python", "Graph Algorithms", "Dijkstra", "A*", "Streamlit", "NetworkX"],
    architecture: [
      "INPUT   :: Road network graph (nodes + edges)",
      "PROC    :: Weighted graph construction",
      "ALGO    :: Dijkstra + A* pathfinding",
      "VIZ     :: NetworkX + Plotly render",
      "OUTPUT  :: Optimal routes + congestion map",
      "DEPLOY  :: Streamlit Cloud",
    ],
    results: "Live deployment on Streamlit. Handles large road networks with real-time re-routing.",
    github: "https://github.com/Vidish-Bijalwan/SMART-TRAFFIC-OPTIMIZER",
    live: "https://smart-traffic-optimizer-vidish-bijalwan.streamlit.app/",
  },
  {
    id: "SYS-004",
    status: "EXPERIMENTAL",
    title: "Sign Language Translator",
    domain: "COMPUTER VISION · NLP · ACCESSIBILITY",
    year: "2025",
    problem:
      "Sign language creates a communication barrier for hearing individuals interacting with deaf/hard-of-hearing communities.",
    approach:
      "Real-time hand gesture recognition via MediaPipe landmark detection fed into a classification model. NLP pipeline converts classified gestures to text and TTS speech output.",
    stack: ["Python", "MediaPipe", "Computer Vision", "NLP", "TTS", "OpenCV"],
    architecture: [
      "INPUT   :: Camera feed (real-time)",
      "PROC    :: MediaPipe hand landmark detection",
      "MODEL   :: Gesture classification (21 landmarks)",
      "NLP     :: Gesture-to-text mapping",
      "TTS     :: Text-to-speech synthesis",
      "OUTPUT  :: Spoken language output",
    ],
    results: "Achieved reliable gesture classification for ASL alphabet. Exploring continuous sign language recognition.",
    github: "https://github.com/Vidish-Bijalwan",
    live: null,
  },
  {
    id: "SYS-005",
    status: "DEPLOYED",
    title: "Healthcare Disease Prediction",
    domain: "ML · HEALTHCARE · RISK ANALYSIS",
    year: "2025",
    problem:
      "Early disease detection is limited by access to specialist analysis. ML can surface risk signals from standard medical data.",
    approach:
      "Multi-condition classification pipeline trained on medical datasets. Features engineered from vitals, lab values, and demographic factors. Calibrated probability outputs for clinical interpretability.",
    stack: ["Python", "Scikit-learn", "Pandas", "Feature Engineering", "Calibration"],
    architecture: [
      "INPUT   :: Patient vitals + lab values + demographics",
      "PROC    :: Medical feature engineering",
      "MODEL   :: Calibrated ensemble classifier",
      "OUTPUT  :: Disease risk probability scores",
      "INTERP  :: Feature importance + risk factors",
    ],
    results: "Multi-disease prediction with calibrated probabilities. Validated on held-out medical datasets.",
    github: "https://github.com/Vidish-Bijalwan",
    live: null,
  },
  {
    id: "SYS-006",
    status: "DEPLOYED",
    title: "House Price Prediction Engine",
    domain: "REGRESSION · REAL ESTATE · STREAMLIT",
    year: "2024",
    problem:
      "Real estate pricing is opaque. Buyers and sellers lack data-driven tools for fair market price estimation.",
    approach:
      "Random Forest Regressor trained on housing dataset features: area, rooms, location attributes. Interactive Streamlit UI for instant price estimation with feature sensitivity analysis.",
    stack: ["Python", "Random Forest", "Scikit-learn", "Streamlit", "Pandas"],
    architecture: [
      "INPUT   :: Area, bedrooms, bathrooms, features",
      "PROC    :: Feature normalization + encoding",
      "MODEL   :: Random Forest Regressor",
      "OUTPUT  :: Estimated price + confidence range",
      "DEPLOY  :: Streamlit interactive UI",
    ],
    results: "Live Streamlit deployment. Users interact with sliders for instant price estimation.",
    github: "https://github.com/Vidish-Bijalwan/House-Price-Prediction",
    live: null,
  },
]

const statusConfig: Record<string, { color: string; class: string }> = {
  LIVE:         { color: "hsl(145,50%,38%)", class: "status-active" },
  DEPLOYED:     { color: "hsl(38,90%,52%)",  class: "status-deployed" },
  EXPERIMENTAL: { color: "hsl(210,5%,48%)",  class: "status-experimental" },
}

function SystemPanel({ system, index }: { system: typeof systems[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const cfg = statusConfig[system.status]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      className="border-t border-[hsl(210,5%,14%)] group"
    >
      {/* Panel header — always visible */}
      <div
        className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[80px_1fr_auto_auto] gap-0 cursor-pointer hover:bg-[hsl(0,0%,7%)] transition-colors duration-250"
        onClick={() => setExpanded(!expanded)}
      >
        {/* System ID */}
        <div className="hidden md:flex items-start px-6 py-6 border-r border-[hsl(210,5%,12%)]">
          <span className="font-mono text-[10px] tracking-[0.1em] text-[hsl(210,5%,28%)] mt-0.5">
            {system.id}
          </span>
        </div>

        {/* Title block */}
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <span className={cfg.class} style={{ color: cfg.color }}>
              {system.status}
            </span>
            <span className="font-mono text-[10px] text-[hsl(210,5%,28%)]">
              · {system.year}
            </span>
            <span className="font-mono text-[9px] text-[hsl(210,5%,22%)] md:hidden">
              {system.id}
            </span>
          </div>
          <h3 className="text-[20px] md:text-[22px] font-semibold text-[hsl(40,10%,88%)] tracking-tight leading-snug mb-1 group-hover:text-white transition-colors duration-250">
            {system.title}
          </h3>
          <p className="font-mono text-[10px] tracking-[0.1em] text-[hsl(210,5%,38%)]">
            {system.domain}
          </p>
        </div>

        {/* Stack tags — desktop */}
        <div className="hidden md:flex flex-wrap items-start content-start gap-1.5 px-6 py-6 max-w-[240px]">
          {system.stack.slice(0, 4).map((tag) => (
            <span key={tag} className="sys-tag">{tag}</span>
          ))}
        </div>

        {/* Expand toggle */}
        <div className="flex items-center px-6 py-6">
          <motion.div
            animate={{ rotate: expanded ? 45 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-4 h-4 flex items-center justify-center text-[hsl(210,5%,38%)] group-hover:text-[hsl(38,90%,52%)] transition-colors duration-250"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Expanded panel — architecture deep-dive */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-[hsl(210,5%,14%)]"
              style={{ background: "hsl(0,0%,2%)" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_380px] gap-0">

                {/* Left — Narrative */}
                <div className="p-8 md:p-10 space-y-8">
                  <div>
                    <p className="mono-label mb-3">PROBLEM SPACE</p>
                    <p className="text-sm text-[hsl(210,5%,65%)] leading-relaxed">
                      {system.problem}
                    </p>
                  </div>
                  <div>
                    <p className="mono-label mb-3">ENGINEERING APPROACH</p>
                    <p className="text-sm text-[hsl(210,5%,65%)] leading-relaxed">
                      {system.approach}
                    </p>
                  </div>
                  <div>
                    <p className="mono-label mb-3">RESULTS</p>
                    <p className="text-sm text-[hsl(40,10%,88%)] leading-relaxed">
                      {system.results}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-6 pt-2">
                    <a
                      href={system.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] tracking-[0.1em] text-[hsl(210,5%,48%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250"
                    >
                      → SOURCE CODE
                    </a>
                    {system.live && (
                      <a
                        href={system.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] tracking-[0.1em] text-[hsl(145,50%,38%)] hover:text-[hsl(40,10%,88%)] transition-colors duration-250"
                      >
                        → LIVE SYSTEM
                      </a>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block bg-[hsl(210,5%,12%)]" />

                {/* Right — Architecture diagram */}
                <div className="p-8 md:p-10">
                  <p className="mono-label mb-4">SYSTEM ARCHITECTURE</p>
                  <div
                    className="rounded-sm p-4"
                    style={{ background: "hsl(0,0%,5%)", border: "1px solid hsl(210,5%,12%)" }}
                  >
                    <div className="space-y-2">
                      {system.architecture.map((line, i) => {
                        const [key, ...rest] = line.split("::")
                        const value = rest.join("::").trim()
                        const isHighlighted = key.trim() === "MODEL" || key.trim() === "LLM"
                        return (
                          <div key={i} className="flex gap-2">
                            <span
                              className="font-mono text-[10px] tracking-[0.06em] shrink-0 w-12"
                              style={{
                                color: isHighlighted ? "hsl(38,90%,52%)" : "hsl(210,5%,36%)",
                              }}
                            >
                              {key.trim()}
                            </span>
                            <span className="font-mono text-[10px] text-[hsl(210,5%,26%)]">::</span>
                            <span
                              className="font-mono text-[10px] leading-relaxed"
                              style={{
                                color: isHighlighted ? "hsl(40,10%,72%)" : "hsl(210,5%,58%)",
                              }}
                            >
                              {value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Stack tags */}
                  <p className="mono-label mt-6 mb-3">REQUIRES</p>
                  <div className="flex flex-wrap gap-1.5">
                    {system.stack.map((tag) => (
                      <span key={tag} className="sys-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Projects() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section
      id="systems"
      className="relative py-24 overflow-hidden"
      style={{ background: "hsl(0,0%,4%)" }}
    >
      {/* Environment — dense technical feel */}
      <div className="absolute inset-0 grid-overlay-fine opacity-40 pointer-events-none" />

      {/* Structural vertical line — right */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-[hsl(210,5%,10%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Section header */}
        <div ref={headerRef} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[hsl(38,90%,52%)]" />
            <span className="mono-label text-[10px]">ACT 03 · SYSTEMS ARCHITECTURE</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="heading-editorial text-[hsl(40,10%,88%)] max-w-xl"
          >
            Deployed intelligence systems.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-sm text-[hsl(210,5%,48%)] max-w-md font-light"
          >
            Each system includes problem framing, engineering approach, architecture diagram, and deployment state. Click any row to expand.
          </motion.p>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[80px_1fr_240px_48px] border-b border-[hsl(210,5%,18%)] pb-3 mb-0">
          <span className="mono-label px-6">ID</span>
          <span className="mono-label px-6">SYSTEM</span>
          <span className="mono-label px-6">STACK</span>
          <span className="mono-label px-6"> </span>
        </div>

        {/* System panels */}
        <div>
          {systems.map((sys, i) => (
            <SystemPanel key={sys.id} system={sys} index={i} />
          ))}
          <div className="border-t border-[hsl(210,5%,14%)]" />
        </div>

        {/* Bottom legend */}
        <div className="mt-12 flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(145,50%,38%)]" />
            <span className="font-mono text-[10px] tracking-[0.08em] text-[hsl(210,5%,38%)]">LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(38,90%,52%)]" />
            <span className="font-mono text-[10px] tracking-[0.08em] text-[hsl(210,5%,38%)]">DEPLOYED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(210,5%,48%)]" />
            <span className="font-mono text-[10px] tracking-[0.08em] text-[hsl(210,5%,38%)]">EXPERIMENTAL</span>
          </div>
          <div className="flex-1 h-px bg-[hsl(210,5%,12%)] ml-4" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,24%)]">
            REF–003 / SYSTEMS
          </span>
        </div>
      </div>
    </section>
  )
}
