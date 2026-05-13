import Link from "next/link"
import { notFound } from "next/navigation"

import { getAdminJobById } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { JobEditorForm } from "@/components/admin/job-editor-form"
import { Button } from "@/components/ui/button"

export default async function AdminJobEditPage({
  params,
}: {
  params: { id: string }
}) {
  const job = await getAdminJobById(params.id)
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
      <div className="p-4 md:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <JobEditorForm job={job} />
        </div>
      </div>
    </div>
  )
}

