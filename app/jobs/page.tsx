import { Suspense } from "react"

import { listCategories } from "@/lib/api/categories"
import { getJobStats, listJobs } from "@/lib/api/jobs"

import { JobCard } from "@/components/public/job-card"
import { JobFilterSidebar } from "@/components/public/job-filter-sidebar"
import { JobSearchBar } from "@/components/public/job-search-bar"
import { PaginationControls } from "@/components/public/pagination-controls"
import { EmptyState } from "@/components/shared/empty-state"
import { Footer } from "@/components/shared/Footer"
import { Navbar } from "@/components/shared/Navbar"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { Badge } from "@/components/ui/badge"

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

  const [jobs, navJobs, categories, stats] = await Promise.all([
    listJobs({
      keyword,
      location,
      category,
      jobType,
      source,
      sort: (sort as any) ?? "newest",
      page,
      perPage: 9,
    }),
    listJobs({ page: 1, perPage: 100, sort: "newest" }),
    listCategories(),
    getJobStats(),
  ])

  const sourceOptions = Object.keys(stats.totalBySource).sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar jobs={navJobs.data} categories={categories} totalJobs={jobs.total} />

      <main className="py-8">
        <SiteFrame>
          <SiteContent>
          <div className="space-y-8">
            <section className="brand-shell overflow-hidden rounded-[36px] border border-white p-5 shadow-[var(--shadow-lg)] md:p-7">
              <div className="space-y-5">
                <div className="inline-flex rounded-full border border-sky-200 bg-white px-3 py-2 text-xs font-semibold tracking-[0.16em] text-sky-700 uppercase shadow-[var(--shadow-sm)]">
                  Papan lowongan
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--brand-ink)] md:text-5xl">
                    Temukan lowongan yang tepat untukmu.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                    Ribuan lowongan dari berbagai sumber dikumpulkan dan diperbarui setiap hari. Gunakan filter untuk mempersempit pencarian.
                  </p>
                </div>
                <Suspense fallback={<div className="h-[60px] w-full" />}>
                  <JobSearchBar
                    defaultKeyword={keyword}
                    defaultLocation={location}
                    defaultSort={sort}
                  />
                </Suspense>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
              <Suspense fallback={<div className="h-96 w-full rounded-[28px] border border-white bg-white" />}>
                <JobFilterSidebar
                  categories={categories}
                  sourceOptions={sourceOptions}
                  category={category}
                  jobType={jobType}
                  source={source}
                />
              </Suspense>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-white bg-white p-5 shadow-[var(--shadow-sm)]">
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
                        <Badge variant="outline" className="rounded-full border-sky-100 bg-sky-50 text-sky-700">
                          keyword: {keyword}
                        </Badge>
                      ) : null}
                      {location ? (
                        <Badge variant="outline" className="rounded-full border-white bg-white text-slate-600">
                          lokasi: {location}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                {jobs.data.length ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {jobs.data.map((job) => (
                        <JobCard key={job.id} job={job} variant="compact" />
                      ))}
                    </div>
                    <div className="pt-2">
                      <Suspense fallback={<div className="h-10 w-full" />}>
                        <PaginationControls
                          page={jobs.page}
                          totalPages={jobs.totalPages}
                        />
                      </Suspense>
                    </div>
                  </>
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

