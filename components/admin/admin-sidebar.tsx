"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Database,
  Layers,
  ListChecks,
  LogIn,
} from "lucide-react"

import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/raw-data", label: "Raw Data", icon: Database },
  { href: "/admin/scrape-runs", label: "Scrape Runs", icon: ListChecks },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/login", label: "Login", icon: LogIn },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-white md:flex">
      <div className="flex h-16 items-center border-b px-4">
        <div className="text-sm font-semibold text-slate-900">
          Lowonganku Admin
        </div>
      </div>
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100",
                  active && "bg-blue-50 text-blue-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="border-t p-3 text-xs text-slate-500">
        Mock admin UI (Next.js). Backend admin bisa pindah ke Laravel/Filament.
      </div>
    </aside>
  )
}
