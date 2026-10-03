"use client"

import dynamic from "next/dynamic"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Experience from "@/components/experience"
import Projects from "@/components/projects"
import EngineeringLab from "@/components/engineering-lab"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

const SkipToContent = dynamic(() => import("@/components/skip-to-content"), { ssr: false })

export default function Home() {
  return (
    <>
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="min-h-screen bg-[hsl(222,14%,10%)] overflow-hidden">
        {/* ACT 1 — Signal Detected */}
        <Hero />

        {/* ACT 2 — Evolution of a Builder */}
        <Experience />

        {/* ACT 3 — Systems Architecture */}
        <Projects />

        {/* ACT 4 — Live Engineering Lab */}
        <EngineeringLab />

        {/* ACT 5 — Future Systems + Contact */}
        <Contact />

        <Footer />
      </main>
    </>
  )
}
