import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminEditorSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("overflow-hidden border border-[var(--brand-shell-strong)] bg-white shadow-[var(--shadow-sm)]", className)}>
      <div className="border-b border-[var(--brand-shell-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-blue)]">
          Landing Section
        </div>
        <h3 className="mt-2 text-base font-semibold text-[var(--brand-ink)]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      <div className="space-y-5 bg-white p-4">{children}</div>
    </section>
  )
}
