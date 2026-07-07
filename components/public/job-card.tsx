import Link from "next/link"
import { Bookmark, MapPin } from "lucide-react"

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

function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }

  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

const cardPalettes = [
  {
    shell: "bg-[linear-gradient(135deg,#eef6ff_0%,#dff2ff_100%)] border-sky-100",
    avatar: "bg-white text-sky-700 border border-white",
    meta: "text-sky-700",
    footer: "bg-white",
  },
  {
    shell: "bg-[linear-gradient(135deg,#fff9dc_0%,#fff0bf_100%)] border-amber-100",
    avatar: "bg-white text-amber-700 border border-white",
    meta: "text-amber-700",
    footer: "bg-white",
  },
  {
    shell: "bg-[linear-gradient(135deg,#eef1ff_0%,#e2e8ff_100%)] border-indigo-100",
    avatar: "bg-white text-indigo-700 border border-white",
    meta: "text-indigo-700",
    footer: "bg-white",
  },
  {
    shell: "bg-[linear-gradient(135deg,#f6fbff_0%,#ebf4ff_100%)] border-blue-100",
    avatar: "bg-white text-blue-700 border border-white",
    meta: "text-blue-700",
    footer: "bg-white",
  },
] as const

function paletteForJob(job: Job) {
  const key = `${job.companyName ?? ""}-${job.title}-${job.category ?? ""}`.toLowerCase()
  return cardPalettes[hashToIndex(key, cardPalettes.length)]
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
  const companyName = job.companyName || "Perusahaan tidak diketahui"
  const location = job.location || "Lokasi tidak disebutkan"
  const palette = paletteForJob(job)

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-none border p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        palette.shell,
        className,
      )}
    >
      <CardHeader className={cn(compact ? "p-5 pb-3" : "p-6 pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "grid size-11 place-items-center rounded-none text-sm font-semibold shadow-[var(--shadow-sm)]",
              palette.avatar,
            )}
          >
            {initials(companyName)}
          </div>
          {showStatus ? (
            <JobStatusPill status={job.status} />
          ) : (
            <button
              type="button"
              aria-label="Save job"
              className="grid size-9 place-items-center rounded-none border border-white bg-white text-slate-500 transition-colors hover:text-slate-900"
            >
              <Bookmark className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {job.jobType ? (
              <Badge variant="outline" className={cn("rounded-none font-medium", jobTypeColor(job.jobType))}>
                {job.jobType}
              </Badge>
            ) : null}
            {job.category ? (
              <Badge variant="outline" className={cn("rounded-none font-medium", categoryColor(job.category))}>
                {job.category}
              </Badge>
            ) : null}
          </div>

          <h3
            className={cn(
              "mt-4 line-clamp-2 font-semibold tracking-[-0.03em] text-slate-950",
              compact ? "text-[1.15rem] leading-7" : "text-xl leading-8",
            )}
          >
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

      <CardContent className={cn(compact ? "p-5 pt-0" : "p-6 pt-0")}>
        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{job.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-none border border-white bg-white px-3 py-1.5 font-medium">
            {job.sourceName}
          </span>
          <span className="rounded-none border border-white bg-white px-3 py-1.5 font-medium">
            {formatDate(job.scrapedAt) ?? "Baru ditemukan"}
          </span>
        </div>

        <div className={cn("mt-5 text-sm font-semibold", palette.meta)}>
          {job.salaryText || "Gaji tidak disebutkan"}
        </div>
      </CardContent>

      <CardFooter className={cn("mt-auto flex w-full flex-col items-center gap-3", palette.footer, compact ? "p-5" : "p-6")}>
        {job.sourceUrl ? (
          <Button
            asChild
            className="h-11 w-full rounded-none bg-blue-600 font-semibold text-white hover:bg-blue-700"
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

