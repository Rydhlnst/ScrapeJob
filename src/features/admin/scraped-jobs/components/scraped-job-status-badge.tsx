import { Badge } from "@/components/ui/badge"
import type { ScrapedJobStatus } from "@/types/job"

type ScrapedJobStatusBadgeProps = {
  status: ScrapedJobStatus
}

export function ScrapedJobStatusBadge({ status }: ScrapedJobStatusBadgeProps) {
  const variant =
    status === "pending" ? "secondary" : status === "approved" ? "default" : "outline"

  return <Badge variant={variant}>{status}</Badge>
}
