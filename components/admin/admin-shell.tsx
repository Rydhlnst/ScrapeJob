import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("mx-auto flex w-full max-w-[1440px] flex-col gap-6", className)}>{children}</div>
}
