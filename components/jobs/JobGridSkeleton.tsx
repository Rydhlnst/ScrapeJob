import { Skeleton } from "@/components/ui/skeleton"

export function JobGridSkeleton({ view }: { view: "grid" | "list" }) {
  const items = Array.from({ length: view === "list" ? 4 : 6 })
  return (
    <div
      className={
        view === "list"
          ? "grid gap-4"
          : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {items.map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="size-10 rounded-xl" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="mt-5">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

