import { Button } from "@/components/ui/button"
import { AnimatedWrapper } from "@/components/ui/animated-wrapper"
import { fadeInUp } from "@/lib/animations"
import { Heart } from "lucide-react"

export function SupportSection() {
  return (
    <section className="container px-4 py-16">
      <AnimatedWrapper variants={fadeInUp} delay={0.3}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Heart className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold">Support TweakerLab</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              TweakerLab is completely free and open-source. If you find it helpful, consider supporting our
              development.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-pink-300 hover:bg-pink-50 dark:border-pink-700 dark:hover:bg-pink-950/30"
            >
              <Heart className="h-4 w-4 mr-2 text-pink-500" />
              Donate
            </Button>
          </div>
        </div>
      </AnimatedWrapper>
    </section>
  )
}
