import { listScrapeRuns } from "@/lib/api/scrape-runs"
import { AdminHeader } from "@/components/admin/admin-header"
import { ScrapeRunsClient } from "@/components/admin/scrape-runs-client"

export default async function AdminScrapeRunsPage() {
  const runs = await listScrapeRuns()
  return (
    <div>
      <AdminHeader
        title="Scrape Runs"
        description="Jalankan scraping manual (mock) dan lihat log status success/failed/duplicate/skipped."
      />
      <div className="p-4 md:p-6">
        <ScrapeRunsClient runs={runs} />
      </div>
    </div>
  )
}

