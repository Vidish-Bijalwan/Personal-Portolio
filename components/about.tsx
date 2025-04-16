"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import ResumeButton from "@/components/resume-button"
import SkillProgress from "@/components/skill-progress"

export default function About() {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const coreSkills = [
    { skill: "Artificial Intelligence", percentage: 85 },
    { skill: "Machine Learning", percentage: 80 },
    { skill: "Python", percentage: 90 },
    { skill: "Data Analysis", percentage: 75 },
  ]

  return (
    <section id="about" ref={containerRef} className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            About Me
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden glow-border"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Image src="/profile_photo.png" alt="Vidish Bijalwan" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/20 rounded-2xl"></div>
            </motion.div>
            <motion.div
              className="absolute -inset-4 rounded-2xl bg-primary/10 blur-xl -z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            ></motion.div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">Core Skills</h3>
              {coreSkills.map((item, index) => (
                <SkillProgress key={index} skill={item.skill} percentage={item.percentage} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg">
              I am an AI/ML enthusiast and an aspiring AI Security Specialist currently in my second year of B.Tech,
              specializing in Artificial Intelligence and Machine Learning at a university in Dehradun.
            </p>

            <p className="text-lg">
              My passion lies in developing innovative AI systems that can enhance security and functionality. I thrive
              in collaborative environments like hackathons, where I blend creativity with technology to deliver
              impactful solutions.
            </p>

            <p className="text-lg">
              I have represented my college at the North Zone Innovation Competition, showcasing my innovation and
              problem-solving capabilities. I regularly participate in hackathons and engage with tech communities to
              explore innovative solutions.
            </p>

            <div className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">B.Tech in AI & Machine Learning</span>
                    <span className="text-sm text-foreground/70">2023 - 2027</span>
                  </div>
                  <p className="text-foreground/70">University in Dehradun</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">School Education</span>
                    <span className="text-sm text-foreground/70">2016 - 2022</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-4"
            >
              <ResumeButton />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
