"use client"

import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Briefcase, Calendar, Award, Users, Medal, Trophy, Star, Gamepad2, FileText, ExternalLink } from "lucide-react"
import Timeline from "@/components/timeline"
import TestimonialCarousel from "@/components/testimonial-carousel"

const experiences = [
  {
    title: "Winner, SAARTHI Hackathon 2025",
    organization: "IEEE / Graphic Era Hill University",
    period: "Nov 2025",
    description:
      "Secured 1st place in the Best Startup Idea category for developing the Saarthi assistive AI device.",
    achievements: [
      "Designed an ESP32-CAM prototype helping visually and hearing impaired individuals.",
      "Implemented real-time obstacle detection and integrated LLMs for human-computer interaction.",
    ],
    link: "/media__1777568972995.png",
    year: "2025",
    type: "Competition",
    icon: <Trophy className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
  },
  {
    title: "Winner, Free Fire Esports Tournament",
    organization: "IEEE",
    period: "2026",
    description:
      "Triumph in a competitive 4-player Free Fire tournament organized by IEEE, demonstrating elite teamwork and high-pressure strategic execution.",
    achievements: [
      "Led the collaborative team execution as an IGL to secure the championship victory.",
      "View the team's winning moment on Instagram.",
    ],
    link: "https://www.instagram.com/p/DXtGB-hkQD4/?img_index=5",
    year: "2026",
    type: "Esports",
    icon: <Gamepad2 className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
  },
  {
    title: "Top 5 Finalist, Avishkar 2024",
    organization: "Graphic Era Hill University",
    period: "2024",
    description:
      "Secured a Top 5 position for developing a real-time blood donor matching platform.",
    achievements: [
      "Engineered a location and blood-group based matching algorithm.",
      "Presented the solution directly to medical professionals and university judging panels.",
    ],
    year: "2024",
    type: "Competition",
    icon: <Award className="h-12 w-12 text-primary p-2 bg-primary/10 rounded-full" />,
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
          <h3 className="heading-md font-serif text-center mb-10">Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 border border-secondary/50 hover:border-primary/30 transition-colors bg-card hover:shadow-lg">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">Robotics & Controls Job Simulation</h4>
              <p className="text-sm text-foreground/70 mb-4">Johnson & Johnson (Forage)</p>
              <div className="text-xs font-mono bg-secondary/50 inline-block px-2 py-1 rounded">Mar 2026</div>
            </Card>
            <Card className="p-6 border border-secondary/50 hover:border-primary/30 transition-colors bg-card hover:shadow-lg">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">DevOps on AWS</h4>
              <p className="text-sm text-foreground/70 mb-4">AWS Training & Certification</p>
              <div className="text-xs font-mono bg-secondary/50 inline-block px-2 py-1 rounded">Aug 2025</div>
            </Card>
            <Card className="p-6 border border-secondary/50 hover:border-primary/30 transition-colors bg-card hover:shadow-lg">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">10+ End-to-End ML Projects Bootcamp</h4>
              <p className="text-sm text-foreground/70 mb-4">Udemy</p>
              <div className="text-xs font-mono bg-secondary/50 inline-block px-2 py-1 rounded">Jun 2025</div>
            </Card>
            <Card className="p-6 border border-secondary/50 hover:border-primary/30 transition-colors bg-card hover:shadow-lg">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">Generative AI Course (LangChain)</h4>
              <p className="text-sm text-foreground/70 mb-4">Udemy</p>
              <div className="text-xs font-mono bg-secondary/50 inline-block px-2 py-1 rounded">May 2024</div>
            </Card>
            <Card className="p-6 border border-secondary/50 hover:border-primary/30 transition-colors bg-card hover:shadow-lg">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">Innovation & Business Models</h4>
              <p className="text-sm text-foreground/70 mb-4">NPTEL, IIT Roorkee</p>
              <div className="text-xs font-mono bg-secondary/50 inline-block px-2 py-1 rounded">Oct 2024</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExperienceCard({ experience, index }: { experience: any; index: number }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 hover:-translate-y-2 transition-transform duration-300">
      <div className="md:w-1/6 flex justify-center">{experience.icon}</div>

      <Card className="md:w-5/6 p-6 relative group hover:shadow-lg transition-shadow duration-300 border border-secondary/50 hover:border-primary/30">
        <div className="absolute -inset-1 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <div className="flex items-center">
                {experience.type === "Esports" ? (
                  <Gamepad2 className="h-5 w-5 mr-2 text-primary" />
                ) : experience.type === "Competition" ? (
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
              Key Details
            </h4>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              {experience.achievements.map((achievement: string, idx: number) => (
                <li key={idx} className="text-foreground/80">
                  {achievement}
                </li>
              ))}
            </ul>

            {experience.link && (
               <a 
                 href={experience.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium mt-2"
               >
                 View Proof <ExternalLink className="h-3 w-3 ml-1" />
               </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
