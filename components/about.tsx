"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import ResumeButton from "@/components/resume-button"
import SkillProgress from "@/components/skill-progress"

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0])

  const coreSkills = [
    { skill: "Machine Learning", percentage: 90 },
    { skill: "React & Next.js", percentage: 95 },
    { skill: "Python", percentage: 85 },
    { skill: "TypeScript", percentage: 90 },
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
              className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Image src="/placeholder.svg?height=400&width=400" alt="Vidish Bijalwan" fill className="object-cover" />
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

          <motion.div style={{ y, opacity }} className="space-y-6">
            <p className="text-lg">
              I&apos;m Vidish Bijalwan, a passionate software developer specializing in AI/ML solutions and frontend
              development. With a strong foundation in computer science and a keen interest in creating intelligent,
              user-friendly applications, I bridge the gap between complex algorithms and intuitive user experiences.
            </p>

            <p className="text-lg">
              My expertise spans machine learning frameworks like TensorFlow and PyTorch, as well as modern frontend
              technologies including React, Next.js, and Tailwind CSS. I enjoy tackling challenging problems that
              require both analytical thinking and creative solutions.
            </p>

            <p className="text-lg">
              When I&apos;m not coding, I&apos;m exploring the latest advancements in AI research, contributing to
              open-source projects, or sharing knowledge with the developer community. I believe in continuous learning
              and staying at the forefront of technological innovation.
            </p>

            <div className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Computer Science & Engineering</span>
                  <span className="text-sm text-foreground/70">2018 - 2022</span>
                </div>
                <p className="text-foreground/70">University Institute of Technology</p>
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
