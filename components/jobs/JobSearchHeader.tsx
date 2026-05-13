"use client"

import { BadgeDollarSign, MapPin, Search, SlidersHorizontal } from "lucide-react"

import { popularSearches } from "@/constants/jobs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type JobSort = "latest"

export function JobSearchHeader({
  keyword,
  location,
  salary,
  sort,
  onChange,
  onSubmit,
}: {
  keyword: string
  location: string
  salary: string
  sort: JobSort
  onChange: (patch: Partial<{ keyword: string; location: string; salary: string; sort: JobSort }>) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-3">
      <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_220px_130px] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => onChange({ keyword: e.target.value })}
              className="h-12 rounded-xl pl-9"
              placeholder="UI/UX Designer"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="h-12 rounded-xl pl-9"
              placeholder="Anywhere"
            />
          </div>

          <div className="relative">
            <BadgeDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={salary}
              onChange={(e) => onChange({ salary: e.target.value })}
              className="h-12 rounded-xl pl-9"
              placeholder="USD 3k - 15k"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Select value={sort} onValueChange={(v) => onChange({ sort: v as JobSort })}>
              <SelectTrigger className="h-12 rounded-xl pl-9">
                <SelectValue placeholder="Sort by: Latest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onSubmit} className="h-12 rounded-xl shadow-sm">
            Search
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-muted-foreground">Popular searches:</div>
        {popularSearches.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onChange({ keyword: chip })}
            className={cn(
              "rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground",
              "hover:bg-[hsl(var(--primary-soft))] hover:text-primary transition-colors",
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
