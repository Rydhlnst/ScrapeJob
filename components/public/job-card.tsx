import Link from "next/link"
import { ArrowRight, BadgeCheck, Bookmark, MapPin } from "lucide-react"

import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn, formatDate } from "@/lib/utils"

import { categoryColor, jobTypeColor } from "./color-tags"
import { JobStatusPill } from "./job-status-pill"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase()).join("")
}

function CompanyLogo({
  logo,
  fallback,
  size = "size-12",
  radius = "rounded-xl",
}: {
  logo?: string | null
  fallback: string
  size?: string
  radius?: string
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt=""
        className={`${size} ${radius} shrink-0 object-cover bg-white ring-1 ring-slate-100`}
        loading="lazy"
      />
    )
  }

  return (
    <div className={`grid ${size} ${radius} shrink-0 place-items-center bg-sky-50 text-sm font-semibold text-sky-700`}>
      {fallback}
    </div>
  )
}

function summaryFromDescription(description: string | null | undefined) {
  if (!description) return null
  const cleaned = description
    .replace(/[#*_`>~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned) return null
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0]
  const source = firstSentence.length >= 40 ? firstSentence : cleaned
  return source.length > 140 ? source.slice(0, 137).trimEnd() + "…" : source
}

export function JobCard({
  job,
  variant = "default",
  showStatus,
  className,
}: {
  job: Job
  variant?: "default" | "compact"
  showStatus?: boolean
  className?: string
}) {
  const compact = variant === "compact"

  if (compact) {
    return <CompactJobCard job={job} showStatus={showStatus} className={className} />
  }

  return <DefaultJobCard job={job} showStatus={showStatus} className={className} />
}

function CompactJobCard({
  job,
  showStatus,
  className,
}: {
  job: Job
  showStatus?: boolean
  className?: string
}) {
  const companyName = job.companyName || "Perusahaan tidak diketahui"
  const location = job.location || "Lokasi tidak disebutkan"
  const summary = summaryFromDescription(job.description)
  const detailHref = `/jobs/${job.slug}`

  return (
    <Link
      href={detailHref}
      className={cn(
        "group relative block h-full rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <CompanyLogo logo={job.companyLogo} fallback={initials(companyName)} />
          <div className="flex items-center gap-2">
            {showStatus ? (
              <JobStatusPill status={job.status} />
            ) : (
              <button
                type="button"
                aria-label="Simpan lowongan"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                className="grid size-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-[var(--brand-blue)]"
              >
                <Bookmark className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-full border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
            >
              <BadgeCheck className="mr-1 size-3" />
              Sumber terverifikasi
            </Badge>
            {job.jobType ? (
              <Badge variant="outline" className={cn("rounded-full font-medium", jobTypeColor(job.jobType))}>
                {job.jobType}
              </Badge>
            ) : null}
            {job.category ? (
              <Badge variant="outline" className={cn("rounded-full font-medium", categoryColor(job.category))}>
                {job.category}
              </Badge>
            ) : null}
          </div>

          <h3 className="mt-3 line-clamp-2 text-[1.05rem] font-semibold leading-6 tracking-[-0.02em] text-slate-900 group-hover:text-[var(--brand-blue)]">
            {job.title}
          </h3>

          <div className="mt-1.5 text-sm font-medium text-slate-700">{companyName}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="size-3.5" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {summary ? (
          <p className="mt-3 line-clamp-1 text-sm leading-6 text-slate-500">{summary}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 pt-3 text-xs text-slate-500">
          <span>{formatDate(job.scrapedAt) ?? "Baru ditemukan"}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--brand-blue)] transition-transform group-hover:translate-x-0.5">
            Lihat detail
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function DefaultJobCard({
  job,
  showStatus,
  className,
}: {
  job: Job
  showStatus?: boolean
  className?: string
}) {
  const companyName = job.companyName || "Perusahaan tidak diketahui"
  const location = job.location || "Lokasi tidak disebutkan"

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]",
        className,
      )}
    >
      <CardHeader className="p-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CompanyLogo logo={job.companyLogo} fallback={initials(companyName)} size="size-11" />
          {showStatus ? (
            <JobStatusPill status={job.status} />
          ) : (
            <button
              type="button"
              aria-label="Simpan lowongan"
              className="grid size-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-[var(--brand-blue)]"
            >
              <Bookmark className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {job.jobType ? (
              <Badge variant="outline" className={cn("rounded-full font-medium", jobTypeColor(job.jobType))}>
                {job.jobType}
              </Badge>
            ) : null}
            {job.category ? (
              <Badge variant="outline" className={cn("rounded-full font-medium", categoryColor(job.category))}>
                {job.category}
              </Badge>
            ) : null}
          </div>

          <h3 className="mt-4 line-clamp-2 text-xl font-semibold leading-8 tracking-[-0.03em] text-slate-950">
            <Link href={`/jobs/${job.slug}`} className="transition-opacity hover:opacity-75">
              {job.title}
            </Link>
          </h3>

          <div className="mt-2 text-sm font-medium text-slate-700">{companyName}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="size-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{job.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-50 px-3 py-1.5 font-medium">{job.sourceName}</span>
          <span className="rounded-full bg-slate-50 px-3 py-1.5 font-medium">
            {formatDate(job.scrapedAt) ?? "Baru ditemukan"}
          </span>
        </div>

        <div className="mt-5 text-sm font-semibold text-[var(--brand-blue)]">
          {job.salaryText || "Gaji tidak disebutkan"}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex w-full flex-col items-center gap-3 p-6">
        {job.sourceUrl ? (
          <Button
            asChild
            className="h-11 w-full rounded-xl bg-[var(--brand-blue)] font-semibold text-white hover:bg-blue-700"
          >
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              Lamar di sumber
            </a>
          </Button>
        ) : null}
        <Link
          href={`/jobs/${job.slug}`}
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          Lihat detail lengkap
        </Link>
      </CardFooter>
    </Card>
  )
}
