import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { BestSellerSection } from "@/components/boty/best-seller-section"
import { HomeCategoriesSection } from "@/components/boty/home-categories-section"
import { Testimonials } from "@/components/boty/testimonials"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { Footer } from "@/components/boty/footer"
import { AuthDialog } from "@/components/boty/auth-dialog"

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <BestSellerSection />
      <HomeCategoriesSection />
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
      <AuthDialog />
    </main>
  )
}
