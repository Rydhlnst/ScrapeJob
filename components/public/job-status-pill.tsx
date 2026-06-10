import type { JobStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

const map: Record<JobStatus, { label: string; className: string }> = {
  raw: { label: "Raw", className: "border-border bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "border-border bg-background text-foreground" },
  published: {
    label: "Published",
    className: "border-border bg-accent text-accent-foreground",
  },
  rejected: {
    label: "Rejected",
    className: "border-border bg-muted text-muted-foreground",
  },
  duplicate: {
    label: "Duplicate",
    className: "border-border bg-background text-muted-foreground",
  },
}

export function JobStatusPill({ status }: { status: JobStatus }) {
  const meta = map[status]
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  )
}
