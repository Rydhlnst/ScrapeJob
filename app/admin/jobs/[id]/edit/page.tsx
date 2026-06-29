import Link from "next/link"
import { notFound } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminShell } from "@/components/admin/admin-shell"
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
    <AdminShell>
      <AdminHeader
        title="Edit Job"
        description="Bedakan data mentah vs data yang sudah diedit. Raw description ada di accordion."
        actions={
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/admin/jobs/${job.id}/preview`}>Preview</Link>
          </Button>
        }
      />
      <div className="border border-border bg-card p-5">
        <JobEditorForm job={job} />
      </div>
    </AdminShell>
  )
}
