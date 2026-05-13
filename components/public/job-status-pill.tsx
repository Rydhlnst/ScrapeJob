import type { JobStatus } from "@/types"
import { Badge } from "@/components/ui/badge"

const map: Record<JobStatus, { label: string; className: string }> = {
  raw: { label: "Raw", className: "bg-slate-100 text-slate-700 border-slate-200" },
  draft: { label: "Draft", className: "bg-amber-50 text-amber-700 border-amber-200" },
  published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  duplicate: { label: "Duplicate", className: "bg-purple-50 text-purple-700 border-purple-200" },
}

export function JobStatusPill({ status }: { status: JobStatus }) {
  const meta = map[status]
  return <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
}

