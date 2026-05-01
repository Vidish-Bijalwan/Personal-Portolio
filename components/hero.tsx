"use client"

import { useEffect, useState } from "react"
import { ArrowDown, Github, Linkedin, Code } from "lucide-react"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation"

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.705-1.089-.705-1.767s.238-1.3.705-1.767L9.823 8.31c.467-.467 1.111-.662 1.824-.662s1.357.195 1.823.662l1.045 1.05-1.411 1.413-.9Z" fill="#ffa116"/>
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.705-1.089-.705-1.767s.238-1.3.705-1.767L9.823 8.31c.467-.467 1.111-.662 1.824-.662s1.357.195 1.823.662l1.045 1.05-1.411 1.413-1.045-1.05c-.156-.156-.37-.248-.59-.248-.22 0-.435.092-.591.248L5.452 12.64c-.155.156-.24.37-.24.59 0 .221.085.435.24.59l4.332 4.363c.156.155.37.248.591.248.22 0 .435-.093.59-.248l2.697-2.607 2.44 2.354Z"/>
      <path d="M20.25 10.362l-5.69-5.748c-.467-.467-1.111-.662-1.824-.662s-1.357.195-1.823.662L9.823 5.05l1.411 1.413 1.09-1.094c.156-.156.37-.248.59-.248s.435.092.591.248l5.69 5.748c.156.155.156.408 0 .563L16.29 14.8l1.41 1.413 2.55-2.585c.466-.467.705-1.089.705-1.767s-.239-1.3-.705-1.767Z"/>
    </svg>
  )
}
import AnimatedButton from "@/components/animated-button"
import { smoothScrollTo } from "@/utils/smooth-scroll"

import ParticleBackground from "@/components/particle-background"

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <ParticleBackground />
      <div className="container mx-auto px-4 z-10 py-20 md:py-0 pointer-events-none mb-10 mt-10">
        <div className="flex flex-col items-center text-center pointer-events-auto">
          <div className="mb-10 relative group">
            <div className="w-44 h-44 md:w-56 md:h-56 relative rounded-full overflow-hidden border border-primary/50 shadow-[0_0_40px_rgba(var(--primary),0.3)] transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(var(--primary),0.5)]">
              {/* Animated glass pane */}
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 transition-opacity duration-500 group-hover:opacity-0"></div>
              
              <Image 
                src="/profile.png" 
                alt="Vidish Bijalwan" 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100 z-0" 
                priority 
              />
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent z-20"></div>
            </div>
            
            {/* Outer pulsating rings */}
            <div className="absolute -inset-4 rounded-full border border-primary/20 scale-105 animate-ping opacity-20 -z-10" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl -z-20 transition-all group-hover:bg-primary/20 duration-700"></div>
          </div>

          <div>
            <h1 className="heading-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 font-serif mb-6">
              Vidish Bijalwan
            </h1>
          </div>

          <div className="mb-8 h-16 md:h-24">
            {isMounted && (
              <TypeAnimation
                sequence={[
                  "Machine Learning Engineer",
                  1000,
                  "Data Science Intern",
                  1000,
                  "Passionate about building production-ready ML solutions",
                  1000,
                ]}
                wrapper="h2"
                speed={50}
                repeat={Number.POSITIVE_INFINITY}
                className="text-xl md:text-3xl font-medium text-foreground/80"
              />
            )}
          </div>

          <div className="max-w-2xl text-center mb-8">
            <p className="body-lg text-foreground/70">
              I am an ML/DL Enthusiast with hands-on experience building predictive ML systems for churn prediction, revenue forecasting, computer vision, and optimization. I focus on analytical pipelines and business-oriented AI applications.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <AnimatedButton effect="ripple" onClick={() => smoothScrollTo("contact")}>
              Get in Touch
            </AnimatedButton>

            <AnimatedButton variant="outline" effect="shine" onClick={() => smoothScrollTo("projects")}>
              View Projects
            </AnimatedButton>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => openLink("https://github.com/Vidish-Bijalwan")}
              className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors relative group"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
              <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>

            <button
              onClick={() => openLink("https://www.linkedin.com/in/vidish-bijalwan")}
              className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors relative group"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
              <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>
            <button
              onClick={() => openLink("https://leetcode.com/u/vidishofficial")}
              className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors relative group"
              aria-label="LeetCode"
            >
              <LeetCodeIcon className="h-6 w-6" />
              <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => smoothScrollTo("about")}
          aria-label="Scroll down"
          className="p-2 rounded-full bg-background hover:bg-primary/10 transition-colors relative animate-bounce"
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      </div>
    </section>
  )
}
