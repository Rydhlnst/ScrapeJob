import type { ReactNode } from "react"

import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Lightbulb, Gift } from "lucide-react"

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

function stripHtml(html: string): string {
  let out = decodeEntities(html)
  out = decodeEntities(out)
  return out
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function JobDescription({ text }: { text: string }) {
  return <div className="whitespace-pre-wrap text-slate-700">{stripHtml(text)}</div>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

function ListSection({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ComponentType<{ className?: string }> }) {
  if (!items || items.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="rounded-xl bg-slate-50 p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600">
              <Icon className="mt-0.5 size-4 shrink-0 text-[var(--brand-blue)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase()).join("")
}

function CompanyLogo({
  logo,
  companyName,
}: {
  logo?: string | null
  companyName: string
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={companyName}
        className="size-16 shrink-0 rounded-2xl bg-white object-cover ring-1 ring-slate-100"
      />
    )
  }

  return (
    <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-sky-50 text-lg font-semibold text-sky-700">
      {initials(companyName)}
    </div>
  )
}

export function JobDetailContent({ job }: { job: Job }) {
  const description = job.description?.trim()
  const companyName = job.companyName || "Perusahaan tidak diketahui"

  return (
    <Card className="rounded-[30px] border border-white bg-white p-7 shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="inline-flex w-fit rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Detail lowongan
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)] md:text-4xl">
            {job.title}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {companyName} -{" "}
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
        </div>

        <CompanyLogo logo={job.companyLogo} companyName={companyName} />
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

      {job.requirements && job.requirements.length > 0 ? (
        <>
          <Separator className="my-7" />
          <ListSection title="Requirements" items={job.requirements} icon={CheckCircle2} />
        </>
      ) : null}

      {job.skills && job.skills.length > 0 ? (
        <>
          <Separator className="my-7" />
          <ListSection title="Skills" items={job.skills} icon={Lightbulb} />
        </>
      ) : null}

      {job.benefits && job.benefits.length > 0 ? (
        <>
          <Separator className="my-7" />
          <ListSection title="Benefits" items={job.benefits} icon={Gift} />
        </>
      ) : null}
    </Card>
  )
}
