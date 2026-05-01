"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Code2, Database, Brain, Network, Cloud, Wrench } from "lucide-react"

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <Code2 className="h-6 w-6 text-primary mb-3" />,
    skills: ["Python", "SQL", "Java", "C++"],
  },
  {
    title: "Machine & Deep Learning",
    icon: <Brain className="h-6 w-6 text-primary mb-3" />,
    skills: [
      "PyTorch",
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "Random Forest",
      "SVM",
      "CNNs",
      "Transfer Learning",
    ],
  },
  {
    title: "AI & Data Domains",
    icon: <Network className="h-6 w-6 text-primary mb-3" />,
    skills: [
      "Computer Vision",
      "Natural Language Processing (NLP)",
      "LLM Integration",
      "Predictive Modeling",
    ],
  },
  {
    title: "Data Engineering",
    icon: <Database className="h-6 w-6 text-primary mb-3" />,
    skills: ["Pandas", "NumPy", "ETL Pipelines", "Feature Engineering", "Data Visualization"],
  },
  {
    title: "Deployment & Cloud",
    icon: <Cloud className="h-6 w-6 text-primary mb-3" />,
    skills: ["AWS (S3, EC2)", "FastAPI", "Streamlit", "Docker"],
  },
  {
    title: "Tools & Architecture",
    icon: <Wrench className="h-6 w-6 text-primary mb-3" />,
    skills: ["Git & GitHub", "Jupyter", "Linux OS", "Agile / Scrum"],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SkillsVisualization() {
  return (
    <div className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {skillCategories.map((category, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="h-full p-6 bg-card border border-secondary/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold font-serif">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIdx) => (
                  <span
                    key={skillIdx}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-secondary/50 text-secondary-foreground border border-secondary hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
