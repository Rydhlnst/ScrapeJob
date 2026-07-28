"use client"

import Link from "next/link"
import {
  ArrowRight,
  Building2,
  MapPin,
  MonitorSmartphone,
  SearchCheck,
  Users,
} from "lucide-react"

import type { Job } from "@/types"
import type { LandingHeroContent } from "@/types/landing-content"
import { SiteFrame } from "@/components/shared/SiteShell"
import { JobSearchBar } from "@/components/public/job-search-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { categoryColor, jobTypeColor } from "@/components/public/color-tags"

function jobInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function HeroJobCard({ job }: { job: Job }) {
  const companyName = job.companyName || "Perusahaan tidak diketahui"
  const location = job.location || "Lokasi tidak disebutkan"

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group flex h-full flex-col rounded-[14px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-start gap-2">
        {job.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.companyLogo}
            alt=""
            className="size-10 shrink-0 rounded-xl bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-xs font-semibold text-sky-700">
            {jobInitials(companyName)}
          </div>
        )}
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold leading-5 text-slate-900 group-hover:text-[var(--brand-blue)]">
          {job.title}
        </h3>
        <div className="mt-1 text-xs text-slate-500">
          {companyName} · {location}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.jobType ? (
          <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", jobTypeColor(job.jobType))}>
            {job.jobType}
          </Badge>
        ) : null}
        <Badge variant="outline" className="rounded-full border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          On-site
        </Badge>
      </div>

      <div className="mt-3 text-sm font-semibold text-[var(--brand-ink)]">
        {job.salaryText || "Gaji tidak disebutkan"}
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
    <section className="border-b border-[var(--brand-shell-strong)] bg-slate-50/70">
      <SiteFrame className="border-x-0 bg-transparent">
        <div className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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
                  className="h-12 rounded-full bg-[var(--brand-blue)] px-6 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Link href={content.primaryCta.href}>
                    {content.primaryCta.label}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-slate-200 bg-white px-6 text-sm font-semibold text-[var(--brand-ink)] hover:bg-slate-50"
                >
                  <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
                </Button>
              </div>

              <div className="mt-8">
                <JobSearchBar defaultSort="newest" />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
                <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <SearchCheck className="size-3.5 text-[var(--brand-blue)]" />
                    Lowongan
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {totalJobs.toLocaleString("id-ID")}+
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Users className="size-3.5 text-[var(--brand-blue)]" />
                    Pencari kerja
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    200.000+
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Building2 className="size-3.5 text-[var(--brand-blue)]" />
                    Sumber
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {totalSources}
                  </div>
                </div>
              </div>

              {content.quickLinks.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {content.quickLinks.map((link) => (
                    <Link
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:text-[var(--brand-blue)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Lowongan terbaru untukmu
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {jobs.map((job) => (
                  <HeroJobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && (
                  <div className="col-span-3 py-8 text-center text-xs text-slate-400">
                    Tidak ada lowongan terbaru saat ini.
                  </div>
                )}
              </div>
              <div className="mt-2 pt-4">
                <Button
                  asChild
                  className="h-11 w-full rounded-full bg-[var(--brand-blue)] px-4 text-sm font-semibold text-white hover:bg-blue-700"
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
