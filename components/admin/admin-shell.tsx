import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("flex w-full flex-col gap-5", className)}>{children}</div>
}
