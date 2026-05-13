import Link from "next/link"

import type { Job } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { JobStatusPill } from "./job-status-pill"
import { categoryColor, jobTypeColor } from "./color-tags"

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
        "group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className={cn(compact ? "p-4 pb-2" : "p-5 pb-3")}>
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
                "mt-2 font-semibold text-slate-900 group-hover:text-blue-700",
                compact ? "text-base leading-snug" : "text-lg",
                "line-clamp-2",
              )}
            >
              <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
            </h3>
            <div className="mt-1 line-clamp-1 text-sm text-slate-600">
              {job.companyName}
            </div>
          </div>
          {showStatus ? <JobStatusPill status={job.status} /> : null}
        </div>
      </CardHeader>

      <CardContent className={cn(compact ? "p-4 pt-0" : "p-5 pt-0")}>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="line-clamp-1">{job.location}</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {job.sourceName}
            </span>
            {job.scrapedAt ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {job.scrapedAt}
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "mt-1 text-sm font-semibold",
              job.salaryText ? "text-emerald-700" : "text-slate-600",
            )}
          >
            {job.salaryText ? job.salaryText : "Gaji: -"}
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn(compact ? "p-4 pt-2" : "p-5 pt-2")}>
        <div className="grid w-full gap-2">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href={`/jobs/${job.slug}`}>Lihat Detail</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={job.sourceUrl} target="_blank" rel="noreferrer">
              Lihat Sumber
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
