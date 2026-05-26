import { Badge } from "@/components/ui/badge"

type JobSourceBadgeProps = {
  source: string
}

export function JobSourceBadge({ source }: JobSourceBadgeProps) {
  return <Badge variant="outline">{source.toUpperCase()}</Badge>
}
