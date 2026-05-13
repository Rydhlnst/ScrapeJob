import Link from "next/link"

import type { Job } from "@/types"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/public/job-card"

export function JobListingSection({ jobs }: { jobs: Job[] }) {
  return (
    <section className="py-14 md:py-20" id="jobs">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader
            title="Recommended Jobs for You"
            description="Explore curated opportunities based on your profile and preferences."
          />
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-border bg-card hover:bg-muted"
          >
            <Link href="/jobs">See more jobs</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} variant="compact" />
          ))}
        </div>
      </Container>
    </section>
  )
}

