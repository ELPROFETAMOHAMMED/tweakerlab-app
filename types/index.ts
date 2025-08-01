import type React from "react"
export interface NavigationItem {
  href: string
  label: string
}

export interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

export interface AnimationVariants {
  initial: Record<string, any>
  animate: Record<string, any>
  exit?: Record<string, any>
}
