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
              className="relative w-full max-w-md mx-auto aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-2xl group border border-secondary/50"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/40 to-transparent z-10 opacity-70 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <Image 
                src="/profile.png" 
                alt="Vidish Bijalwan" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110 filter contrast-125 saturate-110" 
              />
              
              {/* Edge highlight on hover */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/0 group-hover:ring-primary/50 transition-all duration-500 z-20 mix-blend-overlay"></div>
            </motion.div>

            <motion.div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-2xl -z-10"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
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
              I am a Machine Learning and Data Science enthusiast with hands-on experience building predictive ML systems for churn prediction, revenue forecasting, computer vision, and optimization. 
            </p>

            <p className="text-lg">
              Skilled in Python, SQL, Scikit-learn, XGBoost, LightGBM, PyTorch, data preprocessing, feature engineering, model evaluation, and deployment using Streamlit and FastAPI.
            </p>

            <p className="text-lg">
              My focus is on building production-ready ML solutions, analytical pipelines, and business-oriented AI applications that bridge technical research with real-world impact.
            </p>

            <div className="pt-4">
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">B.Tech in Computer Science and Engineering</span>
                    <span className="text-sm text-foreground/70">Expected Aug 2027</span>
                  </div>
                  <p className="text-foreground/70">Graphic Era Hill University, Dehradun</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Higher Secondary Education, Science (PCM)</span>
                    <span className="text-sm text-foreground/70">2023</span>
                    </div>
                  <p className="text-foreground/70">Kendriya Vidyalaya, Rishikesh</p>
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
