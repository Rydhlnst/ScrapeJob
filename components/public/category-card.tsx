import Link from "next/link"
import { cn } from "@/lib/utils"

export function CategoryCard({
  name,
  href,
  className,
}: {
  name: string
  href: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 text-center shadow-sm transition hover:border-accent hover:bg-accent",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent-foreground" />
      <div className="text-sm font-medium text-card-foreground group-hover:text-accent-foreground">
        {name}
      </div>
    </Link>
  )
}
