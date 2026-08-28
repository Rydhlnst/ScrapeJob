"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import {
  Briefcase,
  ChevronRight,
  Database,
  FileText,
  FilePenLine,
  Home,
  Layers,
  ListChecks,
  LogOut,
  Newspaper,
  Settings,
} from "lucide-react"

import { useAdminLanguage } from "@/components/admin/admin-language"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  flat?: boolean
  children: NavChild[]
}

type NavSection = {
  id: string
  label: string
  groups: NavGroup[]
}

const navSections: Record<"en" | "id", NavSection[]> = {
  en: [
    {
      id: "workspace",
      label: "Workspace",
      groups: [
        {
          label: "Lowongan",
          icon: Briefcase,
          defaultOpen: true,
          children: [
            { label: "Semua Lowongan", href: "/admin/jobs" },
            { label: "Draft", href: "/admin/jobs?status=draft" },
            { label: "Published", href: "/admin/jobs?status=published" },
            { label: "Review", href: "/admin/raw-data" },
            { label: "Arsip", href: "/admin/jobs?status=archived" },
            { label: "Duplikat", href: "/admin/raw-data?status=duplicate" },
            { label: "Ditolak", href: "/admin/raw-data?status=rejected" },
          ],
        },
        {
          label: "Scraper",
          icon: ListChecks,
          flat: true,
          children: [
            { label: "Dashboard", href: "/admin/scrape-runs" },
            { label: "Jadwal", href: "/admin/scrape-runs?view=schedule" },
            { label: "Monitoring", href: "/admin/scrape-runs?view=monitoring" },
            { label: "Riwayat & Log", href: "/admin/scrape-runs?view=logs" },
          ],
        },
      ],
    },
    {
      id: "landing",
      label: "Landing Page",
      groups: [
        {
          label: "Landing Page",
          icon: FilePenLine,
          children: [
            { label: "Hero", href: "/admin/content?tab=hero" },
            { label: "Featured Jobs", href: "/admin/content?tab=featured" },
            { label: "Benefit", href: "/admin/content?tab=benefits" },
            { label: "Perusahaan Terpercaya", href: "/admin/content?tab=companies" },
            { label: "CTA", href: "/admin/content?tab=cta" },
            { label: "Section Copy", href: "/admin/content?tab=sections" },
          ],
        },
      ],
    },
    {
      id: "blog",
      label: "Blog",
      groups: [
        {
          label: "Blog / Artikel",
          icon: Newspaper,
          children: [
            { label: "Semua Artikel", href: "/admin/pages" },
            { label: "Published", href: "/admin/pages?status=published" },
            { label: "Draft", href: "/admin/pages?status=draft" },
          ],
        },
      ],
    },
    {
      id: "pages",
      label: "Pages",
      groups: [
        {
          label: "Halaman",
          icon: FileText,
          children: [
            { label: "Semua Halaman", href: "/admin/pages" },
            { label: "Published", href: "/admin/pages?status=published" },
            { label: "Draft", href: "/admin/pages?status=draft" },
          ],
        },
      ],
    },
    {
      id: "config",
      label: "Master Data",
      groups: [
        {
          label: "Master Data",
          icon: Layers,
          children: [
            { label: "Kategori", href: "/admin/categories" },
            { label: "Lokasi", href: "/admin/locations" },
            { label: "Source", href: "/admin/job-sources" },
            { label: "Websites", href: "/admin/websites" },
          ],
        },
      ],
    },
    {
      id: "settings",
      label: "Pengaturan",
      groups: [
        {
          label: "Pengaturan",
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
    },
  ],
  id: [
    {
      id: "workspace",
      label: "Workspace",
      groups: [
        {
          label: "Lowongan",
          icon: Briefcase,
          defaultOpen: true,
          children: [
            { label: "Semua Lowongan", href: "/admin/jobs" },
            { label: "Draft", href: "/admin/jobs?status=draft" },
            { label: "Published", href: "/admin/jobs?status=published" },
            { label: "Review", href: "/admin/raw-data" },
            { label: "Arsip", href: "/admin/jobs?status=archived" },
            { label: "Duplikat", href: "/admin/raw-data?status=duplicate" },
            { label: "Ditolak", href: "/admin/raw-data?status=rejected" },
          ],
        },
        {
          label: "Scraper",
          icon: ListChecks,
          flat: true,
          children: [
            { label: "Dashboard", href: "/admin/scrape-runs" },
            { label: "Jadwal", href: "/admin/scrape-runs?view=schedule" },
            { label: "Monitoring", href: "/admin/scrape-runs?view=monitoring" },
            { label: "Riwayat & Log", href: "/admin/scrape-runs?view=logs" },
          ],
        },
      ],
    },
    {
      id: "landing",
      label: "Landing Page",
      groups: [
        {
          label: "Landing Page",
          icon: FilePenLine,
          children: [
            { label: "Hero", href: "/admin/content?tab=hero" },
            { label: "Featured Jobs", href: "/admin/content?tab=featured" },
            { label: "Benefit", href: "/admin/content?tab=benefits" },
            { label: "Perusahaan Terpercaya", href: "/admin/content?tab=companies" },
            { label: "CTA", href: "/admin/content?tab=cta" },
            { label: "Section Copy", href: "/admin/content?tab=sections" },
          ],
        },
      ],
    },
    {
      id: "blog",
      label: "Blog",
      groups: [
        {
          label: "Blog / Artikel",
          icon: Newspaper,
          children: [
            { label: "Semua Artikel", href: "/admin/pages" },
            { label: "Published", href: "/admin/pages?status=published" },
            { label: "Draft", href: "/admin/pages?status=draft" },
          ],
        },
      ],
    },
    {
      id: "pages",
      label: "Pages",
      groups: [
        {
          label: "Halaman",
          icon: FileText,
          children: [
            { label: "Semua Halaman", href: "/admin/pages" },
            { label: "Published", href: "/admin/pages?status=published" },
            { label: "Draft", href: "/admin/pages?status=draft" },
          ],
        },
      ],
    },
    {
      id: "config",
      label: "Master Data",
      groups: [
        {
          label: "Master Data",
          icon: Layers,
          children: [
            { label: "Kategori", href: "/admin/categories" },
            { label: "Lokasi", href: "/admin/locations" },
            { label: "Source", href: "/admin/job-sources" },
            { label: "Websites", href: "/admin/websites" },
          ],
        },
      ],
    },
    {
      id: "settings",
      label: "Pengaturan",
      groups: [
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
    },
  ],
}

const sidebarCopy = {
  en: {
    workspace: "Admin Workspace",
    dashboard: "Dashboard",
    account: "Admin",
    role: "Administrator",
    logout: "Logout",
  },
  id: {
    workspace: "Ruang Admin",
    dashboard: "Dashboard",
    account: "Admin",
    role: "Administrator",
    logout: "Keluar",
  },
} as const

type SidebarLabels = (typeof sidebarCopy)[keyof typeof sidebarCopy]

function SidebarNavContent({ sections, labels }: { sections: NavSection[]; labels: SidebarLabels }) {
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

  const allGroups = sections.flatMap((section) => section.groups)

  function activeGroupLabel(): string | null {
    return allGroups.find((g) => g.children.some((c) => c.href && isActive(c.href)))?.label ?? null
  }

  const [openGroup, setOpenGroup] = useState<string | null>(
    () => activeGroupLabel() ?? allGroups.find((g) => g.defaultOpen)?.label ?? null,
  )

  useEffect(() => {
    const active = activeGroupLabel()
    if (active) setOpenGroup(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])

  return (
    <>
      <SidebarGroup>
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={labels.dashboard}
              isActive={pathname === "/admin/dashboard"}
              className="h-9 data-[active=true]:bg-zinc-100 data-[active=true]:text-zinc-900 data-[active=true]:font-semibold"
            >
              <Link href="/admin/dashboard">
                <Home />
                <span>{labels.dashboard}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {sections.map((section) => (
        <SidebarGroup key={section.id}>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            {section.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {section.groups.map((group) =>
                group.flat ? (
                  <SidebarMenuItem key={group.label}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <group.icon className="size-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{group.label}</span>
                    </div>
                    <SidebarMenuSub className="py-0">
                      {group.children.map((child) => {
                        const active = child.href ? isActive(child.href) : false
                        return (
                          <SidebarMenuSubItem key={child.label}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className={cn(
                                "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                                "data-[active=true]:bg-zinc-100 data-[active=true]:text-zinc-900 data-[active=true]:font-semibold",
                              )}
                            >
                              <Link href={child.href ?? "#"}>
                                <span>{child.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ) : (
                <Collapsible
                  key={group.label}
                  open={openGroup === group.label}
                  onOpenChange={(open) => setOpenGroup(open ? group.label : null)}
                  className="group/collapsible"
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.label}
                        isActive={group.children.some((child) => child.href && isActive(child.href))}
                        className="h-9 data-[active=true]:bg-zinc-100 data-[active=true]:text-zinc-900 data-[active=true]:font-semibold"
                      >
                        <group.icon />
                        <span>{group.label}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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
                                className="flex h-7 items-center rounded-md px-2 text-sm text-zinc-400"
                              >
                                {child.label}
                              </SidebarMenuSubItem>
                            )
                          }

                          return (
                            <SidebarMenuSubItem key={child.label}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={active}
                                className={cn(
                                  "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                                  "data-[active=true]:bg-zinc-100 data-[active=true]:text-zinc-900 data-[active=true]:font-semibold",
                                )}
                              >
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
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

function AdminSidebarFooter({ labels }: { labels: SidebarLabels }) {
  const { language, setLanguage } = useAdminLanguage()

  function handleLogout() {
    localStorage.removeItem("admin_access_token")
    void fetch("/api/auth/admin/session", { method: "DELETE" })
    window.location.assign("/admin/login")
  }

  const langLinkClass = (active: boolean) =>
    cn(
      "px-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
      active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700",
    )

  return (
    <SidebarFooter className="border-t border-zinc-200 p-2">
      <div className="flex items-center justify-between rounded-md px-2 py-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
        <div className="inline-flex items-center gap-1">
          <button type="button" onClick={() => setLanguage("id")} className={langLinkClass(language === "id")}>
            ID
          </button>
          <span className="text-zinc-300" aria-hidden>|</span>
          <button type="button" onClick={() => setLanguage("en")} className={langLinkClass(language === "en")}>
            EN
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          title={labels.logout}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </SidebarFooter>
  )
}

export function AdminSidebar() {
  const { language } = useAdminLanguage()
  const labels = sidebarCopy[language]
  const sections = navSections[language]

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200 bg-white">
      <SidebarHeader className="border-b border-zinc-200 px-2 py-3">
        <Link href="/admin/dashboard" className="flex h-9 items-center gap-2 rounded-md px-2">
          <Image
            src="/logo.png"
            alt="Lowonganku logo"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-lg object-contain"
          />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-[-0.01em] text-zinc-900">Lowonganku</div>
            <div className="truncate text-xs text-zinc-500">{labels.workspace}</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <Suspense fallback={null}>
          <SidebarNavContent sections={sections} labels={labels} />
        </Suspense>
      </SidebarContent>
      <AdminSidebarFooter labels={labels} />
    </Sidebar>
  )
}
