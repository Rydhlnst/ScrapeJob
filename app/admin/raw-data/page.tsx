import { RawDataReviewClient } from "@/components/admin/raw-data-review-client"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { RefreshCw, Play } from "lucide-react"

export default function AdminRawDataPage() {
  return (
    <AdminShell>
      <Card className="overflow-hidden rounded-none border-0 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Scraped Jobs Review</h1>
            <p className="text-sm text-muted-foreground">
              Review, clean, edit, reject, and move scraped job listings into Blog Loker drafts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-none">
              <Link href="/admin/scrape-runs">
                <Play className="h-4 w-4" />
                Run Scraper
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin/raw-data" className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <RawDataReviewClient />
    </AdminShell>
  )
}

