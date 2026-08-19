"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Layers3,
  MapPin,
  Menu,
  MoveRight,
  Search,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SiteContent, SiteFrame } from "@/components/shared/SiteShell"
import { cn } from "@/lib/utils"
import type { Category as SiteCategory, Job as SiteJob } from "@/types"

type IconType = typeof BriefcaseBusiness

type CountItem = {
  label: string
  href: string
  count?: string
  icon?: IconType
}

type Category = CountItem & {
  roles: CountItem[]
}

type Facet = {
  id: "kategori" | "pendidikan" | "pengalaman" | "lokasi" | "tipe"
  label: string
  href: string
  icon: IconType
}

const facets: Facet[] = [
  { id: "kategori", label: "Kategori", href: "/jobs", icon: Layers3 },
  { id: "pendidikan", label: "Pendidikan", href: "/jobs?education=all", icon: GraduationCap },
  { id: "pengalaman", label: "Pengalaman", href: "/jobs?experience=all", icon: BriefcaseBusiness },
  { id: "lokasi", label: "Lokasi", href: "/jobs?location=all", icon: MapPin },
  { id: "tipe", label: "Jenis Kerja", href: "/jobs?type=all", icon: Clock3 },
]

const categories: Category[] = [
  {
    label: "IT & Software",
    href: "/jobs?category=it-software",
    count: "420rb",
    roles: [
      { label: "Backend Developer", href: "/jobs?role=backend-developer", count: "52rb" },
      { label: "Frontend Developer", href: "/jobs?role=frontend-developer", count: "48rb" },
      { label: "Full Stack Developer", href: "/jobs?role=full-stack-developer", count: "41rb" },
      { label: "Mobile Developer", href: "/jobs?role=mobile-developer", count: "28rb" },
      { label: "DevOps Engineer", href: "/jobs?role=devops-engineer", count: "19rb" },
    ],
  },
  {
    label: "Marketing",
    href: "/jobs?category=marketing",
    count: "180rb",
    roles: [
      { label: "Digital Marketing", href: "/jobs?role=digital-marketing", count: "44rb" },
      { label: "Brand Strategist", href: "/jobs?role=brand-strategist", count: "21rb" },
      { label: "Content Marketing", href: "/jobs?role=content-marketing", count: "17rb" },
    ],
  },
  {
    label: "Finance",
    href: "/jobs?category=finance",
    count: "150rb",
    roles: [
      { label: "Accounting", href: "/jobs?role=accounting", count: "36rb" },
      { label: "Financial Analyst", href: "/jobs?role=financial-analyst", count: "18rb" },
      { label: "Tax Specialist", href: "/jobs?role=tax-specialist", count: "12rb" },
    ],
  },
  {
    label: "Manufacturing",
    href: "/jobs?category=manufacturing",
    count: "130rb",
    roles: [
      { label: "Production Staff", href: "/jobs?role=production-staff", count: "45rb" },
      { label: "Quality Control", href: "/jobs?role=quality-control", count: "26rb" },
      { label: "Maintenance Engineer", href: "/jobs?role=maintenance-engineer", count: "13rb" },
    ],
  },
  {
    label: "Customer Service",
    href: "/jobs?category=customer-service",
    count: "95rb",
    roles: [
      { label: "Customer Support", href: "/jobs?role=customer-support", count: "38rb" },
      { label: "Call Center", href: "/jobs?role=call-center", count: "29rb" },
      { label: "Client Success", href: "/jobs?role=client-success", count: "8rb" },
    ],
  },
]

const educationItems: CountItem[] = [
  { label: "Semua Pendidikan", href: "/jobs", count: "1.8jt", icon: GraduationCap },
  { label: "SMA / SMK", href: "/jobs?education=sma-smk", count: "620rb", icon: GraduationCap },
  { label: "D3", href: "/jobs?education=d3", count: "380rb", icon: GraduationCap },
  { label: "S1", href: "/jobs?education=s1", count: "740rb", icon: GraduationCap },
  { label: "S2+", href: "/jobs?education=s2", count: "86rb", icon: GraduationCap },
]

const experienceItems: CountItem[] = [
  { label: "Fresh Graduate", href: "/jobs?experience=fresh-graduate", count: "210rb", icon: BriefcaseBusiness },
  { label: "1-3 Tahun", href: "/jobs?experience=1-3", count: "540rb", icon: BriefcaseBusiness },
  { label: "3-5 Tahun", href: "/jobs?experience=3-5", count: "320rb", icon: BriefcaseBusiness },
  { label: "Managerial", href: "/jobs?experience=managerial", count: "96rb", icon: BriefcaseBusiness },
]

