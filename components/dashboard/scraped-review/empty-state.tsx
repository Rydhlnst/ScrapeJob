import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReviewEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-12 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">No jobs found</p>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
      <Button variant="outline" className="mt-4" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  )
}


