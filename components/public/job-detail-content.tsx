import type { ReactNode } from "react"

import type { Job } from "@/types"
import { Separator } from "@/components/ui/separator"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export function JobDetailContent({ job }: { job: Job }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-7 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {job.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {job.companyName} • {job.location}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.jobType ? (
          <span className="rounded-full border border-border bg-[hsl(var(--accent-soft))] px-3 py-1 text-xs font-semibold text-[hsl(var(--dark))]">
            {job.jobType}
          </span>
        ) : null}
        {job.category ? (
          <span className="rounded-full border border-border bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
            {job.category}
          </span>
        ) : null}
        {job.salaryText ? (
          <span className="rounded-full border border-border bg-[hsl(var(--muted))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
            {job.salaryText}
          </span>
        ) : null}
      </div>

      <Separator className="my-7" />

      <Section title="Deskripsi">
        <div className="whitespace-pre-wrap text-foreground/90">
          {job.description}
        </div>
      </Section>
    </div>
  )
}

