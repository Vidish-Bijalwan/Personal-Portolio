"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, GraduationCap, ChevronRight } from "lucide-react"
import { smoothScrollTo } from "@/utils/smooth-scroll"

export default function AssessmentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show banner after a short delay so it catches attention
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] w-[95%] max-w-lg"
        >
          <div className="bg-primary text-primary-foreground backdrop-blur-md shadow-2xl rounded-lg p-4 border border-primary-foreground/20 flex items-center gap-4 relative">
            <div className="bg-primary-foreground/20 p-2 rounded-full hidden sm:flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            
            <div className="flex-grow">
              <h4 className="font-bold text-sm sm:text-base leading-tight">PESE600 Sessional Assessment</h4>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1">
                Evaluating my portfolio? Click here to view the submission form!
              </p>
            </div>
            
            <button 
              onClick={() => {
                smoothScrollTo("assessment")
                setIsVisible(false) // Hide after clicking
              }}
              className="flex items-center justify-center py-2 px-3 rounded-md bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors whitespace-nowrap text-xs font-semibold shadow-sm"
            >
              Go to Form <ChevronRight className="h-4 w-4 ml-1" />
            </button>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 shadow-md hover:bg-muted transition-colors border border-border"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
