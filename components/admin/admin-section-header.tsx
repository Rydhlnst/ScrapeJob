import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-[70ch] text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
