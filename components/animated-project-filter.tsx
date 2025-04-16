"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface AnimatedProjectFilterProps {
  categories: string[]
  activeCategory: string
  onFilterChange: (category: string) => void
}

export default function AnimatedProjectFilter({
  categories,
  activeCategory,
  onFilterChange,
}: AnimatedProjectFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <FilterButton isActive={activeCategory === "All"} onClick={() => onFilterChange("All")} label="All" />

      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onClick={() => onFilterChange(category)}
          label={category}
        />
      ))}
    </div>
  )
}

interface FilterButtonProps {
  isActive: boolean
  onClick: () => void
  label: string
}

function FilterButton({ isActive, onClick, label }: FilterButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      className={`px-4 py-2 rounded-full text-sm font-medium relative overflow-hidden ${
        isActive ? "text-white" : "text-primary"
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-primary z-0"
        initial={{ scale: isActive ? 1 : 0 }}
        animate={{ scale: isActive ? 1 : isHovered ? 0.95 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.span
        className="absolute inset-0 rounded-full bg-primary/10 z-0"
        initial={{ scale: isActive ? 0 : 1 }}
        animate={{ scale: isActive ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10">{label}</span>

      {isActive && (
        <motion.span
          className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full"
          layoutId="activeFilterDot"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}
