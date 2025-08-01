"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { AnimationVariants } from "@/types"
import { defaultTransition } from "@/lib/animations"

interface AnimatedWrapperProps {
  children: React.ReactNode
  variants?: AnimationVariants
  className?: string
  delay?: number
  viewport?: boolean
}

export function AnimatedWrapper({ children, variants, className, delay = 0, viewport = false }: AnimatedWrapperProps) {
  const animationProps = viewport
    ? {
        initial: "initial",
        whileInView: "animate",
        viewport: { once: true, amount: 0.1 },
      }
    : {
        initial: "initial",
        animate: "animate",
      }

  return (
    <motion.div
      {...animationProps}
      variants={variants}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
