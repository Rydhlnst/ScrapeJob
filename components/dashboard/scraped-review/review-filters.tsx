import { ListFilter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScrapedJobStatus } from "@/types/job"

type Props = {
  searchInput: string
  sourceFilter: string
  statusFilter: ScrapedJobStatus | "all"
  sources: string[]
  onSearchInputChange: (value: string) => void
  onSourceFilterChange: (value: string) => void
  onStatusFilterChange: (value: ScrapedJobStatus | "all") => void
  onRefresh: () => void
}

const preferredSources = ["jobstreetexpress", "glints", "linkedin", "indeed", "other"]

export function ReviewFilters({
  searchInput,
  sourceFilter,
  statusFilter,
  sources,
  onSearchInputChange,
  onSourceFilterChange,
  onStatusFilterChange,
  onRefresh,
}: Props) {
  const sourceOptions = Array.from(new Set(["all", ...preferredSources, ...sources.map((item) => item.toLowerCase())]))

  return (
    <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Search job title, company, or location..."
          className="bg-white pl-9"
        />
      </div>

      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          {sourceOptions.map((item) => (
            <SelectItem key={item} value={item}>
              {item === "all" ? "All Sources" : item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as ScrapedJobStatus | "all")}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Draft Created</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="all">All Statuses</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onRefresh}>
        <ListFilter className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  )
}

