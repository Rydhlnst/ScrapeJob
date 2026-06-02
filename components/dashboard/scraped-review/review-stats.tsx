import { CheckCheck, CircleX, FileSearch, Send } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReviewStats } from "./types"

export function ReviewStatsCards({ stats }: { stats: ReviewStats }) {
  const cards = [
    {
      key: "pending",
      label: "Pending Jobs",
      value: stats.pending,
      helper: "Waiting for review",
      icon: FileSearch,
      tone: "text-amber-600",
    },
    {
      key: "approved",
      label: "Approved Jobs",
      value: stats.approved,
      helper: "Ready to publish",
      icon: CheckCheck,
      tone: "text-blue-600",
    },
    {
      key: "rejected",
      label: "Rejected Jobs",
      value: stats.rejected,
      helper: "Removed from queue",
      icon: CircleX,
      tone: "text-rose-600",
    },
    {
      key: "published",
      label: "Published Jobs",
      value: stats.published,
      helper: "Visible to users",
      icon: Send,
      tone: "text-emerald-600",
    },
  ] as const

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <Card key={item.key} className="border-border/70 bg-card/90 transition hover:shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs uppercase tracking-wide">
              {item.label}
              <item.icon className={`h-4 w-4 ${item.tone}`} />
            </CardDescription>
            <CardTitle className="text-3xl tracking-tight">{item.value}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">{item.helper}</CardContent>
        </Card>
      ))}
    </div>
  )
}

