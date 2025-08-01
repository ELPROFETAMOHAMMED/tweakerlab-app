import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { fadeInUp } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

export function CallToActionSection() {
  return (
    <section className="container px-4 py-16">
      <AnimatedWrapper variants={fadeInUp} delay={0.2}>
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Unlock Your PC's Potential?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of users who have already optimized their systems
            with TweakerLab.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/dashboard">
                <ArrowRight className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/tools">View Tools</Link>
            </Button>
          </div>
        </div>
      </AnimatedWrapper>
    </section>
  );
}
