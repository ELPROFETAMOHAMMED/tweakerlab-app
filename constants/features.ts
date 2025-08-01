import { Zap, Shield, Gauge } from "lucide-react"
import type { FeatureItem } from "@/types"

export const FEATURES: FeatureItem[] = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Boost your PC performance with intelligent optimization algorithms that work in real-time.",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "All optimizations are reversible and tested to ensure your system remains stable and secure.",
    color: "green",
  },
  {
    icon: Gauge,
    title: "Real-time Monitoring",
    description: "Monitor your system performance with detailed analytics and performance metrics.",
    color: "purple",
  },
]
