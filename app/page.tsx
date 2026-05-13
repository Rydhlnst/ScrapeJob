import { Footer } from "@/components/shared/Footer"
import { CTASection } from "@/components/landing/CTASection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { PopularCategories } from "@/components/landing/PopularCategories"
import { TrustedCompanies } from "@/components/landing/TrustedCompanies"
import { SaasNavbar } from "@/components/shared/SaasNavbar"
import { BenefitsSection } from "@/components/landing/BenefitsSection"
import { JobListingSection } from "@/components/landing/JobListingSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { listJobs } from "@/lib/api/jobs"
import { listCategories } from "@/lib/api/categories"

export default async function HomePage() {
  const [jobsRes, categories] = await Promise.all([
    listJobs({ page: 1, perPage: 6, sort: "newest" }),
    listCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <SaasNavbar />
      <main>
        <HeroSection />
        <TrustedCompanies />
        <BenefitsSection />
        <PopularCategories categories={categories} />
        <JobListingSection jobs={jobsRes.data} />
        <HowItWorks />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
