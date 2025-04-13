"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const blogPosts = [
  {
    title: "Implementing Neural Networks for Image Recognition",
    excerpt:
      "A deep dive into how to build and train neural networks for image recognition tasks using TensorFlow and PyTorch.",
    date: "November 15, 2023",
    image: "/placeholder.svg?height=300&width=500",
    url: "#",
    category: "AI/ML",
  },
  {
    title: "Modern React Patterns with Next.js",
    excerpt: "Exploring the latest patterns and best practices for building scalable React applications with Next.js.",
    date: "October 22, 2023",
    image: "/placeholder.svg?height=300&width=500",
    url: "#",
    category: "Frontend",
  },
  {
    title: "The Future of AI in Web Development",
    excerpt:
      "How artificial intelligence is transforming web development and what developers need to know to stay ahead.",
    date: "September 8, 2023",
    image: "/placeholder.svg?height=300&width=500",
    url: "#",
    category: "Tech Trends",
  },
]

export default function Blog() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="blog" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Latest Articles
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Thoughts, insights, and tutorials on AI, machine learning, and web development
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            View all articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function BlogCard({ post }: { post: (typeof blogPosts)[0] }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-48">
          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
          <div className="absolute top-4 left-4 bg-primary/90 text-white text-xs px-2 py-1 rounded">
            {post.category}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-sm text-foreground/60 mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            {post.date}
          </div>
          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
          <p className="text-foreground/70 mb-4 flex-grow">{post.excerpt}</p>
          <Link href={post.url} className="text-primary hover:text-primary/80 inline-flex items-center mt-auto">
            Read more <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
