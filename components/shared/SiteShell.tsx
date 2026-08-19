import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const SITE_CONTENT_CLASS = "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8"

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
        "w-screen max-w-none",
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
