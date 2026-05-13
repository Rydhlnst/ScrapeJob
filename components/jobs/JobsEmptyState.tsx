import Link from "next/link"

import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function JobsEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <Card className="rounded-2xl border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </div>
      <div className="mt-4 text-lg font-semibold text-foreground">
        No jobs found
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Try adjusting your keyword or filters.
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onClear} className="rounded-xl">
          Clear filters
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Card>
  )
}

