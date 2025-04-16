"use client"

import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Briefcase, Calendar, Award, Users, Medal, Trophy, Star } from "lucide-react"
import Timeline from "@/components/timeline"
import TestimonialCarousel from "@/components/testimonial-carousel"

const experiences = [
  {
    title: "North Zone Innovation Competition",
    organization: "College Representative",
    period: "2023",
    description:
      "Represented college at the North Zone Innovation Competition, showcasing innovation and problem-solving capabilities.",
    achievements: [
      "Developed and presented innovative AI solutions for real-world problems",
      "Collaborated with team members to create a comprehensive project that received recognition",
      "Implemented machine learning algorithms to analyze and predict patterns in complex datasets",
      "Received special mention for technical implementation and innovative approach",
    ],
    year: "2023",
    type: "Competition",
    icon: <Trophy className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
  },
  {
    title: "Hackathon Participant",
    organization: "Various Tech Communities",
    period: "2022 - Present",
    description:
      "Regularly participates in hackathons and engages with tech communities to explore innovative solutions.",
    achievements: [
      "Collaborated with diverse teams to develop solutions under time constraints",
      "Applied AI and ML technologies to solve real-world problems",
      "Networked with industry professionals and fellow enthusiasts",
      "Gained hands-on experience with cutting-edge technologies",
      "Secured 2nd place in the college-level coding competition",
    ],
    year: "2022",
    type: "Community",
    icon: <Medal className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
  },
  {
    title: "AI Research Project",
    organization: "University Research Lab",
    period: "2023 - Present",
    description:
      "Contributing to research on AI applications in cybersecurity, focusing on anomaly detection in network traffic.",
    achievements: [
      "Implemented neural network models for detecting unusual patterns in network data",
      "Collaborated with senior researchers to refine methodologies",
      "Presented findings at departmental research symposium",
      "Co-authored a research paper currently under review",
    ],
    year: "2023",
    type: "Research",
    icon: <Star className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
  },
]

const timelineItems = experiences.map((exp) => ({
  year: exp.year,
  title: `${exp.title} at ${exp.organization}`,
  description: exp.description,
}))

export default function Experience() {
  const ref = useRef(null)

  return (
    <section id="experience" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="heading-lg font-serif mb-4 relative inline-block">
            Experience & Achievements
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="body-lg text-foreground/70 max-w-2xl mx-auto">
            My journey in innovation competitions, research, and collaborative tech environments
          </p>
        </div>

        {/* Only render Timeline when items exist */}
        <div className="mb-16 hidden md:block">{timelineItems.length > 0 && <Timeline items={timelineItems} />}</div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((experience, index) => (
            <div key={index} className="mb-12 last:mb-0">
              <ExperienceCard experience={experience} index={index} />
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mt-20">
          <h3 className="heading-md font-serif text-center mb-10">What People Say</h3>
          <TestimonialCarousel />
        </div>
      </div>
    </section>
  )
}

function ExperienceCard({ experience, index }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 hover:-translate-y-2 transition-transform duration-300">
      <div className="md:w-1/6 flex justify-center">{experience.icon}</div>

      <Card className="md:w-5/6 p-6 relative group hover:shadow-lg transition-shadow duration-300 border border-secondary/50 hover:border-primary/30">
        <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <div className="flex items-center">
                {experience.type === "Competition" ? (
                  <Award className="h-5 w-5 mr-2 text-primary" />
                ) : experience.type === "Research" ? (
                  <Star className="h-5 w-5 mr-2 text-primary" />
                ) : (
                  <Users className="h-5 w-5 mr-2 text-primary" />
                )}
                <h3 className="text-xl font-bold font-serif">{experience.title}</h3>
              </div>
              <p className="text-foreground/70">{experience.organization}</p>
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
              Key Achievements
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {experience.achievements.map((achievement, idx) => (
                <li key={idx} className="text-foreground/80">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
