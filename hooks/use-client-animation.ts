"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { AnimationVariants } from "@/types"
import { defaultTransition } from "@/lib/animations"

interface UseClientAnimationProps {
  variants?: AnimationVariants
  delay?: number
  className?: string
  children: React.ReactNode
}

export function useClientAnimation({ variants, delay = 0, className, children }: UseClientAnimationProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
