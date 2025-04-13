"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDown, Github, Linkedin } from "lucide-react"
import { TypeAnimation } from "react-type-animation"

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 2 }}
    >
      <ParticlesBackground />

      <motion.div
        className="container mx-auto px-4 z-10 py-20 md:py-0"
        style={{ y, opacity }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.2 }}
            className="mb-6"
          >
            <h2 className="text-xl md:text-2xl font-medium text-foreground/80">Hello, I&apos;m</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.4 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Vidish Bijalwan
              </span>
              <motion.span
                className="absolute -inset-1 rounded-lg bg-primary/10 blur-xl -z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              ></motion.span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.6 }}
            className="mb-8 h-16 md:h-24"
          >
            <TypeAnimation
              sequence={[
                "Hi, I'm Vidish Bijalwan — building intuitive web apps & intelligent ML systems.",
                1000,
                "Hi, I'm Vidish Bijalwan — a frontend developer with React & Next.js expertise.",
                1000,
                "Hi, I'm Vidish Bijalwan — an AI/ML enthusiast creating intelligent solutions.",
                1000,
              ]}
              wrapper="h2"
              speed={50}
              repeat={Number.POSITIVE_INFINITY}
              className="text-xl md:text-3xl font-medium text-foreground/80"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.8 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button className="relative group btn-hover overflow-hidden" onClick={() => scrollToSection("contact")}>
              <span className="relative z-10">Get in Touch</span>
              <motion.span
                className="absolute inset-0 bg-primary/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </Button>

            <Button
              variant="outline"
              className="relative group btn-hover overflow-hidden"
              onClick={() => scrollToSection("ai-projects")}
            >
              <span className="relative z-10">View Projects</span>
              <motion.span
                className="absolute inset-0 bg-primary/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 3 }}
            className="flex gap-4"
          >
            <motion.a
              href="https://github.com/Vidish-Bijalwan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-background hover:bg-muted transition-colors relative group"
              aria-label="GitHub"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-6 w-6" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/in/vidish-bijalwan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-background hover:bg-muted transition-colors relative group"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="h-6 w-6" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 3.2 }}
      >
        <motion.button
          onClick={() => scrollToSection("about")}
          aria-label="Scroll down"
          className="p-2 rounded-full bg-background hover:bg-muted transition-colors relative group"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDown className="h-6 w-6" />
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </motion.div>
    </motion.section>
  )
}

function ParticlesBackground() {
  const [particles, setParticles] = useState<
    Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number
    }>
  >([])

  useEffect(() => {
    // Create particles
    const newParticles = []
    const particleCount = window.innerWidth < 768 ? 30 : 60

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: [
              particle.x,
              particle.x + particle.speedX * 100,
              particle.x,
              particle.x - particle.speedX * 100,
              particle.x,
            ],
            y: [
              particle.y,
              particle.y + particle.speedY * 100,
              particle.y,
              particle.y - particle.speedY * 100,
              particle.y,
            ],
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
