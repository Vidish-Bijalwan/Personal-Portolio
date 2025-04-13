"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Github, ExternalLink, Layout } from "lucide-react"
import Image from "next/image"
import { Tilt } from "react-tilt"

const projects = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-stack e-commerce platform with user authentication, product management, and payment integration. Features a responsive design and intuitive user experience.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["React", "Next.js", "Tailwind CSS", "Node.js", "MongoDB"],
    github: "https://github.com/Vidish-Bijalwan/ecommerce-platform",
    demo: "#",
  },
  {
    title: "Portfolio Website",
    description:
      "A modern portfolio website showcasing projects and skills with a clean, responsive design. Includes animations, dark mode, and contact form.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["React", "Framer Motion", "Tailwind CSS", "Next.js"],
    github: "https://github.com/Vidish-Bijalwan/portfolio",
    demo: "#",
  },
  {
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates and team collaboration features. Includes drag-and-drop functionality.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["TypeScript", "React", "Firebase", "Tailwind CSS", "Redux"],
    github: "https://github.com/Vidish-Bijalwan/task-manager",
    demo: "#",
  },
]

const defaultTiltOptions = {
  reverse: false,
  max: 15,
  perspective: 1000,
  scale: 1,
  speed: 1000,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
}

export default function FrontendProjects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="frontend-projects" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Frontend Projects
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Creating intuitive, responsive, and visually appealing web applications with modern frontend technologies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  return (
    <Tilt options={defaultTiltOptions} className="h-full">
      <Card className="overflow-hidden group h-full flex flex-col">
        <div className="relative overflow-hidden aspect-video">
          <Image
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors relative group"
              aria-label="View GitHub Repository"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-6 w-6" />
            </motion.a>
            <motion.a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors relative group"
              aria-label="View Live Demo"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="h-6 w-6" />
            </motion.a>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">{project.title}</h3>
          </div>
          <p className="text-foreground/70 mb-4 flex-grow">{project.description}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.tags.map((tag, index) => (
              <motion.span
                key={index}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </Card>
    </Tilt>
  )
}
