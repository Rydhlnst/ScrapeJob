import { listJobs } from "@/lib/api/jobs"
import { AdminHeader } from "@/components/admin/admin-header"
import { RawDataTable } from "@/components/admin/raw-data-table"

export default async function AdminRawDataPage() {
  const all = await listJobs({ admin: true, perPage: 100, page: 1, sort: "newest" })
  const raw = all.data.filter((j) => j.status === "raw" || j.status === "duplicate")

  return (
    <div>
      <AdminHeader
        title="Raw Data"
        description="Data scraping sebelum dibersihkan/normalisasi. Tidak otomatis publish."
      />
      <div className="space-y-4 p-4 md:p-6">
        <RawDataTable jobs={raw.length ? raw : all.data.slice(0, 6)} />
      </div>
    </div>
  )
}

