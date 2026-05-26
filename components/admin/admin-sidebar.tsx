"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleUserRound,
  LayoutDashboard,
  Briefcase,
  Database,
  Layers,
  ListChecks,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/raw-data", label: "Scraped Review", icon: Database },
  { href: "/admin/scrape-runs", label: "Scrape Runs", icon: ListChecks },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/login", label: "Account", icon: CircleUserRound },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[252px] flex-col border-r border-white/10 bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] md:flex">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Lowonganku</div>
            <div className="text-xs text-white/60">Admin Console</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
          Navigation
        </div>
        <div className="space-y-1.5">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white",
                  active && "bg-[hsl(var(--sidebar-accent))]/20 text-white ring-1 ring-[hsl(var(--sidebar-accent))]/40",
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[hsl(var(--sidebar-accent))]" />
                ) : null}
                <item.icon className={cn("h-4 w-4", active ? "text-[hsl(var(--sidebar-accent))]" : "text-white/65")} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-4 text-xs text-white/60">
        Review scraped jobs safely before publishing to production.
      </div>
    </aside>
  )
}
