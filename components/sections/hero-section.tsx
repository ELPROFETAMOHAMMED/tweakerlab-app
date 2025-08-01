import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight, StarsIcon } from "lucide-react";
import { Separator } from "../ui/separator";

export function HeroSection() {
  return (
    <section className="container px-4 py-24 md:py-32 lg:py-40">
      <AnimatedWrapper
        variants={staggerContainer}
        className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
      >
        <AnimatedWrapper variants={fadeInUp} className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Optimize Your PC
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Today
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Free, open-source PC optimization tools that unlock your system's
            full potential with intelligent tweaks and real-time monitoring.
          </p>
        </AnimatedWrapper>

        <AnimatedWrapper
          variants={fadeInUp}
          delay={0.2}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/dashboard">
              <StarsIcon className="mr-2 h-5 w-5" />
              Get Started
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            asChild
          >
            <Link href="/features">Learn More</Link>
          </Button>
        </AnimatedWrapper>

        <AnimatedWrapper
          variants={fadeInUp}
          delay={0.4}
          className="text-sm text-muted-foreground"
        >
          100% Free • Open Source • No Registration Required
        </AnimatedWrapper>
      </AnimatedWrapper>
    </section>
  );
}
