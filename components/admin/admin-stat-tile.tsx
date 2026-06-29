import type { LucideIcon } from "lucide-react"

import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { cn } from "@/lib/utils"

export function AdminStatTile({
  label,
  value,
  hint,
  icon: Icon,
  status,
  className,
}: {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  status: string
  className?: string
}) {
  return (
    <div className={cn("border border-border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="text-4xl font-semibold tracking-[-0.04em] text-foreground">{value}</div>
        </div>
        <div className="grid size-11 place-items-center border border-border bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm text-muted-foreground">{hint}</p>
        <AdminStatusBadge status={status} />
      </div>
    </div>
  )
}