const locationItems: CountItem[] = [
  { label: "DKI Jakarta", href: "/jobs?location=jakarta", count: "310rb" },
  { label: "Jawa Barat", href: "/jobs?location=jawa-barat", count: "260rb" },
  { label: "Jawa Timur", href: "/jobs?location=jawa-timur", count: "190rb" },
  { label: "Banten", href: "/jobs?location=banten", count: "116rb" },
  { label: "Remote", href: "/jobs?location=remote", count: "72rb" },
]

const jobTypeItems: CountItem[] = [
  { label: "Full Time", href: "/jobs?type=full-time", count: "980rb", icon: Clock3 },
  { label: "Part Time", href: "/jobs?type=part-time", count: "135rb", icon: Clock3 },
  { label: "Contract", href: "/jobs?type=contract", count: "210rb", icon: Clock3 },
  { label: "Internship", href: "/jobs?type=internship", count: "88rb", icon: Clock3 },
]

const companyTypes = [
  {
    label: "Terverifikasi",
    href: "/jobs?company=verified",
    count: "1.2rb",
    companies: ["Astra Group", "Bank Mandiri", "Telkomsel", "Gojek", "Traveloka", "Unilever ID"],
  },
  {
    label: "BUMN",
    href: "/jobs?company=bumn",
    count: "340",
    companies: ["Pertamina", "PLN", "Bank BRI", "Telkom Indonesia", "Garuda Indonesia", "Bulog"],
  },
  {
    label: "Startup",
    href: "/jobs?company=startup",
    count: "2.4rb",
    companies: ["Xendit", "Ajaib", "Flip", "Kredivo", "Sicepat", "Ninja Xpress"],
  },
  {
    label: "Teknologi",
    href: "/jobs?company=technology",
    count: "1.1rb",
    companies: ["Gojek", "Tokopedia", "Bukalapak", "Traveloka", "DANA", "OVO"],
  },
]

