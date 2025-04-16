"use client"

import { useState } from "react"
import { Github, ExternalLink, X } from "lucide-react"
import Image from "next/image"
import EnhancedProjectCard from "@/components/enhanced-project-card"
import AnimatedProjectFilter from "@/components/animated-project-filter"
import AnimatedButton from "@/components/animated-button"

const projects = [
  {
    title: "Traffic Flow Optimization",
    description:
      "Developed a web app to optimize traffic flow using graph algorithms deployed on Streamlit. Created visualization tools to analyze traffic patterns and suggest optimal routes.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1xTLrlwTQV7jMcFw-KlUyQ4tw09uYLvScrQ&s",
    tags: ["Graph Algorithms", "Streamlit", "Python", "Data Visualization"],
    github: "https://github.com/Vidish-Bijalwan/SMART-TRAFFIC-OPTIMIZER",
    demo: "https://smart-traffic-optimizer-vidish-bijalwan.streamlit.app/",
    category: "Web",
  },
  {
    title: "Customer Churn Prediction",
    description:
      "Built an AI model to forecast customer churn and revenue trends for smarter business decisions. Implemented machine learning algorithms to analyze customer behavior patterns.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUrSlRRvBSIykpTBkXzuv1eH6Z4T4kkAFwqw&s",
    tags: ["Python", "Machine Learning", "Data Analysis", "Predictive Modeling"],
    github: "https://github.com/Vidish-Bijalwan/Churn-And-Revenue-Forecaster",
    demo: "#",
    category: "AI/ML",
  },
  {
    title: "Stone-Mine Classification",
    description:
      "Developed a system to classify stones and mines using machine learning. Used sonar data to train models that can accurately distinguish between rocks and mines underwater.",
    image: "https://navymuseum.co.nz/wp-content/uploads/OC-143.jpg",
    tags: ["Classification", "Python", "Scikit-Learn", "Data Processing"],
    github: "https://github.com/Vidish-Bijalwan/Sonarr-Ml--Model---Stone-V-s-Mine",
    demo: "#",
    category: "AI/ML",
  },
  {
    title: "AI-Powered Social Platform",
    description:
      "Created a smarter, AI-powered social platform with dynamic user interactions. Implemented recommendation systems and content moderation using machine learning.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM__Xqaqn_jnYSB43H3S4dKvKUU9aH_7EsFA&s",
    tags: ["Python", "NLP", "Recommendation Systems", "Web Development"],
    github: "https://github.com/vidishbijalwan",
    demo: "#",
    category: "Web",
  },
  {
    title: "House Price Prediction",
    description:
      "This is an interactive web application that predicts house prices based on user inputs like area, number of bedrooms, bathrooms, and other house features. It uses a Random Forest Regressor model trained on a housing dataset and is deployed using Streamlit for an interactive user interface.",
    image:
      "https://images.pexels.com/photos/31597537/pexels-photo-31597537/free-photo-of-woman-in-quiet-courtyard-in-yancheng-china.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    tags: ["Python", "Algorithms", "Streamlit", "Dataset"],
    github: "https://github.com/Vidish-Bijalwan/House-Price-Prediction",
    demo: "#",
    category: "Finance",
  },
  {
    title: "Sign Language Translator",
    description:
      "Used Computer Vision and NLP to translate sign language into speech for better accessibility. Developed models that can recognize hand gestures and convert them to text and speech.",
    image:
      "https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    tags: ["Computer Vision", "NLP", "Python", "Accessibility"],
    github: "https://github.com/vidishbijalwan",
    demo: "#",
    category: "AI/ML",
  },
  {
    title: "Blood Donation Platform",
    description:
      "Built an intelligent platform to streamline blood donation processes. Implemented matching algorithms to connect donors with recipients efficiently.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnJmjP9fSEBLaNd-l07hJEjwF6CCgea-NiVA&s",
    tags: ["Python", "Algorithms", "Web Development", "Database"],
    github: "https://github.com/vidishbijalwan",
    demo: "#",
    category: "Healthcare",
  },
  {
    title: "Healthcare Disease Prediction",
    description:
      "Designed a healthcare tool to provide early disease prediction using ML models. Analyzed medical data to identify patterns and risk factors for various health conditions.",
    image: "https://dasarpai.com/assets/images/dspost/cv/Medical-Imaing-x-ray-chest.jpg",
    tags: ["Machine Learning", "Healthcare", "Python", "Data Analysis"],
    github: "https://github.com/vidishbijalwan",
    demo: "#",
    category: "Healthcare",
  },
]

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const categories = Array.from(new Set(projects.map((project) => project.category)))

  const filteredProjects =
    activeCategory === "All" ? projects : projects.filter((project) => project.category === activeCategory)

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  const openProjectDetails = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const openLink = (url, e) => {
    e.stopPropagation()
    if (url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <section id="projects" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="heading-lg font-serif mb-4 relative inline-block">
            Projects
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="body-lg text-foreground/70 max-w-2xl mx-auto">
            A series of projects focused on applying AI and ML technologies across various domains
          </p>
        </div>

        <AnimatedProjectFilter
          categories={categories}
          activeCategory={activeCategory}
          onFilterChange={handleCategoryChange}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.title}
              className="transition-all duration-500"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <EnhancedProjectCard
                project={project}
                onClick={() => openProjectDetails(project)}
                onLinkClick={openLink}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {isModalOpen && selectedProject && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-background rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative aspect-video">
              <Image
                src={selectedProject.image || "/placeholder.svg"}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 font-serif">{selectedProject.title}</h3>
              <p className="text-foreground/70 mb-4">{selectedProject.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProject.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <AnimatedButton
                  effect="ripple"
                  onClick={(e) => openLink(selectedProject.github, e)}
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  View Code
                </AnimatedButton>

                <AnimatedButton
                  variant="outline"
                  effect="shine"
                  onClick={(e) => openLink(selectedProject.demo, e)}
                  className="flex items-center gap-2"
                  disabled={selectedProject.demo === "#"}
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
