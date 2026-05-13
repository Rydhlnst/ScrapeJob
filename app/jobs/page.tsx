import { Suspense } from "react"

import { listCategories } from "@/lib/api/categories"
import { listJobs } from "@/lib/api/jobs"

import { JobCard } from "@/components/public/job-card"
import { JobFilterSidebar } from "@/components/public/job-filter-sidebar"
import { JobSearchBar } from "@/components/public/job-search-bar"
import { PaginationControls } from "@/components/public/pagination-controls"
import { EmptyState } from "@/components/shared/empty-state"
import { Footer } from "@/components/shared/Footer"
import { SaasNavbar } from "@/components/shared/SaasNavbar"
import { Badge } from "@/components/ui/badge"

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const keyword =
    typeof searchParams?.keyword === "string" ? searchParams.keyword : undefined
  const location =
    typeof searchParams?.location === "string"
      ? searchParams.location
      : undefined
  const category =
    typeof searchParams?.category === "string"
      ? searchParams.category
      : undefined
  const jobType =
    typeof searchParams?.jobType === "string" ? searchParams.jobType : undefined
  const source =
    typeof searchParams?.source === "string" ? searchParams.source : undefined
  const sort =
    typeof searchParams?.sort === "string" ? searchParams.sort : undefined
  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1

  const [jobs, categories] = await Promise.all([
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
    listCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <SaasNavbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-4 shadow-sm md:p-5">
            <Suspense fallback={<div className="h-12 w-full" />}>
              <JobSearchBar
                defaultKeyword={keyword}
                defaultLocation={location}
                defaultSort={sort}
              />
            </Suspense>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
            <Suspense fallback={<div className="h-96 w-full rounded-[28px] border border-border bg-card" />}>
              <JobFilterSidebar
                categories={categories}
                category={category}
                jobType={jobType}
                source={source}
              />
            </Suspense>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-semibold text-foreground">
                      {jobs.total}
                    </span>{" "}
                    lowongan
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keyword ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-border bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"
                      >
                        keyword: {keyword}
                      </Badge>
                    ) : null}
                    {location ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-border bg-[hsl(var(--muted))] text-muted-foreground"
                      >
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
      </main>

      <Footer />
    </div>
  )
}
