import type { ReactNode } from "react"

import { SITE_CONTENT_CLASS } from "@/components/shared/SiteShell"
import { cn } from "@/lib/utils"

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(SITE_CONTENT_CLASS, className)}>
      {children}
    </div>
  )
}
