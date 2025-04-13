"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function PageTransition() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-background z-[200] flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (!isLoading) {
            document.body.style.overflow = "auto"
          } else {
            document.body.style.overflow = "hidden"
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoading ? 1 : 0, scale: isLoading ? 1 : 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="w-24 h-24 relative"
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 2, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-t-2 border-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-t-2 border-primary"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-t-2 border-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">VB</span>
            </motion.div>
          </motion.div>
          <motion.p
            className="mt-4 text-foreground/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        className="fixed inset-0 pointer-events-none z-[199]"
        initial={{ scaleY: 1, transformOrigin: "top" }}
        animate={{ scaleY: 0, transformOrigin: "top" }}
        transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1], delay: 1.5 }}
      >
        <div className="absolute inset-0 bg-primary" />
      </motion.div>
    </>
  )
}
