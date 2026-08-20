import { Suspense } from "react"

import { listCategories } from "@/lib/api/categories"
import { getJobStats, listJobs } from "@/lib/api/jobs"

import { JobFilterSidebar } from "@/components/public/job-filter-sidebar"
import { JobSearchBar } from "@/components/public/job-search-bar"
import { JobsListLazy } from "@/components/public/jobs-list-lazy"
import { EmptyState } from "@/components/shared/empty-state"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { Badge } from "@/components/ui/badge"
import { mockJobs } from "@/data/mock-jobs"
import { mockCategories } from "@/data/mock-categories"
import type { JobStats } from "@/types"

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}

  const keyword =
    typeof resolvedSearchParams.keyword === "string"
      ? resolvedSearchParams.keyword
      : undefined
  const location =
    typeof resolvedSearchParams.location === "string"
      ? resolvedSearchParams.location
      : undefined
  const category =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : undefined
  const jobType =
    typeof resolvedSearchParams.jobType === "string"
      ? resolvedSearchParams.jobType
      : undefined
  const source =
    typeof resolvedSearchParams.source === "string"
      ? resolvedSearchParams.source
      : undefined
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : undefined
  const page =
    typeof resolvedSearchParams.page === "string"
      ? Number(resolvedSearchParams.page)
      : 1

  const normalizedSort = (["newest", "oldest", "relevance", "company"] as const).includes(
    sort as "newest" | "oldest" | "relevance" | "company",
  )
    ? (sort as "newest" | "oldest" | "relevance" | "company")
    : "newest"

  const jobsQuery = {
    keyword,
    location,
    category,
    jobType,
    source,
    sort: normalizedSort,
  }

  const fallbackJobs = {
    data: mockJobs,
    page: 1,
    perPage: mockJobs.length,
    total: mockJobs.length,
    totalPages: 1,
  }
  const fallbackStats: JobStats = {
    totalActive: mockJobs.length,
    totalBySource: { "Source Website": mockJobs.length },
    totalByCategory: {},
    totalByJobType: {},
    newToday: mockJobs.length,
    remoteJobs: 0,
  }

  const [jobs, navJobs, categories, stats] = await Promise.all([
    listJobs({ ...jobsQuery, page, perPage: 9 }).catch(() => fallbackJobs),
    listJobs({ page: 1, perPage: 100, sort: "newest" }).catch(() => fallbackJobs),
    listCategories().catch(() => mockCategories),
    getJobStats().catch(() => fallbackStats),
  ])

  const sourceOptions = Object.keys(stats.totalBySource).sort((a, b) =>
    a.localeCompare(b),
  )

  const quickFilters = [
    { label: "S1 Jakarta", keyword: "S1 Jakarta" },
    { label: "Fresh Graduate", keyword: "Fresh Graduate" },
    { label: "Remote", keyword: "Remote" },
    { label: "Full Time", keyword: "Full Time" },
  ]

  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-white">
      <Navbar jobs={navJobs.data} categories={categories} totalJobs={jobs.total} />

      <main className="min-h-screen w-full bg-white pt-24 pb-16">
        <SiteFrame>
          <SiteContent>
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[30px] border border-black/10 bg-white p-8 shadow-[0_8px_0_rgba(23,23,23,.04)] md:p-12">
              <div className="space-y-6 text-center">
                <h1 className="jobkan-section-title text-4xl font-extrabold tracking-[-0.06em] text-[#171717] md:text-6xl">
                  Temukan lowongan yang tepat, bukan sekadar banyak
                </h1>
                <p className="mx-auto max-w-xl text-base leading-7 text-slate-500">
                  Ribuan lowongan terverifikasi, diperbarui tiap hari — hanya yang relevan untukmu.
                </p>

                <div className="mx-auto max-w-2xl">
                  <Suspense fallback={<div className="h-[60px] w-full" />}>
                    <JobSearchBar
                      defaultKeyword={keyword}
                      defaultLocation={location}
                      defaultSort={sort}
                    />
                  </Suspense>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {quickFilters.map((filter) => (
                    <a
                      key={filter.label}
                      href={`/jobs?keyword=${encodeURIComponent(filter.keyword)}`}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_3px_0_rgba(23,23,23,.04)] transition-all hover:-translate-y-0.5 hover:border-[#3f95e8]/50 hover:bg-[#f7f9fb] hover:text-[#171717]"
                    >
                      {filter.label}
                    </a>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--brand-ink)]">{stats.totalActive.toLocaleString("id-ID")}+</div>
                    <div className="text-xs text-slate-400">lowongan aktif</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--brand-ink)]">200.000+</div>
                    <div className="text-xs text-slate-400">pencari kerja</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--brand-ink)]">{Object.keys(stats.totalBySource).length}</div>
                    <div className="text-xs text-slate-400">sumber terverifikasi</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
              <Suspense fallback={<div className="h-96 w-full rounded-[28px] border border-white bg-white" />}>
                <JobFilterSidebar
                  categories={categories}
                  sourceOptions={sourceOptions}
                  counts={{
                    category: stats.totalByCategory,
                    jobType: stats.totalByJobType,
                    source: stats.totalBySource,
                  }}
                  category={category}
                  jobType={jobType}
                  source={source}
                />
              </Suspense>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Hasil pencarian
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Menampilkan{" "}
                        <span className="font-semibold text-foreground">
                          {jobs.total}
                        </span>{" "}
                        lowongan
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keyword ? (
                        <Badge variant="outline" className="rounded-full border-[#f2a23a] bg-white text-[#2479d1]">
                          keyword: {keyword}
                        </Badge>
                      ) : null}
                      {location ? (
                        <Badge variant="outline" className="rounded-full border-border bg-card text-card-foreground">
                          lokasi: {location}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                {jobs.data.length ? (
                  <JobsListLazy initial={jobs} query={jobsQuery} />
                ) : (
                  <EmptyState
                    title="Tidak ada lowongan ditemukan"
                    description="Coba ubah keyword atau filter."
                  />
                )}
              </div>
            </div>
          </div>
          </SiteContent>
        </SiteFrame>
      </main>

      <Footer />
    </div>
  )
}
