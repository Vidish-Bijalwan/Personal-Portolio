"use client"

import { useEffect, useState } from "react"
import { ArrowDown, Github, Linkedin } from "lucide-react"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation"
import AnimatedButton from "@/components/animated-button"
import { smoothScrollTo } from "@/utils/smooth-scroll"

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 z-10 py-20 md:py-0">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 relative">
            <div className="w-40 h-40 md:w-48 md:h-48 relative rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
              <Image src="/profile_photo.png" alt="Vidish Bijalwan" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
            </div>
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl -z-10 animate-pulse"></div>
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
                  "AI/ML Enthusiast & Aspiring AI Security Specialist",
                  1000,
                  "B.Tech Student specializing in AI & Machine Learning",
                  1000,
                  "Passionate about innovative AI systems for security",
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
              I am an ML/DL freak currently in my Third year of B.Tech,
              specializing in Artificial Intelligence and Machine Learning . I thrive in collaborative environments like
              hackathons, where I blend creativity with technology to deliver impactful solutions.
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
              onClick={() => openLink("https://github.com/vidishbijalwan")}
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
