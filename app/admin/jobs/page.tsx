import { listJobs } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
import { JobsTable } from "@/components/admin/jobs-table"

export default async function AdminJobsPage() {
  const all = await listJobs({ admin: true, perPage: 50, page: 1, sort: "newest" })
  return (
    <AdminShell>
      <AdminHeader
        title="Jobs"
        description="Kelola raw, draft, published, rejected, dan duplicate jobs dalam satu alur editorial."
      />
      <JobsTable jobs={all.data} />
    </AdminShell>
  )
}
