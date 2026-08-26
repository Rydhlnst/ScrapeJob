import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Job } from "@/types"
import type { LandingFeaturedJobsContent } from "@/types/landing-content"
import { LandingEyebrow } from "@/components/landing/JobkanVisuals"
import { Container } from "@/components/shared/Container"
import { JobCard } from "@/components/public/job-card"
import { Button } from "@/components/ui/button"
import type { LandingSectionCopy } from "@/types/landing-content"

export function JobListingSection({ jobs, content, copy }: { jobs: Job[]; content: LandingFeaturedJobsContent; copy: LandingSectionCopy["featured"] }) {
  return (
    <section className="bg-[#f6f9fc] py-20 md:py-28" id="jobs">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <LandingEyebrow>{copy.eyebrow}</LandingEyebrow>
          <h2 className="jobkan-section-title mt-5 text-4xl font-semibold leading-[1.08] tracking-[-.055em] text-[#171717] md:text-6xl">{content.title}</h2>
          <p className="mt-5 text-slate-500">{content.description}</p>
        </div>
        {jobs.length ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {jobs.slice(0, 8).map((job) => <JobCard key={job.id} job={job} variant="compact" className="border border-black/10 shadow-[0_4px_0_rgba(23,23,23,.04)]" />)}
          </div>
        ) : <p className="mt-12 text-center text-sm text-slate-500">{content.emptyState}</p>}
        <div className="mt-10 text-center">
          <Button asChild className="h-11 rounded-xl bg-[#3f95e8] px-6 font-semibold text-white shadow-[0_4px_0_rgba(23,23,23,.13)] hover:bg-[#2479d1]"><Link href="/jobs">{copy.buttonLabel}<ArrowRight className="ml-2 size-4" /></Link></Button>
        </div>
      </Container>
    </section>
  )
}
