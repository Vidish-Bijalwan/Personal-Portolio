"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Send, Github, Linkedin, CheckCircle } from "lucide-react"

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Form validation
    if (!formState.name || !formState.email || !formState.message) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      })
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formState.email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setStatus({
        type: "success",
        message: "Thank you for your message! I'll get back to you soon.",
      })

      // Reset form
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: "There was an error sending your message. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Get In Touch
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Have a project in mind or want to discuss potential opportunities? Feel free to reach out!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div>
            <Card className="p-6 h-full border border-secondary/50 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <button
                      onClick={() => (window.location.href = "mailto:vidish.bijalwan@gmail.com")}
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      vidish.bijalwan@gmail.com
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-foreground/70">Dehradun, India</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Connect With Me</h3>
                <p className="text-foreground/70 mb-4">Follow me on social media or check out my work on GitHub.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => openLink("https://github.com/vidish-bijalwan")}
                    className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openLink("https://www.linkedin.com/in/vidish-bijalwan")}
                    className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Contact Success Stats */}
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  Quick Response
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">24h</p>
                    <p className="text-sm text-foreground/70">Response Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-sm text-foreground/70">Satisfaction</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 border border-secondary/50 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-6">Send Me a Message</h3>

              {status && (
                <div
                  className={`p-4 rounded-md mb-6 flex items-start justify-between ${
                    status.type === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  <div className="flex items-center">
                    {status.type === "success" ? (
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    ) : (
                      <span className="h-5 w-5 mr-3 flex-shrink-0">⚠️</span>
                    )}
                    <p>{status.message}</p>
                  </div>
                  <button onClick={() => setStatus(null)} className="ml-4" aria-label="Close">
                    <span>×</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="bg-muted/50"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="bg-muted/50"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className="bg-muted/50"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    className="min-h-[150px] bg-muted/50"
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <span className="flex items-center">
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
