"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ScrapedJob } from "@/types/job"
import { ScrapedJobStatusBadge } from "./scraped-job-status-badge"

type ScrapedJobReviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: ScrapedJob | null
}

export function ScrapedJobReviewModal({ open, onOpenChange, job }: ScrapedJobReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Scraped Job Review</DialogTitle>
        </DialogHeader>
        {!job ? null : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ScrapedJobStatusBadge status={job.status} />
              <span className="text-sm text-muted-foreground">{job.source}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-sm text-muted-foreground">
                {job.company} • {job.location ?? "Unknown"}
              </p>
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {job.description ?? "No description provided."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
