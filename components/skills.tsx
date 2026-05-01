"use client"

import SkillsVisualization from "@/components/skills-visualization"

export default function Skills() {
  return (
    <section id="skills" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="heading-lg font-serif mb-4 relative inline-block">
            Skills & Expertise
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="body-lg text-foreground/70 max-w-2xl mx-auto">
            My technical toolkit spans AI/ML and web development, allowing me to build intelligent, user-friendly
            applications.
          </p>
        </div>

        <SkillsVisualization />
      </div>
    </section>
  )
}
