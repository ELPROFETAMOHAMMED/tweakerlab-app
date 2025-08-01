import { AnimatedWrapper } from "@/components/ui/animated-wrapper"
import { fadeInUp } from "@/lib/animations"
import { FEATURES } from "@/constants/features"

export function FeaturesSection() {
  return (
    <section className="container px-4 py-16">
      <AnimatedWrapper variants={fadeInUp} delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card"
            >
              <div className={`h-12 w-12 rounded-lg bg-${feature.color}-500/10 flex items-center justify-center`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </AnimatedWrapper>
    </section>
  )
}
