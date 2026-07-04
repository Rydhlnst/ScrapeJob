import type { ReactNode } from "react"

import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function JobDescription({ text }: { text: string }) {
  const hasHtml = /<[a-z][\s\S]*>/i.test(text)
  const content = hasHtml ? stripHtml(text) : text
  return <div className="whitespace-pre-wrap text-slate-700">{content}</div>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

export function JobDetailContent({ job }: { job: Job }) {
  const description = job.description?.trim()

  return (
    <Card className="rounded-[30px] border border-white/80 bg-white/82 p-7 shadow-[var(--shadow-md)]">
      <div className="inline-flex w-fit rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
        Detail lowongan
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)] md:text-4xl">
        {job.title}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        {job.companyName || "Perusahaan tidak diketahui"} -{" "}
        {job.location || "Lokasi tidak disebutkan"}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {job.jobType ? (
          <Badge variant="outline" className="rounded-full border-sky-100 bg-sky-50 text-sky-700">
            {job.jobType}
          </Badge>
        ) : null}
        {job.category ? (
          <Badge variant="outline" className="rounded-full border-white bg-white text-slate-600">
            {job.category}
          </Badge>
        ) : null}
        <Badge variant="outline" className="rounded-full border-amber-100 bg-amber-50 text-amber-700">
          {job.salaryText || "Gaji tidak disebutkan"}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white bg-white text-slate-600">
          Sumber: {job.sourceName}
        </Badge>
      </div>

      <Separator className="my-7" />

      <Section title="Deskripsi">
        {description ? (
          <JobDescription text={description} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-slate-600">
            Deskripsi lowongan tidak tersedia.
          </div>
        )}
      </Section>
    </Card>
  )
}
