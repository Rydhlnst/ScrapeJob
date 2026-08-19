"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={reducedMotion ? undefined : { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Float({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
      transition={reducedMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}
