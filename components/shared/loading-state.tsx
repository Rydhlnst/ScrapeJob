import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

