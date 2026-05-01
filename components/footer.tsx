"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Mail } from "lucide-react"

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.705-1.089-.705-1.767s.238-1.3.705-1.767L9.823 8.31c.467-.467 1.111-.662 1.824-.662s1.357.195 1.823.662l1.045 1.05-1.411 1.413-.9Z" fill="#ffa116"/>
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.705-1.089-.705-1.767s.238-1.3.705-1.767L9.823 8.31c.467-.467 1.111-.662 1.824-.662s1.357.195 1.823.662l1.045 1.05-1.411 1.413-1.045-1.05c-.156-.156-.37-.248-.59-.248-.22 0-.435.092-.591.248L5.452 12.64c-.155.156-.24.37-.24.59 0 .221.085.435.24.59l4.332 4.363c.156.155.37.248.591.248.22 0 .435-.093.59-.248l2.697-2.607 2.44 2.354Z"/>
      <path d="M20.25 10.362l-5.69-5.748c-.467-.467-1.111-.662-1.824-.662s-1.357.195-1.823.662L9.823 5.05l1.411 1.413 1.09-1.094c.156-.156.37-.248.59-.248s.435.092.591.248l5.69 5.748c.156.155.156.408 0 .563L16.29 14.8l1.41 1.413 2.55-2.585c.466-.467.705-1.089.705-1.767s-.239-1.3-.705-1.767Z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-foreground/70">
              &copy; {new Date().getFullYear()} Vidish Bijalwan. All rights reserved.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="https://github.com/Vidish-Bijalwan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors relative group"
              aria-label="GitHub"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-5 w-5" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/in/vidish-bijalwan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors relative group"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="h-5 w-5" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.a
              href="mailto:vidishofficial@gmail.com"
              className="p-2 rounded-full hover:bg-muted transition-colors relative group"
              aria-label="Email"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="h-5 w-5" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.a
              href="https://leetcode.com/u/vidishofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted transition-colors relative group"
              aria-label="LeetCode"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LeetCodeIcon className="h-5 w-5" />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
