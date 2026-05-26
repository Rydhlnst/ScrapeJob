import Link from "next/link"
import type { Job, ScrapedJob } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type JobCardProps = {
  job: Job | ScrapedJob
  adminView?: boolean
}

function hasStatus(job: Job | ScrapedJob): job is ScrapedJob {
  return "status" in job
}

export function JobCard({ job, adminView = false }: JobCardProps) {
  const sourceLabel = job.source.toUpperCase()
  const posted = hasStatus(job) ? job.postedDate : job.postedDate
  const detailLink = hasStatus(job) ? `/admin/scraped-jobs/${job.id}` : `/jobs/${job.slug}`

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">{sourceLabel}</Badge>
          {adminView && hasStatus(job) ? (
            <Badge
              variant={
                job.status === "pending"
                  ? "secondary"
                  : job.status === "approved"
                    ? "default"
                    : "outline"
              }
            >
              {job.status}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="line-clamp-2 text-lg">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{job.company}</p>
        <p>{job.location ?? "Location not specified"}</p>
        <p>{job.salary ?? "Salary not disclosed"}</p>
        <p>{job.employmentType ?? "Employment type not specified"}</p>
        <p>{posted ?? "Posted date unavailable"}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Link
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          Source link
        </Link>
        <Link href={detailLink} className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          View detail
        </Link>
      </CardFooter>
    </Card>
  )
}
