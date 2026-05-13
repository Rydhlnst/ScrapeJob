"use client"

import { LayoutGrid, List, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function JobToolbar({
  count,
  keywordLabel,
  view,
  onChangeView,
  onOpenFilters,
}: {
  count: number
  keywordLabel: string
  view: "grid" | "list"
  onChangeView: (v: "grid" | "list") => void
  onOpenFilters: () => void
}) {
  return (
    <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{count}</span>{" "}
          {keywordLabel} jobs found
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl md:hidden"
            onClick={onOpenFilters}
          >
            <SlidersHorizontal className="mr-2 size-4" />
            Filter
          </Button>
          <Button
            size="icon"
            variant={view === "grid" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => onChangeView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => onChangeView("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

