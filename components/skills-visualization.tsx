"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface Skill {
  name: string
  level: number
  category: string
  icon: string
}

const skills: Skill[] = [
  { name: "Python", level: 90, category: "Programming", icon: "🐍" },
  { name: "TensorFlow", level: 85, category: "AI/ML", icon: "🧠" },
  { name: "PyTorch", level: 80, category: "AI/ML", icon: "🔥" },
  { name: "React", level: 75, category: "Frontend", icon: "⚛️" },
  { name: "Next.js", level: 70, category: "Frontend", icon: "▲" },
  { name: "Node.js", level: 65, category: "Backend", icon: "🟢" },
  { name: "Computer Vision", level: 80, category: "AI/ML", icon: "👁️" },
  { name: "NLP", level: 85, category: "AI/ML", icon: "💬" },
  { name: "Data Analysis", level: 90, category: "Data Science", icon: "📊" },
  { name: "Machine Learning", level: 90, category: "AI/ML", icon: "🤖" },
  { name: "Deep Learning", level: 85, category: "AI/ML", icon: "🧠" },
  { name: "SQL", level: 75, category: "Database", icon: "🗄️" },
]

const categories = Array.from(new Set(skills.map((skill) => skill.category)))

export default function SkillsVisualization() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const filteredSkills = activeCategory === "All" ? skills : skills.filter((skill) => skill.category === activeCategory)

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "All" ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
          onClick={() => setActiveCategory("All")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSkills.map((skill) => (
          <motion.div
            key={skill.name}
            className="relative bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
            whileHover={{ y: -5 }}
            onMouseEnter={() => setHoveredSkill(skill.name)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{skill.icon}</span>
              <h3 className="font-medium">{skill.name}</h3>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{skill.category}</span>
              <span
                className={`text-sm font-medium ${hoveredSkill === skill.name ? "text-primary" : "text-foreground/70"}`}
              >
                {skill.level}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
