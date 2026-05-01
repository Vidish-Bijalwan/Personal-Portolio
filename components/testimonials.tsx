"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Alex Johnson",
    role: "CTO at TechCorp",
    content:
      "Vidish is an exceptional developer with a deep understanding of both frontend and AI technologies. His ability to create intuitive interfaces while implementing complex algorithms is remarkable.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Sarah Williams",
    role: "Lead Developer at WebSolutions",
    content:
      "Working with Vidish was a pleasure. His attention to detail and problem-solving skills made our project a success. I was particularly impressed by his knowledge of machine learning integration.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Michael Chen",
    role: "AI Research Director",
    content:
      "Vidish's contributions to our research project were invaluable. He quickly grasped complex concepts and implemented efficient solutions that exceeded our expectations.",
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Testimonials
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">What people say about working with me</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `${-current * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 relative">
                    <Quote className="h-10 w-10 text-primary/20 absolute top-6 left-6" />
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-lg mb-6 relative z-10">{testimonial.content}</p>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-foreground/70">{testimonial.role}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 bg-background p-3 rounded-full shadow-lg z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-6 bg-background p-3 rounded-full shadow-lg z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full ${
                  current === index ? "bg-primary" : "bg-primary/30"
                } transition-colors duration-300`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
