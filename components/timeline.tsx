"use client"

import { motion } from "framer-motion"

interface TimelineItemProps {
  year: string
  title: string
  description: string
  isLeft?: boolean
  index: number
}

export default function Timeline({ items }: { items: Omit<TimelineItemProps, "index">[] }) {
  return (
    <div className="relative">
      {/* Center line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20 rounded-full"></div>

      <div className="space-y-12">
        {items.map((item, index) => (
          <TimelineItem key={index} {...item} isLeft={index % 2 === 0} index={index} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ year, title, description, isLeft = true, index }: TimelineItemProps) {
  return (
    <div className={`flex items-center ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <motion.div
        className={`w-5/12 ${isLeft ? "text-right pr-8" : "text-left pl-8"}`}
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <div className="text-primary font-bold">{year}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-foreground/70">{description}</p>
      </motion.div>

      <div className="w-2/12 flex justify-center">
        <motion.div
          className="w-6 h-6 rounded-full bg-primary relative z-10"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </div>

      <motion.div
        className="w-5/12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        viewport={{ once: true }}
      />
    </div>
  )
}
