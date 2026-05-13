import { listJobs } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
import { JobsTable } from "@/components/admin/jobs-table"

export default async function AdminDashboardPage() {
  const all = await listJobs({ admin: true, perPage: 100, page: 1 })
  const jobs = all.data

  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Ringkasan status job: raw → draft → review → publish."
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AdminStatCard label="Total Raw" value={counts.raw ?? 0} />
          <AdminStatCard label="Draft" value={counts.draft ?? 0} />
          <AdminStatCard label="Published" value={counts.published ?? 0} />
          <AdminStatCard label="Rejected" value={counts.rejected ?? 0} />
          <AdminStatCard label="Duplicate" value={counts.duplicate ?? 0} />
        </div>
        <JobsTable jobs={jobs.slice(0, 6)} title="Recent Jobs" />
      </div>
    </div>
  )
}

