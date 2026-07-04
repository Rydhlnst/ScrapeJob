"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Briefcase,
  ChevronRight,
  Database,
  FilePenLine,
  FileStack,
  Home,
  Layers,
  ListChecks,
  Settings,
  Sparkles,
} from "lucide-react"

import { useAdminLanguage } from "@/components/admin/admin-language"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
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
        { label: "Draft", href: "/admin/jobs" },
        { label: "Published", href: "/admin/jobs" },
        { label: "Archive", href: "/admin/jobs" },
      ],
    },
    {
      label: "Review & Scraping",
      icon: Database,
      defaultOpen: true,
      children: [
        { label: "Review queue", href: "/admin/raw-data" },
        { label: "Duplicate", href: "/admin/raw-data" },
        { label: "Rejected", href: "/admin/raw-data" },
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
        { label: "Locations", disabled: true },
        { label: "Source", disabled: true },
      ],
    },
    {
      label: "Scraper",
      icon: ListChecks,
      children: [
        { label: "Schedule", href: "/admin/scrape-runs" },
        { label: "Monitoring", href: "/admin/scrape-runs" },
        { label: "History & Log", href: "/admin/scrape-runs" },
      ],
    },
    {
      label: "Growth",
      icon: Sparkles,
      future: true,
      children: [
        { label: "Employer", disabled: true },
        { label: "Recruiter", disabled: true },
        { label: "Subscription", disabled: true },
        { label: "Analytics", disabled: true },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      children: [
        { label: "General", disabled: true },
        { label: "User & Role", disabled: true },
        { label: "API", disabled: true },
        { label: "Notifications", disabled: true },
        { label: "Audit Log", disabled: true },
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
        { label: "Draft", href: "/admin/jobs" },
        { label: "Published", href: "/admin/jobs" },
        { label: "Arsip", href: "/admin/jobs" },
      ],
    },
    {
      label: "Review & Scraping",
      icon: Database,
      defaultOpen: true,
      children: [
        { label: "Antrean Review", href: "/admin/raw-data" },
        { label: "Duplikat", href: "/admin/raw-data" },
        { label: "Ditolak", href: "/admin/raw-data" },
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
        { label: "Lokasi", disabled: true },
        { label: "Source", disabled: true },
      ],
    },
    {
      label: "Scraper",
      icon: ListChecks,
      children: [
        { label: "Jadwal", href: "/admin/scrape-runs" },
        { label: "Monitoring", href: "/admin/scrape-runs" },
        { label: "Riwayat & Log", href: "/admin/scrape-runs" },
      ],
    },
    {
      label: "Growth",
      icon: Sparkles,
      future: true,
      children: [
        { label: "Employer", disabled: true },
        { label: "Recruiter", disabled: true },
        { label: "Subscription", disabled: true },
        { label: "Analytics", disabled: true },
      ],
    },
    {
      label: "Pengaturan",
      icon: Settings,
      children: [
        { label: "General", disabled: true },
        { label: "User & Role", disabled: true },
        { label: "API", disabled: true },
        { label: "Notifikasi", disabled: true },
        { label: "Audit Log", disabled: true },
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

function SidebarCollapsedNav({ pathname }: { pathname: string }) {
  const items = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/jobs", icon: Briefcase, label: "Lowongan" },
    { href: "/admin/raw-data", icon: Database, label: "Review" },
    { href: "/admin/content", icon: FilePenLine, label: "Landing" },
    { href: "/admin/pages", icon: FileStack, label: "Pages" },
    { href: "/admin/scrape-runs", icon: Activity, label: "Scraper" },
    { href: "/admin/categories", icon: Layers, label: "Master" },
  ]

  return (
    <div className="flex flex-col gap-2 p-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "flex h-10 items-center justify-center border border-transparent bg-white text-slate-500 transition hover:border-slate-200 hover:text-slate-900",
              active && "border-indigo-200 bg-indigo-50 text-indigo-700",
            )}
          >
            <item.icon className="h-4 w-4" />
          </Link>
        )
      })}
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { language } = useAdminLanguage()
  const { state } = useSidebar()
  const labels = sidebarCopy[language]
  const groups = navGroups[language]

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-sidebar-border/70">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
          <Image src="/logo.png" alt="Lowonganku logo" width={28} height={28} className="h-7 w-7 rounded-none object-cover" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-[-0.01em] text-[#09090B]">Lowonganku</div>
            <div className="truncate text-xs text-[#71717A]">{labels.workspace}</div>
          </div>
        </Link>
      </SidebarHeader>

      {state === "collapsed" ? (
        <SidebarCollapsedNav pathname={pathname} />
      ) : (
        <SidebarContent className="px-2 py-3">
          <Link
            href="/admin/dashboard"
            className={cn(
              "mb-3 flex items-center gap-2 bg-[#EEF0FE] px-3 py-2.5 text-[13.5px] font-semibold text-[#3730A3]",
              pathname === "/admin/dashboard" && "ring-1 ring-[#C7D2FE]",
            )}
          >
            <Home className="h-4 w-4" />
            <span>{labels.dashboard}</span>
          </Link>

          <div className="space-y-1.5">
            {groups.map((group) => (
              <Collapsible key={group.label} defaultOpen={group.defaultOpen}>
                <div className={cn("border-b border-transparent", group.future && "mt-2 border-t border-slate-200 pt-3")}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 text-left text-[11.5px] font-bold uppercase tracking-[0.05em] text-[#A1A1AA] transition hover:text-[#71717A]">
                    <span className="flex items-center gap-2">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    {group.future ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-bold normal-case tracking-normal text-[#71717A]">{labels.future}</span>
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 transition data-[state=open]:rotate-90" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pb-2">
                    {group.children.map((child) => {
                      const active = child.href ? pathname === child.href || pathname.startsWith(`${child.href}/`) : false
                      const baseClass = cn(
                        "flex items-center justify-between px-6 py-2 text-[13.5px] font-medium transition",
                        child.disabled ? "cursor-default text-[#A1A1AA]" : "text-[#3F3F46] hover:bg-[#F4F4F5]",
                        active && "bg-[#EEF0FE] text-[#3730A3]",
                      )

                      if (!child.href || child.disabled) {
                        return <div key={child.label} className={baseClass}>{child.label}</div>
                      }

                      return <Link key={child.label} href={child.href} className={baseClass}>{child.label}</Link>
                    })}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </SidebarContent>
      )}
    </Sidebar>
  )
}
