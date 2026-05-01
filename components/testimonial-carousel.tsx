"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import Image from "next/image"

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

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(1)
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(-1)
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      next()
    }, 5000)

    return () => clearInterval(interval)
  }, [current, autoplay])

  const handleAnimationComplete = () => {
    setIsAnimating(false)
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="overflow-hidden rounded-xl">
        <div className="relative h-[400px] md:h-[300px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === current
                  ? "opacity-100 translate-x-0"
                  : index === (current - 1 + testimonials.length) % testimonials.length
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
              }`}
              onTransitionEnd={index === current ? handleAnimationComplete : undefined}
            >
              <Card className="h-full p-8 relative border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <Quote className="h-10 w-10 text-primary/20 absolute top-6 left-6" />
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/30">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-lg mb-4 relative z-10 italic">{testimonial.content}</p>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-foreground/70">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 bg-background p-3 rounded-full shadow-lg z-10 hover:bg-primary/10 transition-colors"
        aria-label="Previous testimonial"
        disabled={isAnimating}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-6 bg-background p-3 rounded-full shadow-lg z-10 hover:bg-primary/10 transition-colors"
        aria-label="Next testimonial"
        disabled={isAnimating}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isAnimating) return
              setDirection(index > current ? 1 : -1)
              setCurrent(index)
              setIsAnimating(true)
            }}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              current === index ? "bg-primary" : "bg-primary/30"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setAutoplay(!autoplay)}
        className={`mt-4 text-xs px-3 py-1 rounded-full transition-colors ${
          autoplay ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {autoplay ? "Autoplay: On" : "Autoplay: Off"}
      </button>
    </div>
  )
}
