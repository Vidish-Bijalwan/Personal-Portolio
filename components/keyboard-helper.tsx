"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Keyboard, X } from "lucide-react"

export default function KeyboardHelper() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey) {
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 5000)

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const shortcuts = [
    { key: "?", description: "Show keyboard shortcuts" },
    { key: "h", description: "Go to home section" },
    { key: "a", description: "Go to about section" },
    { key: "s", description: "Go to skills section" },
    { key: "p", description: "Go to projects section" },
    { key: "e", description: "Go to experience section" },
    { key: "c", description: "Go to contact section" },
    { key: "t", description: "Toggle theme" },
    { key: "Esc", description: "Close dialogs" },
  ]

  return (
    <>
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-8 p-3 rounded-full bg-background shadow-lg z-50 border border-border"
            onClick={() => setIsOpen(true)}
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/70 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-foreground/70">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">{shortcut.key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
