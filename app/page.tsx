import { CTASection } from "@/components/landing/CTASection"
import { FeaturedJobs } from "@/components/landing/FeaturedJobs"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { PopularCategories } from "@/components/landing/PopularCategories"
import { TrustedCompanies } from "@/components/landing/TrustedCompanies"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <PopularCategories />
        <FeaturedJobs />
        <HowItWorks />
        <TrustedCompanies />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
