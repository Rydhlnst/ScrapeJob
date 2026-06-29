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
    <section className={cn("border border-border bg-card", className)}>
      <div className="border-b border-border px-4 py-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  )
}
