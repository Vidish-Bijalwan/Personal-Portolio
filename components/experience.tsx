"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Briefcase, Calendar } from "lucide-react"
import Timeline from "@/components/timeline"

const experiences = [
  {
    title: "AI Research Intern",
    company: "AI Research Lab",
    period: "2022 - Present",
    description:
      "Conducting research on natural language processing and computer vision applications. Implementing and evaluating state-of-the-art machine learning models.",
    responsibilities: [
      "Developed deep learning models for image classification and object detection",
      "Implemented NLP algorithms for text analysis and sentiment classification",
      "Collaborated with senior researchers on publishing research papers",
      "Optimized model performance and reduced training time by 30%",
    ],
    year: "2022",
  },
  {
    title: "Frontend Developer",
    company: "Tech Solutions Ltd.",
    period: "2021 - 2022",
    description:
      "Developed responsive web applications using React and Next.js. Collaborated with UX designers to implement intuitive user interfaces and smooth animations.",
    responsibilities: [
      "Built responsive UI components using React and Tailwind CSS",
      "Implemented complex animations and transitions with Framer Motion",
      "Optimized application performance and loading times",
      "Integrated RESTful APIs and managed state with Redux",
    ],
    year: "2021",
  },
  {
    title: "Software Engineering Intern",
    company: "WebCraft Studios",
    period: "2020 - 2021",
    description:
      "Assisted in developing full-stack web applications. Gained hands-on experience with JavaScript, React, Node.js, and database management.",
    responsibilities: [
      "Developed frontend components following design specifications",
      "Implemented backend APIs using Node.js and Express",
      "Worked with MongoDB and PostgreSQL databases",
      "Participated in code reviews and agile development processes",
    ],
    year: "2020",
  },
]

const timelineItems = experiences.map((exp) => ({
  year: exp.year,
  title: `${exp.title} at ${exp.company}`,
  description: exp.description,
}))

export default function Experience() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="experience" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Work Experience
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            My professional journey in AI research and web development.
          </p>
        </motion.div>

        <div className="mb-16 hidden md:block">
          <Timeline items={timelineItems} />
        </div>

        <div className="max-w-3xl mx-auto md:hidden">
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
              className="mb-8 last:mb-0"
            >
              <ExperienceCard experience={experience} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceCard({ experience, index }: { experience: (typeof experiences)[0]; index: number }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 relative group hover:shadow-lg transition-shadow duration-300">
        <motion.div
          className="absolute -inset-1 bg-primary/5 rounded-lg"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{experience.title}</h3>
              <p className="text-foreground/70">{experience.company}</p>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm">{experience.period}</span>
            </div>
          </div>

          <p className="mb-4">{experience.description}</p>

          <div>
            <h4 className="text-md font-semibold mb-2 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              Key Responsibilities
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {experience.responsibilities.map((responsibility, idx) => (
                <motion.li
                  key={idx}
                  className="text-foreground/80"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  {responsibility}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
