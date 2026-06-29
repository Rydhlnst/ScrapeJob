import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { cn } from "@/lib/utils"

export function AdminListRow({
  title,
  description,
  href,
  status,
  meta,
  className,
}: {
  title: string
  description?: string | null
  href: string
  status: string
  meta?: string | null
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-3 border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
      <div className="flex items-center gap-3">
        {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
        <AdminStatusBadge status={status} />
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  )
}
