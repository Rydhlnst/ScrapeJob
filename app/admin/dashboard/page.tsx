import { 
  Bell, 
  CalendarDays, 
  CheckCircle2, 
  Clock3, 
  Search, 
  Database, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Play
} from "lucide-react"
import Link from "next/link"

import { listJobs } from "@/lib/api/jobs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const statusTone: Record<string, string> = {
  published: "border-emerald-100 bg-emerald-50/60 text-emerald-700 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400",
  draft: "border-amber-100 bg-amber-50/60 text-amber-700 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400",
  raw: "border-blue-100 bg-blue-50/60 text-blue-700 dark:border-blue-950/40 dark:bg-blue-950/20 dark:text-blue-400",
  rejected: "border-rose-100 bg-rose-50/60 text-rose-700 dark:border-rose-950/40 dark:bg-rose-950/20 dark:text-rose-400",
  duplicate: "border-slate-200 bg-slate-100/60 text-slate-600 dark:border-slate-800/40 dark:bg-slate-800/20 dark:text-slate-400",
}

export default async function AdminDashboardPage() {
  const all = await listJobs({ admin: true, perPage: 100, page: 1 })
  const jobs = all.data

  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {})

  const recentJobs = jobs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-xs">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 rounded-xl border-input bg-muted/50 pl-9 pr-4 text-foreground placeholder:text-slate-400 focus-visible:ring-1"
              placeholder="Search jobs, company, or source..."
            />
          </div>
          <div className="flex items-center justify-end gap-3.5">
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifications"
              className="h-10 w-10 rounded-xl border-input bg-muted/40 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border border-input">
                <AvatarFallback className="bg-blue-600 font-bold text-white text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Super Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">admin@example.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 p-6 md:p-8 dark:border-blue-950/40 dark:from-slate-900/40 dark:to-slate-950/30">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Platform Status
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-50">
              Good Evening, Admin
            </h1>
            <p className="max-w-md text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              Welcome back. You have scraped jobs waiting for review. Use AI translation and cleanup to publish them instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl">
              <Link href="/admin/scrape-runs" className="inline-flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                Run Scraper
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/80 hover:bg-white border-slate-200 text-slate-700 shadow-xs rounded-xl dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800">
              <Link href="/admin/raw-data">
                Review Scraped Jobs
              </Link>
            </Button>
          </div>
        </div>
        {/* Subtle decorative shapes */}
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-blue-200/20 blur-2xl dark:bg-blue-900/5"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 h-36 w-36 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-900/5"></div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Raw Jobs */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200/80 dark:hover:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Raw Jobs</CardTitle>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 transition-colors group-hover:bg-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400 dark:group-hover:bg-blue-900/40">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{counts.raw ?? 0}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Waiting for AI cleanup</p>
          </CardContent>
        </Card>

        {/* Draft */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200/80 dark:hover:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Draft AI</CardTitle>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 transition-colors group-hover:bg-amber-100/80 dark:bg-amber-950/40 dark:text-amber-400 dark:group-hover:bg-amber-900/40">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{counts.draft ?? 0}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Ready to approve & publish</p>
          </CardContent>
        </Card>

        {/* Published */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200/80 dark:hover:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Published</CardTitle>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition-colors group-hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:group-hover:bg-emerald-900/40">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{counts.published ?? 0}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Active job vacancies</p>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200/80 dark:hover:border-rose-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Needs Attention</CardTitle>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 transition-colors group-hover:bg-rose-100/80 dark:bg-rose-950/40 dark:text-rose-400 dark:group-hover:bg-rose-900/40">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {(counts.rejected ?? 0) + (counts.duplicate ?? 0)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Rejected or duplicates</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid section */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Jobs */}
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/80 pb-4 dark:border-slate-800/60">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold">Recent Jobs Ingested</CardTitle>
              <CardDescription className="text-xs">Latest jobs extracted from active scrapers.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-3 rounded-lg text-xs">
              <Link href="/admin/raw-data" className="inline-flex items-center gap-1">
                See all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2.5">
              {recentJobs.length ? (
                recentJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="group/item flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/30 md:flex-row md:items-center md:justify-between dark:border-slate-850 dark:bg-slate-950 dark:hover:border-slate-700"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 leading-tight group-hover/item:text-blue-600 transition-colors text-sm dark:text-slate-200">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{job.companyName}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-blue-50/70 text-[9px] font-bold text-blue-700 uppercase dark:bg-blue-950/40 dark:text-blue-400">
                          {job.sourceName.substring(0, 2)}
                        </div>
                        <span className="text-[11px] text-slate-500 capitalize dark:text-slate-400">{job.sourceName}</span>
                      </div>
                      <Badge variant="outline" className={`${statusTone[job.status] ?? "bg-muted text-muted-foreground"} border text-[10px] font-medium px-2 py-0.5 rounded-full capitalize`}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                  <Database className="mb-2 h-8 w-8 text-slate-200 dark:text-slate-800" />
                  <p className="text-xs">No jobs found in database.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Schedule */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-slate-100/80 pb-4 dark:border-slate-800/60">
            <CardTitle className="text-base font-bold">Quick Schedule</CardTitle>
            <CardDescription className="text-xs">Operational schedules & cleanup tasks.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="group/schedule flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/5 dark:border-slate-850 dark:bg-slate-950">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 group-hover/schedule:bg-blue-100/80 dark:bg-blue-950/40 dark:text-blue-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scrape quality review</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">09:00 - 10:30 WIB</p>
                </div>
              </div>
              <div className="group/schedule flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-all duration-200 hover:border-purple-100 hover:bg-purple-50/5 dark:border-slate-850 dark:bg-slate-950">
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 group-hover/schedule:bg-purple-100/80 dark:bg-purple-950/40 dark:text-purple-400">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Category cleanup</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">13:00 - 14:00 WIB</p>
                </div>
              </div>
              <div className="group/schedule flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 transition-all duration-200 hover:border-emerald-100 hover:bg-emerald-50/5 dark:border-slate-850 dark:bg-slate-950">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 group-hover/schedule:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Publish approved jobs</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">16:00 - 17:00 WIB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

