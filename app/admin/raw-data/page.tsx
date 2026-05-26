import { AdminHeader } from "@/components/admin/admin-header"
import { RawDataReviewClient } from "@/components/admin/raw-data-review-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RefreshCw, Play } from "lucide-react"

export default function AdminRawDataPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <AdminHeader
        title="Scraped Jobs Review"
        description="Review, clean, approve, or reject scraped job listings before publishing."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/scrape-runs">
                <Play className="h-4 w-4" />
                Run Scraper
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/admin/raw-data" className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Link>
            </Button>
          </>
        }
      />
      <RawDataReviewClient />
    </div>
  )
}
