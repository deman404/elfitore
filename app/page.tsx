import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { BestSellerSection } from "@/components/boty/best-seller-section"
import { HomeCategoriesSection } from "@/components/boty/home-categories-section"
import { ShopNowButton } from "@/components/boty/shop-now-button"
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
      <div className="bg-background py-8 sm:py-10">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <ShopNowButton />
        </div>
      </div>
      <HomeCategoriesSection />
      <div className="bg-background py-8 sm:py-10">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <ShopNowButton />
        </div>
      </div>
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
      <AuthDialog />
    </main>
  )
}
