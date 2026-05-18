import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { ProductGrid } from "@/components/boty/product-grid"
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
      <ProductGrid />
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
      <AuthDialog />
    </main>
  )
}
