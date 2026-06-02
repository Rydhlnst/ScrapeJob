import { listJobs } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { JobsTable } from "@/components/admin/jobs-table"

export default async function AdminJobsPage() {
  const all = await listJobs({ admin: true, perPage: 50, page: 1, sort: "newest" })
  return (
    <div>
      <AdminHeader
        title="Jobs"
        description="Kelola raw/draft/published/rejected/duplicate. Publish/unpublish/reject aman (mock)."
      />
      <div>
        <JobsTable jobs={all.data} />
      </div>
    </div>
  )
}
