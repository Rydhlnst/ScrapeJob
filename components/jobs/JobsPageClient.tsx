"use client"

import { useMemo, useState } from "react"

import { Filter } from "lucide-react"

import { jobs as allJobs } from "@/constants/jobs"
import type { JobListing } from "@/constants/jobs"
import { Container } from "@/components/shared/Container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { JobFilterSidebar, type JobFilters } from "@/components/jobs/JobFilterSidebar"
import { JobGridSkeleton } from "@/components/jobs/JobGridSkeleton"
import { JobListGrid } from "@/components/jobs/JobListGrid"
import { JobSearchHeader, type JobSort } from "@/components/jobs/JobSearchHeader"
import { JobToolbar } from "@/components/jobs/JobToolbar"
import { JobsEmptyState } from "@/components/jobs/JobsEmptyState"

function daysAgoLabelToDays(value: string) {
  const trimmed = value.trim().toLowerCase()
  const match = trimmed.match(/^(\d+)\s*d\b/)
  if (match) return Number(match[1])
  const hours = trimmed.match(/^(\d+)\s*h\b/)
  if (hours) return Math.ceil(Number(hours[1]) / 24)
  return 999
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function applyFilters({
  jobs,
  keyword,
  location,
  salary,
  filters,
  sort,
}: {
  jobs: JobListing[]
  keyword: string
  location: string
  salary: string
  filters: JobFilters
  sort: JobSort
}) {
  const filtered = jobs.filter((job) => {
    const kw = keyword.trim()
    if (kw) {
      const ok =
        includesCI(job.title, kw) ||
        includesCI(job.company, kw) ||
        includesCI(job.description, kw)
      if (!ok) return false
    }

    const loc = location.trim()
    if (loc && !includesCI(job.location, loc)) return false

    const sal = salary.trim()
    if (sal && !includesCI(job.salary, sal)) return false

    if (filters.jobTypes.length && !filters.jobTypes.includes(job.type))
      return false
    if (filters.experience.length && !filters.experience.includes(job.experience))
      return false
    if (filters.workTypes.length && !filters.workTypes.includes(job.workType))
      return false

    if (filters.lastUpdated !== "any") {
      const days = daysAgoLabelToDays(job.postedAt)
      const limit =
        filters.lastUpdated === "24h"
          ? 1
          : filters.lastUpdated === "7d"
            ? 7
            : 30
      if (days > limit) return false
    }

    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    return daysAgoLabelToDays(a.postedAt) - daysAgoLabelToDays(b.postedAt)
  })

  return sorted
}

const defaultFilters: JobFilters = {
  jobTypes: [],
  experience: [],
  workTypes: [],
  lastUpdated: "any",
}

export function JobsPageClient() {
  const [keyword, setKeyword] = useState("UI/UX Designer")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [sort, setSort] = useState<JobSort>("latest")
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const results = useMemo(
    () =>
      applyFilters({
        jobs: allJobs,
        keyword,
        location,
        salary,
        filters,
        sort,
      }),
    [filters, keyword, location, salary, sort],
  )

  const keywordLabel = keyword.trim() ? keyword.trim() : "All"

  function submit() {
    setIsLoading(true)
    window.setTimeout(() => setIsLoading(false), 450)
  }

  function clearAll() {
    setKeyword("")
    setLocation("")
    setSalary("")
    setSort("latest")
    setFilters(defaultFilters)
    submit()
  }

  const activeBadges = [
    ...filters.jobTypes.map((v) => ({ key: `type:${v}`, label: v })),
    ...filters.experience.map((v) => ({ key: `exp:${v}`, label: v })),
    ...filters.workTypes.map((v) => ({ key: `work:${v}`, label: v })),
    ...(filters.lastUpdated !== "any"
      ? [{ key: `updated:${filters.lastUpdated}`, label: `Updated: ${filters.lastUpdated}` }]
      : []),
    ...(location.trim() ? [{ key: "loc", label: `Location: ${location.trim()}` }] : []),
    ...(salary.trim() ? [{ key: "sal", label: `Salary: ${salary.trim()}` }] : []),
  ]

  return (
    <main className="py-8">
      <Container>
        <div className="space-y-5">
          <JobSearchHeader
            keyword={keyword}
            location={location}
            salary={salary}
            sort={sort}
            onChange={(patch) => {
              if (patch.keyword !== undefined) setKeyword(patch.keyword)
              if (patch.location !== undefined) setLocation(patch.location)
              if (patch.salary !== undefined) setSalary(patch.salary)
              if (patch.sort !== undefined) setSort(patch.sort)
            }}
            onSubmit={submit}
          />

          <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
            <div className="hidden lg:block">
              <div className="sticky top-[84px]">
                <JobFilterSidebar
                  filters={filters}
                  onChange={(next) => {
                    setFilters(next)
                    submit()
                  }}
                  onClear={clearAll}
                />
              </div>
            </div>

            <div className="space-y-4">
              <JobToolbar
                count={results.length}
                keywordLabel={keywordLabel}
                view={view}
                onChangeView={(v) => setView(v)}
                onOpenFilters={() => setMobileFiltersOpen(true)}
              />

              {activeBadges.length ? (
                <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      Active filters
                    </div>
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    {activeBadges.map((b) => (
                      <Badge
                        key={b.key}
                        variant="outline"
                        className="rounded-full border-border/80 bg-muted/40"
                      >
                        {b.label}
                      </Badge>
                    ))}
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      className="rounded-xl text-primary hover:bg-[hsl(var(--primary-soft))]"
                      onClick={clearAll}
                    >
                      Clear
                    </Button>
                  </div>
                </Card>
              ) : null}

              {isLoading ? (
                <JobGridSkeleton view={view} />
              ) : results.length ? (
                <JobListGrid
                  jobs={results}
                  view={view}
                  savedIds={savedIds}
                  onToggleSaved={(id) =>
                    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />
              ) : (
                <JobsEmptyState onClear={clearAll} />
              )}
            </div>
          </div>
        </div>
      </Container>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-auto border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-5">
            <JobFilterSidebar
              filters={filters}
              onChange={(next) => {
                setFilters(next)
                submit()
              }}
              onClear={clearAll}
            />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
