"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Github, ExternalLink, Brain } from "lucide-react"
import Image from "next/image"
import { Tilt } from "react-tilt"
import ProjectFilter from "@/components/project-filter"
import ProjectGallery from "@/components/project-gallery"

const projects = [
  {
    title: "Sentiment Analysis Tool",
    description:
      "A machine learning application that analyzes sentiment in text data using NLP techniques. Built with Python, TensorFlow, and deployed as a web service.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["Python", "TensorFlow", "NLP", "Flask", "React"],
    github: "https://github.com/Vidish-Bijalwan/sentiment-analysis",
    demo: "#",
    category: "NLP",
    gallery: [
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Sentiment Analysis Dashboard",
        description: "Main dashboard showing sentiment analysis results",
      },
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Data Visualization",
        description: "Visualization of sentiment distribution",
      },
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Model Architecture",
        description: "The neural network architecture used for sentiment classification",
      },
    ],
  },
  {
    title: "Image Classification System",
    description:
      "A deep learning model for classifying images using convolutional neural networks. Includes data preprocessing, model training, and evaluation.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["PyTorch", "Computer Vision", "CNN", "Data Augmentation"],
    github: "https://github.com/Vidish-Bijalwan/image-classifier",
    demo: "#",
    category: "Computer Vision",
    gallery: [
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Classification Results",
        description: "Results of image classification on test data",
      },
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Model Training",
        description: "Training progress and loss curves",
      },
    ],
  },
  {
    title: "Predictive Analytics Dashboard",
    description:
      "An interactive dashboard for visualizing predictive models and data insights. Features time series forecasting and anomaly detection.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["Scikit-Learn", "Pandas", "Plotly", "Dash", "Time Series"],
    github: "https://github.com/Vidish-Bijalwan/predictive-dashboard",
    demo: "#",
    category: "Data Science",
    gallery: [
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Analytics Dashboard",
        description: "Main analytics dashboard with key metrics",
      },
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Forecasting View",
        description: "Time series forecasting visualization",
      },
    ],
  },
  {
    title: "Recommendation Engine",
    description:
      "A collaborative filtering recommendation system that suggests products based on user behavior and preferences.",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["Python", "Collaborative Filtering", "Matrix Factorization", "Flask"],
    github: "https://github.com/Vidish-Bijalwan/recommendation-engine",
    demo: "#",
    category: "Data Science",
    gallery: [
      {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Recommendation Results",
        description: "Example of personalized recommendations",
      },
    ],
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

export default function AiProjects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [activeCategory, setActiveCategory] = useState("All")
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)

  const categories = Array.from(new Set(projects.map((project) => project.category)))

  const filteredProjects =
    activeCategory === "All" ? projects : projects.filter((project) => project.category === activeCategory)

  const openGallery = (project: (typeof projects)[0]) => {
    setSelectedProject(project)
    setGalleryOpen(true)
  }

  return (
    <section id="ai-projects" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            AI & ML Projects
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Exploring the intersection of artificial intelligence and practical applications through these projects.
          </p>
        </motion.div>

        <ProjectFilter categories={categories} onFilterChange={setActiveCategory} activeCategory={activeCategory} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              layout
            >
              <ProjectCard project={project} onViewGallery={() => openGallery(project)} />
            </motion.div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectGallery images={selectedProject.gallery} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
      )}
    </section>
  )
}

function ProjectCard({ project, onViewGallery }: { project: (typeof projects)[0]; onViewGallery: () => void }) {
  return (
    <Tilt options={defaultTiltOptions} className="h-full">
      <Card className="overflow-hidden group h-full flex flex-col">
        <div className="relative overflow-hidden aspect-video cursor-pointer" onClick={onViewGallery}>
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
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-6 w-6" />
            </motion.a>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
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
