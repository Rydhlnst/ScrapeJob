"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  CircleUserRound,
  Database,
  LayoutDashboard,
  Layers,
  ListChecks,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

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
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/20 px-3 py-3">
          <Image src="/logo.png" alt="Lowonganku logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
          <div>
            <div className="text-sm font-semibold leading-tight">Lowonganku</div>
            <div className="text-xs text-sidebar-foreground/70">Admin Workspace</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.08em] text-sidebar-foreground/55">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-10 rounded-lg text-sidebar-foreground/90",
                        "hover:bg-[hsl(var(--sidebar-muted))] hover:text-sidebar-foreground",
                        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm",
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/20 px-3 py-3 text-xs text-sidebar-foreground/75">
          Manage jobs from raw ingest to publish in one workspace.
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