const quickLinks = ["S1 Jakarta", "Fresh Graduate", "Remote", "Full Time", "BUMN", "Startup"]
type NavbarData = {
  jobs?: SiteJob[]
  categories?: SiteCategory[]
  totalJobs?: number
}

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(".0", "")}jt`
  if (count >= 1_000) return `${Math.round(count / 1_000)}rb`
  return String(count)
}

function titleFromSlug(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function topCounts<T extends string>(values: Array<T | null | undefined>, limit: number) {
  const counts = new Map<T, number>()
  values.forEach((value) => {
    if (!value) return
    counts.set(value, (counts.get(value) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function buildNavbarData(data?: NavbarData) {
  const jobs = data?.jobs ?? []
  const dynamicCategories = (data?.categories ?? [])
    .map((category) => {
      const categoryJobs = jobs.filter((job) => {
        const categoryValue = job.categoryId ?? job.category ?? ""
        return categoryValue === category.id || categoryValue === category.slug || categoryValue === category.name
      })
      const roles = topCounts(categoryJobs.map((job) => job.title), 5).map(([title, count]) => ({
        label: title,
        href: `/jobs?keyword=${encodeURIComponent(title)}`,
        count: formatCount(count),
      }))

      return {
        label: category.name,
        href: `/jobs?category=${encodeURIComponent(category.slug ?? category.id)}`,
        count: formatCount(category.totalJobs ?? categoryJobs.length),
        roles: roles.length ? roles : categories[0].roles,
      }
    })
    .filter((category) => category.count !== "0")
    .slice(0, 5)

  const dynamicLocations = topCounts(jobs.map((job) => job.location), 5).map(([location, count]) => ({
    label: location,
    href: `/jobs?location=${encodeURIComponent(location)}`,
    count: formatCount(count),
  }))

  const dynamicTypes = topCounts(jobs.map((job) => job.jobType), 5).map(([type, count]) => ({
    label: titleFromSlug(type),
    href: `/jobs?jobType=${encodeURIComponent(type)}`,
    count: formatCount(count),
    icon: Clock3,
  }))

  const dynamicCompanies = topCounts(jobs.map((job) => job.companyName), 12).map(([company]) => company)
  const dynamicSources = topCounts(jobs.map((job) => job.sourceName), 4).map(([source, count]) => ({
    label: source,
    href: `/jobs?source=${encodeURIComponent(source)}`,
    count: formatCount(count),
    companies: dynamicCompanies.slice(0, 6),
  }))

  return {
    categories: dynamicCategories.length ? dynamicCategories : categories,
    locations: dynamicLocations.length ? dynamicLocations : locationItems,
    jobTypes: dynamicTypes.length ? dynamicTypes : jobTypeItems,
    companyTypes: dynamicSources.length ? dynamicSources : companyTypes,
    totalJobs: data?.totalJobs ?? jobs.length,
    totalLocations: new Set(jobs.map((job) => job.location).filter(Boolean)).size,
    totalCompanies: new Set(jobs.map((job) => job.companyName).filter(Boolean)).size,
  }
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Lowonganku home">
      <Image src="/logo.png" alt="Lowonganku logo" width={32} height={32} className="size-8 shrink-0 object-contain" />
      <span className="text-[15px] font-semibold tracking-tight text-[var(--brand-ink)]">Lowonganku</span>
    </Link>
  )
}

function CountLink({ item, active = false }: { item: CountItem; active?: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f7f9fb] hover:text-[#2479d1]",
        active && "bg-[#f2f7fb] text-[#171717] ring-1 ring-[#3f95e8]/30",
      )}
    >
      <span className="flex items-center gap-2">
        {Icon ? <Icon className="size-4 text-primary/70" /> : null}
        {item.label}
      </span>
      {item.count ? <span className="font-mono text-xs text-slate-400">{item.count}</span> : null}
    </Link>
  )
}

function FlatPanel({ items, title }: { items: CountItem[]; title: string }) {
  return (
    <div className="grid min-h-[280px] grid-cols-[1.5fr_1fr]">
      <div className="p-5">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <div className="grid gap-0.5">
          {items.map((item) => <CountLink key={item.href} item={item} />)}
        </div>
      </div>
      <div className="border-l border-slate-100 p-5">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kombinasi Populer</p>
        <div className="flex flex-wrap gap-2 px-3">
          {quickLinks.map((link) => (
            <Link key={link} href={`/jobs?q=${encodeURIComponent(link)}`} className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-[#ffd36a] hover:bg-[#f7f9fb] hover:text-[#2479d1]">
              {link}
            </Link>
          ))}
        </div>
        <Link href="/jobs" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f5f9f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2479d1]">
          Lihat Semua Lowongan <MoveRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}

function JobsMegaMenu({
  open,
  menuData,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean
  menuData: ReturnType<typeof buildNavbarData>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const [activeFacet, setActiveFacet] = useState<Facet["id"]>("kategori")
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0])

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={cn(
      "fixed left-1/2 top-24 hidden w-[min(1080px,95vw)] -translate-x-1/2 rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(23,23,23,.16)]",
      open && "block",
    )}>
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
        <Search className="size-4 text-primary" />
        <input
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Cari posisi, skill, atau perusahaan..."
          aria-label="Cari lowongan"
        />
      </div>

      <div className="flex overflow-x-auto border-b border-slate-100 px-4">
        {facets.map((facet) => {
          const Icon = facet.icon
          return (
            <Link
              key={facet.id}
              href={facet.href}
              onMouseEnter={() => setActiveFacet(facet.id)}
              onClick={(e) => {
                if (activeFacet !== facet.id) { e.preventDefault(); setActiveFacet(facet.id) }
              }}
              className={cn(
                  "mb-[-1px] inline-flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-3 text-[13px] text-slate-500 transition-colors hover:border-[#ffd36a] hover:bg-[#f7f9fb] hover:text-[#2479d1]",
                activeFacet === facet.id && "border-[#2479d1] bg-[#f2f7fb] text-[#2479d1]",
              )}
            >
              <Icon className="size-3.5" />
              {facet.label}
            </Link>
          )
        })}
      </div>

      {activeFacet === "kategori" ? (
        <div className="grid min-h-[320px] grid-cols-[1fr_1.3fr_1fr]">
          <div className="p-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kategori</p>
            <div className="grid gap-0.5">
              {menuData.categories.map((category) => (
                <span key={category.href} onMouseEnter={() => setActiveCategory(category)}>
                  <CountLink item={category} active={activeCategory.href === category.href} />
                </span>
              ))}
            </div>
          </div>
          <div className="border-l border-slate-100 p-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Peran di {activeCategory.label}
            </p>
            <div className="grid gap-0.5">
              {activeCategory.roles.map((role) => <CountLink key={role.href} item={role} />)}
            </div>
          </div>
          <div className="border-l border-slate-100 p-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Filter Cepat</p>
            <div className="flex flex-wrap gap-2 px-3">
              {quickLinks.slice(0, 4).map((link) => (
                <Link
                  key={link}
                  href={`/jobs?q=${encodeURIComponent(`${activeCategory.label} ${link}`)}`}
                  className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-[#ffd36a] hover:bg-[#f7f9fb] hover:text-[#2479d1]"
                >
                  {link}
                </Link>
              ))}
            </div>
            <Link href={activeCategory.href} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f5f9f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2479d1]">
              {activeCategory.count} lowongan <MoveRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {activeFacet === "pendidikan" ? <FlatPanel title="Jenjang Pendidikan" items={educationItems} /> : null}
      {activeFacet === "pengalaman" ? <FlatPanel title="Pengalaman" items={experienceItems} /> : null}
      {activeFacet === "lokasi" ? <FlatPanel title="Lokasi" items={menuData.locations} /> : null}
      {activeFacet === "tipe" ? <FlatPanel title="Jenis Pekerjaan" items={menuData.jobTypes} /> : null}

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
        <div className="flex gap-5 text-xs text-slate-500">
          <span><span className="font-semibold text-slate-800">{formatCount(menuData.totalJobs)}</span> lowongan</span>
          <span><span className="font-semibold text-slate-800">{formatCount(menuData.totalLocations)}</span> kota</span>
          <span><span className="font-semibold text-slate-800">{formatCount(menuData.totalCompanies)}</span> perusahaan</span>
        </div>
        <Link href="/jobs" className="inline-flex items-center gap-2 rounded-lg bg-[#1f5f9f] px-4 py-2 text-sm text-white transition-colors hover:bg-[#2479d1]">
          Buka Pencarian <MoveRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}

function CompaniesMegaMenu({
  open,
  menuData,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean
  menuData: ReturnType<typeof buildNavbarData>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const [activeType, setActiveType] = useState(menuData.companyTypes[0])

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={cn(
      "fixed left-1/2 top-24 hidden w-[min(760px,92vw)] -translate-x-1/2 rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(23,23,23,.16)]",
      open && "block",
    )}>
      <div className="grid min-h-[280px] grid-cols-[1fr_1.6fr]">
        <div className="p-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tipe Perusahaan</p>
          <div className="grid gap-0.5">
            {menuData.companyTypes.map((type) => (
              <Link
                key={type.href}
                href={type.href}
                onMouseEnter={() => setActiveType(type)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f7f9fb] hover:text-[#2479d1]",
                  activeType.href === type.href && "bg-[#f2f7fb] text-[#171717] ring-1 ring-[#3f95e8]/30",
                )}
              >
                {type.label}
                <span className="font-mono text-xs text-slate-400">{type.count}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="border-l border-slate-100 p-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{activeType.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {activeType.companies.map((company) => (
              <Link
                key={company}
                href={activeType.href}
                className="flex items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-[#ffd36a] hover:bg-[#f7f9fb] hover:text-[#2479d1]"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[#3f95e8]/25 bg-[#f2f7fb] text-xs font-semibold text-[#2479d1]">
                  {company.charAt(0)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs">{company}</span>
                <CheckCircle2 className="size-3.5 shrink-0 text-primary/60" />
              </Link>
            ))}
          </div>
          <Link href={activeType.href} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f5f9f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2479d1]">
            Lihat Semua {activeType.label} <MoveRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function DesktopNav({ menuData }: { menuData: ReturnType<typeof buildNavbarData> }) {
  const [openMenu, setOpenMenu] = useState<"jobs" | "companies" | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname() ?? ""

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpenMenu(null), 180)
  }

  const open = (menu: "jobs" | "companies") => {
    cancelClose()
    setOpenMenu(menu)
  }

  const linkClass = (active: boolean) =>
    cn(
      "self-center rounded-lg px-3 py-2 text-[13px] transition-colors",
      active
        ? "bg-[#f2f7fb] font-semibold text-[#2479d1]"
        : "text-muted-foreground hover:bg-[#f7f9fb] hover:text-[#2479d1]",
    )

  const triggerClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
      active
        ? "bg-[#f2f7fb] font-semibold text-[#2479d1]"
        : "text-muted-foreground hover:bg-[#f7f9fb] hover:text-[#2479d1]",
    )

  const jobsActive = pathname === "/jobs" || pathname.startsWith("/jobs/")
  const blogActive = pathname === "/blog" || pathname.startsWith("/blog/") || pathname.startsWith("/page/blog")

  return (
    <nav className="hidden items-stretch gap-0.5 lg:flex" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <div className="relative flex items-center" onMouseEnter={() => open("jobs")}>
        <button
          type="button"
          className={triggerClass(jobsActive || openMenu === "jobs")}
          aria-expanded={openMenu === "jobs"}
        >
          Cari Lowongan
          <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", openMenu === "jobs" && "rotate-180")} />
        </button>
        <JobsMegaMenu open={openMenu === "jobs"} menuData={menuData} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} />
      </div>

      <div className="relative flex items-center" onMouseEnter={() => open("companies")}>
        <button
          type="button"
          className={triggerClass(openMenu === "companies")}
          aria-expanded={openMenu === "companies"}
        >
          Perusahaan
          <ChevronDown className={cn("size-3.5 text-slate-400 transition-transform", openMenu === "companies" && "rotate-180")} />
        </button>
        <CompaniesMegaMenu open={openMenu === "companies"} menuData={menuData} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} />
      </div>

      <Link href="/jobs" className={linkClass(jobsActive)}>
        Karier
      </Link>
      <Link href="/blog" className={linkClass(blogActive)}>
        Blog
      </Link>
    </nav>
  )
}

function MobileDrawer({ menuData }: { menuData: ReturnType<typeof buildNavbarData> }) {
  const mobileGroups = [
    { title: "Kategori", icon: Layers3, items: menuData.categories },
    { title: "Pendidikan", icon: GraduationCap, items: educationItems },
    { title: "Pengalaman", icon: BriefcaseBusiness, items: experienceItems },
    { title: "Lokasi", icon: MapPin, items: menuData.locations },
    { title: "Jenis Pekerjaan", icon: Clock3, items: menuData.jobTypes },
    { title: "Perusahaan", icon: Building2, items: menuData.companyTypes },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 rounded-lg lg:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(360px,92vw)] overflow-y-auto rounded-lg bg-white p-0">
        <SheetHeader className="border-b border-slate-100 px-5 py-4">
          <SheetTitle className="flex items-center justify-between text-slate-900">
            <span className="flex items-center gap-2 text-sm">
              <Image src="/logo.png" alt="Lowonganku" width={24} height={24} className="size-6 object-contain" />
              Lowonganku
            </span>
            <X className="size-4 text-slate-400" />
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-0 p-3">
          {mobileGroups.map((group) => {
            const Icon = group.icon
            return (
              <details key={group.title} className="rounded-lg open:bg-[#f7f9fb]" open={group.title === "Kategori"}>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 text-[13px] text-slate-700 [&::-webkit-details-marker]:hidden">
                  <Icon className="size-4 text-primary" />
                  {group.title}
                  <ChevronDown className="ml-auto size-4 text-slate-400" />
                </summary>
                <div className="grid gap-0.5 pb-3 pl-7 pr-2">
                  {group.items.map((item) => <CountLink key={item.href} item={item} />)}
                </div>
              </details>
            )
          })}
          <Button asChild className="mt-4 h-11 rounded-lg bg-[#1f5f9f] text-sm text-white hover:bg-[#2479d1]">
            <Link href="/jobs">Cari Lowongan</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Navbar({ jobs, categories, totalJobs }: NavbarData = {}) {
  const menuData = buildNavbarData({ jobs, categories, totalJobs })
  const pathname = usePathname() ?? ""
  const isHome = pathname === "/"
  const contactActive = pathname.startsWith("/contact")

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 w-full border-b border-black/10", isHome ? "bg-[#fffdf8]/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-sm")}>
      <SiteFrame className={cn(isHome && "bg-[#fffdf8]")}>
        <SiteContent className="flex h-24 items-center justify-between">
          <Logo />
          <DesktopNav menuData={menuData} />
          <div className="hidden items-center gap-2 lg:flex">
              <Button asChild variant="ghost" className="h-9 rounded-lg px-4 text-[13px] text-slate-600 hover:bg-[#f7f9fb] hover:text-[#2479d1]">
              <Link href="/jobs">Lowongan Terbaru</Link>
            </Button>
            <Button
              asChild
              className={cn("h-9 rounded-full px-5 text-[13px] font-semibold transition-colors", isHome ? "bg-[#1c0d0d] text-white hover:bg-[#342020]" : "bg-[#1f5f9f] text-white hover:bg-[#2479d1]")}
            >
              <Link href="/contact">Hubungi Kami</Link>
            </Button>
          </div>
          <MobileDrawer menuData={menuData} />
        </SiteContent>
      </SiteFrame>
    </header>
  )
}
