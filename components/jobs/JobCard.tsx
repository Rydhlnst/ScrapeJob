"use client"

import { memo } from "react"

import { ArrowRight, Bookmark, CheckCircle2, MapPin } from "lucide-react"

import type { JobListing } from "@/constants/jobs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join("")
}

function CompanyLogo({
  company,
  color,
}: {
  company: string
  color?: string
}) {
  return (
    <div
      className="grid size-11 place-items-center rounded-2xl text-sm font-semibold text-white shadow-sm ring-1 ring-border/60"
      style={{ backgroundColor: color ?? "#4169e1" }}
      aria-hidden="true"
    >
      {initials(company)}
    </div>
  )
}

export const JobCard = memo(function JobCard({
  job,
  saved,
  onToggleSaved,
  view = "grid",
}: {
  job: JobListing
  saved: boolean
  onToggleSaved: (id: string) => void
  view?: "grid" | "list"
}) {
  return (
    <Card
      className={cn(
        "group h-full rounded-2xl border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        view === "list" && "p-5",
      )}
    >
      <div className={cn(view === "list" ? "flex gap-4" : "space-y-4")}>
        <div className={cn(view === "list" ? "shrink-0" : "")}>
          <CompanyLogo company={job.company} color={job.companyBrandColor} />
        </div>

        <div className={cn(view === "list" ? "min-w-0 flex-1" : "")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold text-foreground">
                  {job.company}
                </div>
                {job.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="size-3.5" />
                    Verified
                  </span>
                ) : null}
              </div>
              <div className="mt-1 line-clamp-1 text-base font-semibold text-foreground">
                {job.title}
              </div>
            </div>
            <Button
              size="icon"
              variant={saved ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                saved
                  ? "shadow-sm"
                  : "border-border/80 bg-card hover:bg-muted",
              )}
              onClick={() => onToggleSaved(job.id)}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-full">
              {job.type}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
            <Badge
              variant="outline"
              className="rounded-full border-border/80 bg-muted/40"
            >
              {job.workType}
            </Badge>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>

          <Separator className="my-4" />

          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="font-semibold text-foreground">{job.salary}</div>
            <div className="text-xs text-muted-foreground">{job.postedAt}</div>
          </div>

          <Button type="button" className="mt-4 w-full rounded-xl shadow-sm">
            View details
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
})
