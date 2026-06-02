import { Loader2 } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

export function ReviewLoadingState() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-1 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading scraped jobs...
      </div>
      {Array.from({ length: 8 }, (_, idx) => (
        <Skeleton key={idx} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

