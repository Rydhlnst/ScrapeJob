import { Bell, CalendarDays, CheckCircle2, Clock3, Search } from "lucide-react"

import { listJobs } from "@/lib/api/jobs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const statusTone: Record<string, string> = {
  published: "border-border bg-accent text-accent-foreground",
  draft: "border-border bg-background text-foreground",
  raw: "border-border bg-muted text-muted-foreground",
  rejected: "border-border bg-muted text-muted-foreground",
  duplicate: "border-border bg-background text-muted-foreground",
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
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-xl border-input bg-muted pl-9 text-foreground"
              placeholder="Search jobs, company, or source..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifications"
              className="border-input bg-muted hover:bg-accent/60"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="border border-input bg-muted">
              <AvatarFallback className="bg-muted font-medium text-foreground">AD</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-1">
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Good Evening, Admin</h1>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Raw Jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.raw ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.draft ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.published ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {(counts.rejected ?? 0) + (counts.duplicate ?? 0)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Jobs</CardTitle>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJobs.length ? (
              recentJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1.8fr_1fr_auto]"
                >
                  <div>
                    <p className="font-medium leading-tight">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">A{index + 1}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{job.sourceName}</span>
                  </div>
                  <Badge className={statusTone[job.status] ?? "bg-muted text-muted-foreground"}>
                    {job.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No jobs found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border p-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scrape quality review</p>
                <p className="text-xs text-muted-foreground">09:00 - 10:30 WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Category cleanup</p>
                <p className="text-xs text-muted-foreground">13:00 - 14:00 WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Publish approved jobs</p>
                <p className="text-xs text-muted-foreground">16:00 - 17:00 WIB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
