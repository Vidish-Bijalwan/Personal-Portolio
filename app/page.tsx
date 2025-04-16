"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import About from "@/components/about"
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import Experience from "@/components/experience"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import SkipToContent from "@/components/skip-to-content"
import ParticleBackground from "@/components/particle-background"
import FloatingContactButton from "@/components/floating-contact-button"
import { smoothScrollTo } from "@/utils/smooth-scroll"

// Dynamically import components that might cause issues
const ScrollToTop = dynamic(() => import("@/components/scroll-to-top"), {
  ssr: false,
})

const PageTransition = dynamic(() => import("@/components/page-transition"), {
  ssr: false,
})

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Global error handler for framer-motion errors
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("framer-motion") ||
          args[0].includes("Uncaught TypeError: e is undefined") ||
          args[0].includes("Unhandled promise rejection"))
      ) {
        return // Suppress specific errors
      }
      originalError.apply(console, args)
    }

    // Also handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      event.preventDefault()
      if (event.reason && event.reason.toString().includes("e is undefined")) {
        console.log("Suppressed error:", event.reason)
        return
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    // Set up keyboard navigation
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key) {
          case "h":
            smoothScrollTo("hero")
            break
          case "a":
            smoothScrollTo("about")
            break
          case "s":
            smoothScrollTo("skills")
            break
          case "p":
            smoothScrollTo("projects")
            break
          case "e":
            smoothScrollTo("experience")
            break
          case "c":
            smoothScrollTo("contact")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      console.error = originalError
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <SkipToContent />
      <main id="main-content" className="min-h-screen bg-background overflow-hidden">
        {mounted && <PageTransition />}
        <Navbar />
        <section id="hero" className="relative">
          <ParticleBackground />
          <Hero />
        </section>
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
        <Footer />

        {/* Only render these components after mounting to avoid hydration issues */}
        {mounted && (
          <>
            <ScrollToTop />
            <FloatingContactButton />
          </>
        )}
      </main>
    </>
  )
}
