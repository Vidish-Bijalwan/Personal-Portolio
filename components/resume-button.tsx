"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Check } from "lucide-react"

export default function ResumeButton() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)

    // Create a dummy PDF file for download
    const pdfBlob = new Blob(["Vidish Bijalwan - Resume"], { type: "application/pdf" })
    const url = URL.createObjectURL(pdfBlob)

    // Create a link element and trigger download
    const link = document.createElement("a")
    link.href = url
    link.download = "vidish_bijalwan_resume.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL
    URL.revokeObjectURL(url)

    // Show success state
    setTimeout(() => {
      setIsDownloading(false)
      setIsDownloaded(true)

      // Reset state after showing success
      setTimeout(() => {
        setIsDownloaded(false)
      }, 2000)
    }, 1500)
  }

  return (
    <Button variant="outline" className="border border-primary/50" onClick={handleDownload} disabled={isDownloading}>
      <span className="flex items-center">
        {isDownloaded ? (
          <>
            <Check className="mr-2 h-4 w-4 text-blue-500" />
            Resume Downloaded
          </>
        ) : isDownloading ? (
          <>
            <div className="mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Downloading...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Download Resume
          </>
        )}
      </span>
    </Button>
  )
}
