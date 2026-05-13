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
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const stripe =
    hash % 6 === 0
      ? "from-indigo-500 to-blue-500"
      : hash % 6 === 1
        ? "from-cyan-500 to-blue-500"
        : hash % 6 === 2
          ? "from-emerald-500 to-teal-500"
          : hash % 6 === 3
            ? "from-amber-500 to-orange-500"
            : hash % 6 === 4
              ? "from-fuchsia-500 to-violet-500"
              : "from-rose-500 to-pink-500"

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-blue-200 hover:bg-blue-50",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", stripe)} />
      <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
        {name}
      </div>
    </Link>
  )
}
