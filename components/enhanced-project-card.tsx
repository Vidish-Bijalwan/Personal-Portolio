"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Github, ExternalLink, Brain, Code, Eye } from "lucide-react"
import Image from "next/image"

interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  github: string
  demo: string
  category: string
}

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onLinkClick: (url: string, e: React.MouseEvent) => void
}

export default function EnhancedProjectCard({ project, onClick, onLinkClick }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden h-full flex flex-col border border-secondary/50 transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
          : "none",
      }}
    >
      <div className="relative overflow-hidden aspect-video">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div
          className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <button
            onClick={(e) => onLinkClick(project.github, e)}
            className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
            aria-label="View GitHub Repository"
          >
            <Github className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => onLinkClick(project.demo, e)}
            className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
            aria-label="View Live Demo"
            disabled={project.demo === "#"}
          >
            <ExternalLink className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="p-2 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
            aria-label="View Project Details"
          >
            <Eye className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          {project.category === "AI/ML" ? (
            <Brain className="h-5 w-5 text-primary" />
          ) : (
            <Code className="h-5 w-5 text-primary" />
          )}
          <h3 className="text-xl font-bold">{project.title}</h3>
        </div>
        <p className="text-foreground/70 mb-4 flex-grow">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full transition-colors duration-300"
              style={{
                backgroundColor: isHovered ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                color: "rgb(59, 130, 246)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}
