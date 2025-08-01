import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { CallToActionSection } from "@/components/sections/call-to-action-section"
import { SupportSection } from "@/components/sections/support-section"


export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
      <SupportSection />
    </div>
  )
}
