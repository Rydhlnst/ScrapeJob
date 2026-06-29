import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminQueuePanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  )
}
