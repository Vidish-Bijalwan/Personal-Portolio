"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileText, Check } from "lucide-react"

export default function ResumeButton() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)

    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false)
      setIsDownloaded(true)

      // Reset state after showing success
      setTimeout(() => {
        setIsDownloaded(false)
      }, 2000)

      // In a real implementation, you would trigger the actual download here
      // window.open('/path-to-resume.pdf', '_blank')
    }, 1500)
  }

  return (
    <Button
      variant="outline"
      className="relative group btn-hover overflow-hidden"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <span className="relative z-10 flex items-center">
        {isDownloaded ? (
          <>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Resume Downloaded
          </>
        ) : isDownloading ? (
          <>
            <motion.div
              className="mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            Downloading...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Download Resume
          </>
        )}
      </span>
      <motion.span
        className="absolute inset-0 bg-primary/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </Button>
  )
}
