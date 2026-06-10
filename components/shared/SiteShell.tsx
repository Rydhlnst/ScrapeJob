import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const SITE_CONTENT_CLASS = "mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8"

export function SiteFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] border-x border-[var(--brand-shell-strong)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SiteContent({
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
