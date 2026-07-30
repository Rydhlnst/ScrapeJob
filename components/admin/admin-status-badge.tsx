import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const tone: Record<string, string> = {
  raw: "border-sky-200 bg-sky-50 text-sky-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  duplicate: "border-slate-200 bg-slate-100 text-slate-700",
  attention: "border-rose-200 bg-rose-50 text-rose-700",
  empty: "border-slate-200 bg-white text-slate-600",
}

export function AdminStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-lg border px-2 py-1 capitalize", tone[status] ?? tone.empty, className)}
    >
      {status}
    </Badge>
  )
}
