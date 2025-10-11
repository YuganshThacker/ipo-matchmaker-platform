import { NavigationHeader } from "@/components/landing/navigation-header"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustIndicators } from "@/components/landing/trust-indicators"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <NavigationHeader />
      <HeroSection />
      <TrustIndicators />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
