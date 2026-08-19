import { Skeleton } from "@/components/ui/skeleton"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"

function JobCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-12 rounded-xl" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-5 w-11/12 rounded-md" />
      <Skeleton className="mt-2 h-5 w-3/4 rounded-md" />
      <Skeleton className="mt-3 h-3.5 w-40 rounded-md" />
      <Skeleton className="mt-1.5 h-3.5 w-24 rounded-md" />
      <Skeleton className="mt-3 h-3 w-full rounded-md" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-20 rounded-md" />
      </div>
    </div>
  )
}

function FilterOptionSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3.5 py-2.5">
      <Skeleton className="h-3.5 w-32 rounded-md" />
      <Skeleton className="h-3 w-6 rounded-md" />
    </div>
  )
}

export default function JobsLoading() {
  return (
    <div className="min-h-screen w-full max-w-none overflow-x-hidden bg-[#fffdf8]">
      <div className="h-24 border-b border-black/10 bg-white" />

      <main className="w-full pb-8 pt-0">
        <SiteFrame>
          <SiteContent>
          <div className="space-y-8">
            <section className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_8px_0_rgba(23,23,23,.04)] md:p-7">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="mt-5 h-12 w-3/4 rounded-lg" />
              <Skeleton className="mt-3 h-5 w-2/3 rounded-md" />
              <Skeleton className="mt-6 h-14 w-full rounded-full" />
            </section>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
              <div className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_6px_0_rgba(23,23,23,.04)]">
                <Skeleton className="h-4 w-16 rounded-md" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="mb-2 h-3 w-20 rounded-md" />
                  <FilterOptionSkeleton />
                  <FilterOptionSkeleton />
                  <FilterOptionSkeleton />
                  <FilterOptionSkeleton />
                </div>
                <div className="mt-6 space-y-2">
                  <Skeleton className="mb-2 h-3 w-20 rounded-md" />
                  <FilterOptionSkeleton />
                  <FilterOptionSkeleton />
                  <FilterOptionSkeleton />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)]">
                  <Skeleton className="h-3 w-32 rounded-md" />
                  <Skeleton className="mt-2 h-4 w-48 rounded-md" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          </SiteContent>
        </SiteFrame>
      </main>
    </div>
  )
}
