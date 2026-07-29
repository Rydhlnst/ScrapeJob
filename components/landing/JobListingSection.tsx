import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"

import type { Job } from "@/types"
import type { LandingFeaturedJobsContent } from "@/types/landing-content"
import { Container } from "@/components/shared/Container"
import { JobCard } from "@/components/public/job-card"
import { Button } from "@/components/ui/button"

export function JobListingSection({
  jobs,
  content,
}: {
  jobs: Job[]
  content: LandingFeaturedJobsContent
}) {
  return (
    <section
      className="border-b border-[var(--brand-shell-strong)] bg-slate-50/70 py-12 lg:py-16"
      id="jobs"
    >
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-primary" />
              Lowongan pilihan
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {content.description}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-slate-200 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Link href="/jobs">
              Lihat semua lowongan
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600">{content.emptyState}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} variant="compact" />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
