import Link from "next/link"
import type { ScrapedJob } from "@/types/job"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrapedJobStatusBadge } from "./scraped-job-status-badge"

type ScrapedJobTableProps = {
  jobs: ScrapedJob[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function ScrapedJobTable({ jobs, onApprove, onReject }: ScrapedJobTableProps) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No scraped jobs found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-muted-foreground">
                {job.company} • {job.location ?? "Unknown"}
              </p>
              <div className="flex items-center gap-2">
                <ScrapedJobStatusBadge status={job.status} />
                <span className="text-xs text-muted-foreground">{job.source}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onReject(job.id)}>
                Reject
              </Button>
              <Button size="sm" onClick={() => onApprove(job.id)}>
                Approve
              </Button>
              <Link
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-2 hover:underline"
              >
                Source
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
