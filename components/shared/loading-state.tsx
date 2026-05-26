import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading data...
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}
