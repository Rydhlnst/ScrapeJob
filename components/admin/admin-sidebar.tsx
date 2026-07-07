"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import {
  Briefcase,
  ChevronRight,
  Database,
  FilePenLine,
  Home,
  Layers,
  ListChecks,
  Settings,
  Sparkles,
} from "lucide-react"

import { useAdminLanguage } from "@/components/admin/admin-language"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type NavChild = {
  label: string
  href?: string
  disabled?: boolean
}

type NavGroup = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  defaultOpen?: boolean
  future?: boolean
  children: NavChild[]
}

const navGroups: Record<"en" | "id", NavGroup[]> = {
  en: [
    {
      label: "Jobs",
      icon: Briefcase,
      defaultOpen: true,
      children: [
        { label: "All jobs", href: "/admin/jobs" },
        { label: "Draft", href: "/admin/jobs?status=draft" },
        { label: "Published", href: "/admin/jobs?status=published" },
        { label: "Archive", href: "/admin/jobs?status=archived" },
      ],
    },
    {
      label: "Review & Scraping",
      icon: Database,
      defaultOpen: true,
      children: [
        { label: "Review queue", href: "/admin/raw-data" },
        { label: "Duplicate", href: "/admin/raw-data?status=duplicate" },
        { label: "Rejected", href: "/admin/raw-data?status=rejected" },
      ],
    },
    {
      label: "Landing Page",
      icon: FilePenLine,
      children: [
        { label: "Hero", href: "/admin/content?tab=hero" },
        { label: "Featured Jobs", href: "/admin/content?tab=featured" },
        { label: "Benefit", href: "/admin/content?tab=benefits" },
        { label: "Trusted Companies", href: "/admin/content?tab=companies" },
        { label: "CTA", href: "/admin/content?tab=cta" },
        { label: "SEO", href: "/admin/pages" },
      ],
    },
    {
      label: "Master Data",
      icon: Layers,
      children: [
        { label: "Pages", href: "/admin/pages" },
        { label: "Categories", href: "/admin/categories" },
        { label: "Locations", href: "/admin/categories?type=locations" },
        { label: "Source", href: "/admin/categories?type=sources" },
      ],
    },
    {
      label: "Scraper",
      icon: ListChecks,
      children: [
        { label: "Schedule", href: "/admin/scrape-runs" },
        { label: "Monitoring", href: "/admin/scrape-runs?view=monitoring" },
        { label: "History & Log", href: "/admin/scrape-runs?view=logs" },
      ],
    },
    {
      label: "Growth",
      icon: Sparkles,
      future: true,
      children: [
        { label: "Employer", href: "/admin/dashboard?section=employer" },
        { label: "Recruiter", href: "/admin/dashboard?section=recruiter" },
        { label: "Subscription", href: "/admin/dashboard?section=subscription" },
        { label: "Analytics", href: "/admin/dashboard?section=analytics" },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      children: [
        { label: "General", href: "/admin/settings/general" },
        { label: "User & Role", href: "/admin/settings/users" },
        { label: "API", href: "/admin/settings/api" },
        { label: "Notifications", href: "/admin/settings/notifications" },
        { label: "Audit Log", href: "/admin/settings/audit" },
      ],
    },
  ],
  id: [
    {
      label: "Lowongan",
      icon: Briefcase,
      defaultOpen: true,
      children: [
        { label: "Semua Lowongan", href: "/admin/jobs" },
        { label: "Draft", href: "/admin/jobs?status=draft" },
        { label: "Published", href: "/admin/jobs?status=published" },
        { label: "Arsip", href: "/admin/jobs?status=archived" },
      ],
    },
    {
      label: "Review & Scraping",
      icon: Database,
      defaultOpen: true,
      children: [
        { label: "Antrean Review", href: "/admin/raw-data" },
        { label: "Duplikat", href: "/admin/raw-data?status=duplicate" },
        { label: "Ditolak", href: "/admin/raw-data?status=rejected" },
      ],
    },
    {
      label: "Landing Page",
      icon: FilePenLine,
      children: [
        { label: "Hero", href: "/admin/content?tab=hero" },
        { label: "Featured Jobs", href: "/admin/content?tab=featured" },
        { label: "Benefit", href: "/admin/content?tab=benefits" },
        { label: "Perusahaan Terpercaya", href: "/admin/content?tab=companies" },
        { label: "CTA", href: "/admin/content?tab=cta" },
        { label: "SEO", href: "/admin/pages" },
      ],
    },
    {
      label: "Master Data",
      icon: Layers,
      children: [
        { label: "Halaman", href: "/admin/pages" },
        { label: "Kategori", href: "/admin/categories" },
        { label: "Lokasi", href: "/admin/categories?type=locations" },
        { label: "Source", href: "/admin/categories?type=sources" },
      ],
    },
    {
      label: "Scraper",
      icon: ListChecks,
      children: [
        { label: "Jadwal", href: "/admin/scrape-runs" },
        { label: "Monitoring", href: "/admin/scrape-runs?view=monitoring" },
        { label: "Riwayat & Log", href: "/admin/scrape-runs?view=logs" },
      ],
    },
    {
      label: "Growth",
      icon: Sparkles,
      future: true,
      children: [
        { label: "Employer", href: "/admin/dashboard?section=employer" },
        { label: "Recruiter", href: "/admin/dashboard?section=recruiter" },
        { label: "Subscription", href: "/admin/dashboard?section=subscription" },
        { label: "Analytics", href: "/admin/dashboard?section=analytics" },
      ],
    },
    {
      label: "Pengaturan",
      icon: Settings,
      children: [
        { label: "General", href: "/admin/settings/general" },
        { label: "User & Role", href: "/admin/settings/users" },
        { label: "API", href: "/admin/settings/api" },
        { label: "Notifikasi", href: "/admin/settings/notifications" },
        { label: "Audit Log", href: "/admin/settings/audit" },
      ],
    },
  ],
}

const sidebarCopy = {
  en: {
    workspace: "Admin Workspace",
    dashboard: "Dashboard",
    future: "Soon",
  },
  id: {
    workspace: "Ruang Admin",
    dashboard: "Dashboard",
    future: "Segera",
  },
} as const

type SidebarLabels = (typeof sidebarCopy)[keyof typeof sidebarCopy]

function SidebarNavContent({ groups, labels }: { groups: NavGroup[]; labels: SidebarLabels }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function isActive(href: string): boolean {
    try {
      const url = new URL(href, "http://x")
      if (url.pathname !== pathname) return false
      for (const [key, value] of url.searchParams) {
        if (searchParams.get(key) !== value) return false
      }
      return true
    } catch {
      return false
    }
  }

  function activeGroupLabel(): string | null {
    return groups.find((g) => g.children.some((c) => c.href && isActive(c.href)))?.label ?? null
  }

  const [openGroup, setOpenGroup] = useState<string | null>(
    () => activeGroupLabel() ?? groups.find((g) => g.defaultOpen)?.label ?? null
  )

  useEffect(() => {
    const active = activeGroupLabel()
    if (active) setOpenGroup(active)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-1">
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={labels.dashboard} isActive={pathname === "/admin/dashboard"} className="h-9">
            <Link href="/admin/dashboard">
              <Home />
              <span>{labels.dashboard}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupContent className="mt-2">
        <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-wider">
          Menu
        </SidebarGroupLabel>
        <SidebarMenu className="space-y-1">
          {groups.map((group) => (
            <Collapsible
              key={group.label}
              open={openGroup === group.label}
              onOpenChange={(o) => setOpenGroup(o ? group.label : null)}
              className="group/collapsible"
              asChild
            >
              <SidebarMenuItem className={cn(group.future && "mt-2 border-t border-sidebar-border pt-2")}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={group.label}
                    isActive={group.children.some((child) => child.href && isActive(child.href))}
                    className="h-9"
                  >
                    <group.icon />
                    <span>{group.label}</span>
                    {group.future ? (
                      <span className="ml-auto rounded-md bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
                        {labels.future}
                      </span>
                    ) : (
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="py-1">
                    {group.children.map((child) => {
                      const active = child.href ? isActive(child.href) : false

                      if (child.disabled || !child.href) {
                        return (
                          <SidebarMenuSubItem
                            key={child.label}
                            className="flex h-7 items-center rounded-md px-2 text-sm text-sidebar-foreground/45"
                          >
                            {child.label}
                          </SidebarMenuSubItem>
                        )
                      }

                      return (
                        <SidebarMenuSubItem key={child.label}>
                          <SidebarMenuSubButton asChild isActive={active}>
                            <Link href={child.href}>
                              <span>{child.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AdminSidebar() {
  const { language } = useAdminLanguage()
  const labels = sidebarCopy[language]
  const groups = navGroups[language]

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        <Link href="/admin/dashboard" className="flex h-9 items-center gap-2 rounded-md px-2">
          <Image src="/logo.png" alt="Lowonganku logo" width={28} height={28} className="h-7 w-7 shrink-0 rounded-none object-contain" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-[-0.01em] text-[#09090B]">Lowonganku</div>
            <div className="truncate text-xs text-[#71717A]">{labels.workspace}</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <Suspense fallback={null}>
          <SidebarNavContent groups={groups} labels={labels} />
        </Suspense>
      </SidebarContent>
    </Sidebar>
  )
}

