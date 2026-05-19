"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function AssessmentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  const scrollToAssessment = () => {
    const el = document.getElementById("assessment")
    if (el) el.scrollIntoView({ behavior: "smooth" })
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-[64px] left-1/2 z-[150] w-[calc(100%-64px)] max-w-lg"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 gap-4"
            style={{
              background: "hsl(0,0%,8%)",
              border: "1px solid hsl(210,5%,18%)",
              borderLeft: "2px solid hsl(38,90%,52%)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(38,90%,52%)] shrink-0 animate-pulse-amber" />
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.08em] text-[hsl(40,10%,80%)]">
                  PESE600 SESSIONAL ASSESSMENT
                </p>
                <p className="font-mono text-[10px] text-[hsl(210,5%,42%)] truncate">
                  Evaluating this portfolio? View submission materials.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={scrollToAssessment}
                className="font-mono text-[10px] tracking-[0.1em] text-[hsl(38,90%,52%)] hover:text-[hsl(40,10%,88%)] transition-colors duration-250 whitespace-nowrap"
              >
                → VIEW
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-[hsl(210,5%,36%)] hover:text-[hsl(210,5%,60%)] transition-colors duration-250"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
