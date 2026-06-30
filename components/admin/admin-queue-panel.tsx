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
    <section className={cn("overflow-hidden border border-[var(--brand-shell-strong)] bg-white shadow-[var(--shadow-sm)]", className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--brand-ink)]">{title}</h3>
          <p className="text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="space-y-3 bg-white p-4">{children}</div>
    </section>
  )
}
