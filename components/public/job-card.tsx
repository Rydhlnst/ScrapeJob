import Link from "next/link"

import type { Job } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { JobStatusPill } from "./job-status-pill"
import { categoryColor, jobTypeColor } from "./color-tags"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join("")
}

function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

const avatarPalettes = [
  "bg-emerald-100 text-emerald-900",
  "bg-sky-100 text-sky-900",
  "bg-violet-100 text-violet-900",
  "bg-rose-100 text-rose-900",
  "bg-amber-100 text-amber-950",
  "bg-teal-100 text-teal-900",
] as const

function companyAvatarClass(companyName: string) {
  const idx = hashToIndex(companyName.toLowerCase(), avatarPalettes.length)
  return avatarPalettes[idx]
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

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <CardHeader className={cn(compact ? "p-5 pb-3" : "p-6 pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {job.jobType ? (
                <Badge
                  variant="outline"
                  className={cn("font-medium", jobTypeColor(job.jobType))}
                >
                  {job.jobType}
                </Badge>
              ) : null}
              {job.category ? (
                <Badge
                  variant="outline"
                  className={cn("font-medium", categoryColor(job.category))}
                >
                  {job.category}
                </Badge>
              ) : null}
            </div>
            <h3
              className={cn(
                "mt-3 font-semibold tracking-tight text-foreground",
                compact ? "text-base leading-snug" : "text-lg leading-snug",
                "line-clamp-2",
              )}
            >
              <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <div
                className={cn(
                  "grid size-9 place-items-center rounded-full shadow-sm ring-1 ring-black/5",
                  companyAvatarClass(job.companyName),
                )}
              >
                <span className="text-xs font-semibold">
                  {initials(job.companyName)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-medium text-muted-foreground">
                  {job.companyName}
                </div>
                <div className="line-clamp-1 text-xs text-muted-foreground">
                  {job.location}
                </div>
              </div>
            </div>
          </div>
          {showStatus ? <JobStatusPill status={job.status} /> : null}
        </div>
      </CardHeader>

      <CardContent className={cn(compact ? "p-5 pt-0" : "p-6 pt-0")}>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-[hsl(var(--muted))] px-2.5 py-1">
            {job.sourceName}
          </span>
          {job.scrapedAt ? (
            <span className="rounded-full border border-border bg-[hsl(var(--muted))] px-2.5 py-1">
              {job.scrapedAt}
            </span>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-4 text-sm font-semibold",
            job.salaryText ? "text-[hsl(var(--primary))]" : "text-muted-foreground",
          )}
        >
          {job.salaryText ? job.salaryText : "Gaji: -"}
        </div>
      </CardContent>

      <CardFooter className={cn(compact ? "p-5 pt-2" : "p-6 pt-2")}>
        <div className="grid w-full gap-2">
          <Button
            asChild
            className="w-full rounded-full bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
          >
            <Link href={`/jobs/${job.slug}`}>Lihat detail</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-full border-border bg-card hover:bg-muted"
          >
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              Lihat sumber
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
