import { JobsPageClient } from "@/components/jobs/JobsPageClient"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <JobsPageClient />
      <Footer />
    </div>
  )
}
