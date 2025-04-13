"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Accessibility, ZoomIn, ZoomOut, Type, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [contrast, setContrast] = useState(false)

  const increaseFontSize = () => {
    if (fontSize < 150) {
      const newSize = fontSize + 10
      setFontSize(newSize)
      document.documentElement.style.fontSize = `${newSize}%`
    }
  }

  const decreaseFontSize = () => {
    if (fontSize > 80) {
      const newSize = fontSize - 10
      setFontSize(newSize)
      document.documentElement.style.fontSize = `${newSize}%`
    }
  }

  const toggleContrast = () => {
    setContrast(!contrast)
    document.documentElement.classList.toggle("high-contrast")
  }

  const resetSettings = () => {
    setFontSize(100)
    setContrast(false)
    document.documentElement.style.fontSize = "100%"
    document.documentElement.classList.remove("high-contrast")
  }

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-background shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility options"
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 bg-background rounded-lg shadow-lg p-4 w-64 border border-border"
          >
            <h3 className="font-medium mb-3 flex items-center">
              <Accessibility className="h-4 w-4 mr-2" />
              Accessibility Options
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-foreground/70 mb-2">Text Size</p>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 80}
                    aria-label="Decrease font size"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{fontSize}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 150}
                    aria-label="Increase font size"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground/70 mb-2">Display</p>
                <Button
                  variant={contrast ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={toggleContrast}
                >
                  <Type className="h-4 w-4 mr-2" />
                  High Contrast
                </Button>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
