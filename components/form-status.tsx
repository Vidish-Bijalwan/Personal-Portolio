"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, X } from "lucide-react"

interface FormStatusProps {
  type: "success" | "error"
  message: string
  onClose: () => void
}

export default function FormStatus({ type, message, onClose }: FormStatusProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 rounded-md mb-6 flex items-start justify-between ${
          type === "success"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        <div className="flex items-center">
          {type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          )}
          <p>{message}</p>
        </div>
        <button onClick={onClose} className="ml-4" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
