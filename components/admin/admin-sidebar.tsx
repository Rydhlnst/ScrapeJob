"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  CircleUserRound,
  FilePenLine,
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
  { href: "/admin/content", label: "Landing CMS", icon: FilePenLine },
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
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-3 border border-sidebar-border bg-card px-3 py-3">
          <Image src="/logo.png" alt="Lowonganku logo" width={36} height={36} className="h-9 w-9 rounded-none object-cover" />
          <div>
            <div className="text-sm font-semibold leading-tight">Lowonganku</div>
            <div className="text-xs text-sidebar-foreground/70">Admin Workspace</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
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
                        "h-10 rounded-none border border-transparent text-sidebar-foreground/90",
                        "hover:border-sidebar-border hover:bg-card hover:text-foreground",
                        "data-[active=true]:border-sidebar-border data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-none",
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
      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <div className="border border-sidebar-border bg-card px-3 py-3 text-xs leading-6 text-sidebar-foreground/75">
          Manage jobs, scraper output, and landing content in one workspace.
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
