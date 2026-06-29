"use client"

import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  MonitorSmartphone,
  SearchCheck,
} from "lucide-react"

import type { Job } from "@/types"
import type { LandingHeroContent } from "@/types/landing-content"
import { SiteFrame } from "@/components/shared/SiteShell"
import { JobSearchBar } from "@/components/public/job-search-bar"
import { Button } from "@/components/ui/button"

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

export function HeroJobCard({ job }: { job: Job }) {
  const companyName = job.companyName || "Company undisclosed"

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block w-full rounded-none border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-slate-950 hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-none bg-sky-50 text-xs font-semibold text-sky-700 border border-slate-100">
          {jobInitials(companyName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="line-clamp-1 text-sm font-semibold leading-5 text-slate-950">
                {job.title}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">{companyName}</div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded-none bg-slate-100 px-2 py-1 font-medium text-slate-600">
              <MapPin className="size-3" />
              {job.location || "Location not listed"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-none bg-slate-100 px-2 py-1 font-medium text-slate-600">
              <MonitorSmartphone className="size-3" />
              {inferWorkMode(job.location || "")}
            </span>
            {job.jobType ? (
              <span className="rounded-none bg-sky-50 px-2 py-1 font-medium text-sky-700">
                {job.jobType}
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-4">
            <div className="text-xs font-semibold text-slate-950">
              {job.salaryText || "Salary not listed"}
            </div>
            <div className="text-[10px] text-slate-400">{job.sourceName}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function HeroSection({
  totalJobs,
  totalCategories,
  totalSources,
  content,
  jobs = [],
}: {
  totalJobs: number
  totalCategories: number
  totalSources: number
  content: LandingHeroContent
  jobs?: Job[]
}) {
  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white">
      <SiteFrame className="border-x-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <div className="border-x border-[var(--brand-shell-strong)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-[var(--brand-ink)] sm:text-5xl lg:text-[4.4rem]">
                {content.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                {content.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-11 rounded-none bg-[var(--brand-blue)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-sky)]"
                >
                  <Link href={content.primaryCta.href}>
                    {content.primaryCta.label}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-none border-[var(--brand-shell-strong)] bg-white px-5 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-shell)]"
                >
                  <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
                </Button>
              </div>

              <div className="mt-8">
                <JobSearchBar defaultSort="newest" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                {content.quickLinks.map((link) => (
                  <Link
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    className="rounded-none border border-slate-200 bg-white px-4 py-2 transition-colors hover:border-slate-300 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 border-t border-slate-200/60 pt-6">
                <div className="flex items-center gap-2">
                  <SearchCheck className="size-4 text-[var(--brand-blue)]" />
                  <span>
                    <strong className="font-semibold text-slate-950">{totalJobs}+</strong> lowongan aktif
                  </span>
                </div>
                <div className="hidden size-1 bg-slate-300 sm:block rounded-none" />
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-[var(--brand-blue)]" />
                  <span>
                    <strong className="font-semibold text-slate-950">{totalCategories}</strong> kategori
                  </span>
                </div>
                <div className="hidden size-1 bg-slate-300 sm:block rounded-none" />
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-[var(--brand-blue)]" />
                  <span>
                    <strong className="font-semibold text-slate-950">{totalSources}</strong> sumber web
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] rounded-none">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Lowongan Terbaru
                </span>
              </div>
              <div className="grid gap-3">
                {jobs.map((job) => (
                  <HeroJobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada lowongan terbaru saat ini.
                  </div>
                )}
              </div>
              <div className="mt-2 border-t border-slate-100 pt-4">
                <Button
                  asChild
                  className="h-11 w-full rounded-none bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Link href="/jobs">
                    Lihat semua lowongan
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SiteFrame>
    </section>
  )
}
