import type { JobStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

const map: Record<JobStatus, { label: string; className: string }> = {
  raw: { label: "Raw", className: "border-black/10 bg-white text-slate-500" },
  draft: { label: "Draft", className: "border-black/10 bg-white text-slate-700" },
  published: {
    label: "Published",
    className: "border-[#3f95e8]/30 bg-white text-[#2479d1]",
  },
  rejected: {
    label: "Rejected",
    className: "border-black/10 bg-white text-slate-500",
  },
  duplicate: {
    label: "Duplicate",
    className: "border-black/10 bg-white text-slate-500",
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
