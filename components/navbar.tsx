"use client"

import { useEffect, useState } from "react"
import { motion, useScroll } from "framer-motion"

const navItems = [
  { label: "SIGNAL", href: "#signal" },
  { label: "EVOLUTION", href: "#evolution" },
  { label: "SYSTEMS", href: "#systems" },
  { label: "LAB", href: "#lab" },
  { label: "FUTURE", href: "#future" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)

      // Determine active section
      const sections = navItems.map((item) => item.href.slice(1))
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(section)
            return
          }
        }
      }
      setActiveSection("")
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (href: string) => {
    const id = href.slice(1)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      setMobileOpen(false)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${
          scrolled
            ? "bg-[hsl(0,0%,4%/0.92)] backdrop-blur-sm border-b border-[hsl(210,5%,14%)]"
            : "bg-transparent"
        }`}
        style={{ height: "52px" }}
      >
        <div className="max-w-[1400px] mx-auto px-8 h-full flex items-center justify-between">
          {/* Monogram */}
          <button
            onClick={() => scrollTo("#signal")}
            className="font-mono text-xs tracking-[0.2em] text-[hsl(40,10%,88%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250 uppercase"
          >
            VB
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.slice(1)
              return (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="relative group"
                >
                  <span
                    className={`font-mono text-[11px] tracking-[0.15em] transition-colors duration-250 ${
                      isActive
                        ? "text-[hsl(38,90%,52%)]"
                        : "text-[hsl(210,5%,58%)] hover:text-[hsl(40,10%,88%)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[2px] left-0 right-0 h-px bg-[hsl(38,90%,52%)]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* System status */}
          <div className="hidden md:flex items-center gap-2">
            <span className="status-active text-[10px]">ONLINE</span>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden font-mono text-[11px] tracking-[0.1em] text-[hsl(210,5%,58%)] hover:text-[hsl(40,10%,88%)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] bg-[hsl(0,0%,4%)] pt-[52px] flex flex-col"
        >
          <div className="border-b border-[hsl(210,5%,14%)]" />
          <div className="px-8 py-12 flex flex-col gap-8">
            {navItems.map((item, i) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => scrollTo(item.href)}
                className="text-left font-mono text-[13px] tracking-[0.15em] text-[hsl(210,5%,58%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250"
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
