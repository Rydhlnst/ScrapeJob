import { Separator } from "@/components/ui/separator"
import type { Job } from "@/types"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  )
}

export function JobDetailContent({ job }: { job: Job }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{job.title}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {job.companyName} • {job.location}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
        {job.jobType ? <span className="rounded-full bg-slate-100 px-3 py-1">{job.jobType}</span> : null}
        {job.category ? <span className="rounded-full bg-slate-100 px-3 py-1">{job.category}</span> : null}
        {job.salaryText ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{job.salaryText}</span> : null}
      </div>

      <Separator className="my-6" />

      <Section title="Deskripsi">
        <div className="whitespace-pre-wrap">{job.description}</div>
      </Section>
    </div>
  )
}
