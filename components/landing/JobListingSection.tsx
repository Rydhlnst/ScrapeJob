"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  MonitorSmartphone,
  Sparkles,
} from "lucide-react"

import type { Job } from "@/types"
import { Container } from "@/components/shared/Container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type ParsedSection = {
  heading: string
  items: string[]
}

function ExpandableText({
  text,
  maxWords = 40,
  className = "text-sm leading-7 text-slate-600",
}: {
  text: string
  maxWords?: number
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const words = text.split(/\s+/)
  const isLong = words.length > maxWords

  if (!isLong) {
    return <p className={className}>{text}</p>
  }

  const displayedText = isExpanded ? text : words.slice(0, maxWords).join(" ") + "..."

  return (
    <div>
      <p className={className}>{displayedText}</p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="size-3.5" />
          </>
        ) : (
          <>
            Read more <ChevronDown className="size-3.5" />
          </>
        )}
      </button>
    </div>
  )
}

function jobInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function inferWorkMode(location: string) {
  const value = location.toLowerCase()
  if (value.includes("remote")) return "Remote"
  if (value.includes("hybrid")) return "Hybrid"
  return "On-site"
}

function formatPostedAt(job: Job) {
  return job.publishedAt || job.scrapedAt || job.createdAt
}

function splitDescription(description: string) {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const sections: ParsedSection[] = []
  let introLines: string[] = []
  let current: ParsedSection | null = null

  for (const line of lines) {
    const normalized = line.replace(/[:\uFF1A]$/, "")
    if (/^(tanggung jawab|responsibilities)$/i.test(normalized)) {
      current = { heading: "Responsibilities", items: [] }
      sections.push(current)
      continue
    }
    if (/^(kualifikasi|qualifications|requirements)$/i.test(normalized)) {
      current = { heading: "Qualifications", items: [] }
      sections.push(current)
      continue
    }
    if (/^(benefit|benefits)$/i.test(normalized)) {
      current = { heading: "Benefits", items: [] }
      sections.push(current)
      continue
    }

    const item = line.replace(/^[-*\u2022]\s*/, "").trim()
    if (current && item) {
      current.items.push(item)
      continue
    }

    introLines.push(item)
  }

  const filteredSections = sections.filter((section) => section.items.length > 0)

  if (filteredSections.length === 0) {
    const fallbackItems = lines
      .map((line) => line.replace(/^[-*\u2022]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 4)

    return {
      intro: fallbackItems[0] ?? "",
      sections:
        fallbackItems.slice(1).length > 0
          ? [
              {
                heading: "Highlights",
                items: fallbackItems.slice(1),
              },
            ]
          : [],
    }
  }

  return {
    intro: introLines.join(" ").trim(),
    sections: filteredSections.slice(0, 3),
  }
}

function HomepageJobCard({
  job,
  active,
  onSelect,
}: {
  job: Job
  active: boolean
  onSelect: () => void
}) {
  const companyName = job.companyName || "Company undisclosed"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-none border bg-white p-5 text-left transition-all duration-200",
        active
          ? "border-slate-900 shadow-[var(--shadow-md)] ring-1 ring-slate-900/10"
          : "border-slate-200 hover:border-slate-300 hover:shadow-[var(--shadow-sm)]",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-none bg-sky-50 text-sm font-semibold text-sky-700">
          {jobInitials(companyName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
                {job.title}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-700">{companyName}</div>
            </div>
            <Bookmark className={cn("mt-1 size-4 shrink-0", active ? "text-slate-900" : "text-slate-400")} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-none bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
              <MapPin className="size-3.5" />
              {job.location || "Location not listed"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-none bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
              <MonitorSmartphone className="size-3.5" />
              {inferWorkMode(job.location || "")}
            </span>
            {job.jobType ? (
              <span className="rounded-none bg-sky-50 px-3 py-1.5 font-medium text-sky-700">
                {job.jobType}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-sm font-semibold text-slate-950">
              {job.salaryText || "Salary not listed"}
            </div>
            <div className="text-xs text-slate-500">{job.sourceName}</div>
          </div>
        </div>
      </div>
    </button>
  )
}

export function JobListingSection({ jobs }: { jobs: Job[] }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? "")

  useEffect(() => {
    setSelectedJobId(jobs[0]?.id ?? "")
  }, [jobs])

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]

  if (!selectedJob) return null

  const companyName = selectedJob.companyName || "Company undisclosed"
  const parsed = splitDescription(selectedJob.description || "")

  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-[#f8fbff] py-10 lg:py-12" id="jobs">
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-[var(--shadow-sm)]">
              <Sparkles className="size-3.5 text-sky-600" />
              Browse jobs now
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-4xl">
              Browse listings and preview the role without leaving the homepage.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Compare recent openings, inspect salary and work setup, then open the full listing only when
              the role looks relevant.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-none border-slate-200 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Link href="/jobs">
              View full jobs page
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(380px,1.1fr)]">
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-950">{jobs.length} visible jobs</div>
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Newest first
              </div>
            </div>

            <ScrollArea className="rounded-none border border-slate-200 bg-white p-3 shadow-[var(--shadow-sm)]">
              <div className="grid max-h-[760px] gap-3 pr-2">
                {jobs.map((job) => (
                  <HomepageJobCard
                    key={job.id}
                    job={job}
                    active={job.id === selectedJob.id}
                    onSelect={() => setSelectedJobId(job.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="min-w-0">
            <div className="sticky top-24 rounded-none border border-slate-200 bg-white p-6 shadow-[var(--shadow-md)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Selected preview
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 lg:text-[2rem]">
                    {selectedJob.title}
                  </h3>
                </div>
                <div className="grid size-12 place-items-center rounded-none bg-slate-950 text-sm font-semibold text-white">
                  {jobInitials(companyName)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="size-4" />
                  {companyName}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" />
                  {selectedJob.location || "Location not listed"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" />
                  {formatPostedAt(selectedJob)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-none border-slate-200 bg-slate-50 text-slate-700">
                  {selectedJob.salaryText || "Salary not listed"}
                </Badge>
                {selectedJob.jobType ? (
                  <Badge variant="outline" className="rounded-none border-sky-100 bg-sky-50 text-sky-700">
                    {selectedJob.jobType}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-none border-slate-200 bg-white text-slate-700">
                  {inferWorkMode(selectedJob.location || "")}
                </Badge>
                <Badge variant="outline" className="rounded-none border-slate-200 bg-white text-slate-700">
                  Source: {selectedJob.sourceName}
                </Badge>
              </div>

              <div className="mt-6 rounded-none border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-950">Role snapshot</div>
                <ExpandableText
                  text={parsed.intro || "Open the full job detail page for the complete description and application steps."}
                  maxWords={40}
                  className="mt-2 text-sm leading-7 text-slate-600"
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {parsed.sections.map((section) => (
                  <div key={section.heading} className="rounded-none border border-slate-200 p-5">
                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {section.heading}
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {section.items.slice(0, 4).map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-none bg-sky-600" />
                          <div className="min-w-0 flex-1">
                            <ExpandableText
                              text={item}
                              maxWords={20}
                              className="text-sm leading-6 text-slate-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 flex-1 rounded-none bg-slate-950 font-semibold text-white hover:bg-slate-800">
                  <a href={selectedJob.sourceUrl} target="_blank" rel="noreferrer">
                    Apply on source
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 flex-1 rounded-none border-slate-200 bg-white font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Link href={`/jobs/${selectedJob.slug}`}>Open full detail</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
