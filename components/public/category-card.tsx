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
        "group relative overflow-hidden rounded-[18px] border border-black/10 bg-white p-5 text-center shadow-[0_4px_0_rgba(23,23,23,.04)] transition hover:-translate-y-0.5 hover:border-[#3f95e8] hover:bg-[#f7f9fb]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent-foreground" />
      <div className="text-sm font-medium text-[#171717] group-hover:text-[#2479d1]">
        {name}
      </div>
    </Link>
  )
}
