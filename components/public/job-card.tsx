import Link from "next/link"
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react"

import type { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { sanitizeHtml } from "@/lib/sanitize"

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
    <div className={`grid ${size} ${radius} shrink-0 place-items-center border border-[#ffd36a] bg-white text-sm font-semibold text-[#2479d1]`}>
      {fallback}
    </div>
  )
}

function summaryFromDescription(description: string | null | undefined) {
  if (!description) return null
  const cleaned = description
    .replace(/<[^>]*>/g, " ")
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
        "group relative block h-full min-w-0 rounded-[22px] border border-black/10 bg-white shadow-[0_4px_0_rgba(23,23,23,.04)] transition-all duration-200",
        "hover:-translate-y-1 hover:border-[#ffd36a] hover:bg-white hover:shadow-[0_10px_24px_rgba(63,149,232,.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-full border border-[#3f95e8]/30 bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#2479d1]"
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
          <CompanyLogo logo={job.companyLogo} fallback={initials(companyName)} />
        </div>

        <div className="mt-4 min-w-0">

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

        <div className="mt-4 flex items-center justify-between gap-3 pt-3 text-xs text-muted-foreground">
          <span>{formatDate(job.scrapedAt) ?? "Baru ditemukan"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f95e8] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-[#2479d1]">
            Lihat detail
            <ArrowRight className="size-3" />
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
  const summary = summaryFromDescription(job.description)
  const detailHref = `/jobs/${job.slug}`

  return (
    <Link
      href={detailHref}
      className={cn(
        "group flex h-full min-w-0 flex-col rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#ffd36a] hover:bg-white hover:shadow-[0_10px_24px_rgba(63,149,232,.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <CompanyLogo logo={job.companyLogo} fallback={initials(companyName)} size="size-12" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold leading-6 tracking-[-0.01em] text-slate-900 group-hover:text-[var(--brand-blue)]">
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{companyName}</span>
            <span className="text-slate-300">·</span>
            <span>{location}</span>
          </div>
        </div>
        {showStatus ? <JobStatusPill status={job.status} /> : null}
      </div>

      {summary ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{summary}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {job.jobType ? (
          <Badge variant="outline" className={cn("rounded-full text-[11px] font-medium", jobTypeColor(job.jobType))}>
            {job.jobType}
          </Badge>
        ) : null}
        {job.category ? (
          <Badge variant="outline" className={cn("rounded-full text-[11px] font-medium", categoryColor(job.category))}>
            {job.category}
          </Badge>
        ) : null}
        <Badge
          variant="outline"
          className="rounded-full border border-[#3f95e8]/30 bg-white px-2 py-0.5 text-[11px] font-medium text-[#2479d1]"
        >
          Sumber terverifikasi
        </Badge>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <div>
          <div className="text-sm font-semibold text-[var(--brand-ink)]">
            {job.salaryText || "Gaji tidak disebutkan"}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            {formatDate(job.scrapedAt) ?? "Baru ditemukan"}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f95e8] px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-[#2479d1]">
          Lihat detail
        </span>
      </div>
    </Link>
  )
}
