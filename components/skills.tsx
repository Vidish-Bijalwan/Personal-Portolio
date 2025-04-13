"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Brain, Code, Database, Layout, Server, Smartphone } from "lucide-react"

const skillCategories = [
  {
    title: "AI & Machine Learning",
    icon: <Brain className="h-8 w-8 text-primary" />,
    skills: ["TensorFlow", "PyTorch", "Scikit-Learn", "Computer Vision", "NLP", "Data Analysis", "Python", "Jupyter"],
  },
  {
    title: "Frontend Development",
    icon: <Layout className="h-8 w-8 text-primary" />,
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend Development",
    icon: <Server className="h-8 w-8 text-primary" />,
    skills: ["Node.js", "Express", "Python", "Django", "RESTful APIs", "GraphQL", "Microservices"],
  },
  {
    title: "Database",
    icon: <Database className="h-8 w-8 text-primary" />,
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis", "Prisma", "Mongoose"],
  },
  {
    title: "Mobile Development",
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    skills: ["React Native", "Flutter", "iOS", "Android", "Expo", "Mobile UI/UX"],
  },
  {
    title: "DevOps & Tools",
    icon: <Code className="h-8 w-8 text-primary" />,
    skills: ["Git", "GitHub", "Docker", "CI/CD", "AWS", "Vercel", "Netlify", "Jest"],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="skills" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Skills & Expertise
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            My technical toolkit spans AI/ML and web development, allowing me to build intelligent, user-friendly
            applications.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              <SkillCard category={category} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillCard({ category }: { category: (typeof skillCategories)[0] }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 relative group overflow-hidden">
        <motion.div
          className="absolute -inset-1 bg-primary/5 rounded-lg"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
              {category.icon}
            </motion.div>
            <h3 className="text-xl font-bold">{category.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill, index) => (
              <motion.span
                key={index}
                className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
