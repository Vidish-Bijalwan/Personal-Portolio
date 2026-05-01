"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ProjectFilterProps {
  categories: string[]
  onFilterChange: (category: string) => void
  activeCategory: string
}

export default function ProjectFilter({ categories, onFilterChange, activeCategory }: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {["All", ...categories].map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(category)}
          className="relative overflow-hidden"
        >
          <span className="relative z-10">{category}</span>
          {activeCategory === category && (
            <motion.span
              layoutId="activeCategory"
              className="absolute inset-0 bg-primary"
              initial={{ borderRadius: 8 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Button>
      ))}
    </div>
  )
}
