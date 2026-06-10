import { AdminHeader } from "@/components/admin/admin-header"
import { ScrapeRunsClient } from "@/components/admin/scrape-runs-client"

export default function AdminScrapeRunsPage() {
  return (
    <div>
      <AdminHeader
        title="Scrape Runs"
        description="Jalankan scraping manual dan lihat log status success, partial, failed, duplicate, atau skipped."
      />
      <div>
        <ScrapeRunsClient runs={[]} />
      </div>
    </div>
  )
}
