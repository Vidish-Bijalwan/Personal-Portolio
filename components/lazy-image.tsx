"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fill = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const [blurDataURL, setBlurDataURL] = useState(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  )

  useEffect(() => {
    // Check if element is in viewport using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    const timer = setTimeout(() => {
      const element = document.getElementById(`lazy-image-${src}`)
      if (element) observer.observe(element)
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [src])

  return (
    <div
      id={`lazy-image-${src}`}
      className={`relative overflow-hidden ${className}`}
      style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
    >
      {(isInView || priority) && (
        <>
          <motion.div
            className="absolute inset-0 bg-muted/30"
            initial={{ opacity: 1 }}
            animate={{ opacity: isLoading ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoadingComplete={() => setIsLoading(false)}
            placeholder="blur"
            blurDataURL={blurDataURL}
            priority={priority}
            fill={fill}
          />
        </>
      )}
    </div>
  )
}
