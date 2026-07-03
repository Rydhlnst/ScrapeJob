"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  FilePenLine,
  Database,
  LayoutDashboard,
  Layers,
  ListChecks,
} from "lucide-react"

import { useAdminLanguage } from "@/components/admin/admin-language"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const nav = {
  en: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Landing CMS", icon: FilePenLine },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/raw-data", label: "Scraped Review", icon: Database },
    { href: "/admin/scrape-runs", label: "Scrape Runs", icon: ListChecks },
    { href: "/admin/categories", label: "Categories", icon: Layers },
  ],
  id: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "CMS Landing", icon: FilePenLine },
    { href: "/admin/jobs", label: "Lowongan", icon: Briefcase },
    { href: "/admin/raw-data", label: "Review Scraping", icon: Database },
    { href: "/admin/scrape-runs", label: "Proses Scraper", icon: ListChecks },
    { href: "/admin/categories", label: "Kategori", icon: Layers },
  ],
} as const

const copy = {
  en: {
    workspace: "Admin Workspace",
    navigation: "Navigation",
  },
  id: {
    workspace: "Ruang Admin",
    navigation: "Navigasi",
  },
} as const

export function AdminSidebar() {
  const pathname = usePathname()
  const { language } = useAdminLanguage()
  const labels = copy[language]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-card/80 px-3 py-3 shadow-sm">
          <Image src="/logo.png" alt="Lowonganku logo" width={36} height={36} className="h-9 w-9 rounded-none object-cover" />
          <div>
            <div className="text-sm font-semibold leading-tight">Lowonganku</div>
            <div className="text-xs text-sidebar-foreground/70">{labels.workspace}</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
            {labels.navigation}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav[language].map((item) => {
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
    </Sidebar>
  )
}
