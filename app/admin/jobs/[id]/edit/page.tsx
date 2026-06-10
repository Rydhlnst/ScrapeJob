import Link from "next/link"
import { notFound } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { JobEditorForm } from "@/components/admin/job-editor-form"
import { Button } from "@/components/ui/button"

export default async function AdminJobEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getAdminJobById(id)
  if (!job) notFound()

  return (
    <div>
      <AdminHeader
        title="Edit Job"
        description="Bedakan data mentah vs data yang sudah diedit. Raw description ada di accordion."
        actions={
          <Button asChild variant="outline">
            <Link href={`/admin/jobs/${job.id}/preview`}>Preview</Link>
          </Button>
        }
      />
      <div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <JobEditorForm job={job} />
        </div>
      </div>
    </div>
  )
}
