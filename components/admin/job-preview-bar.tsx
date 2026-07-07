"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export function JobPreviewBar({ jobId }: { jobId: string }) {
  return (
    <div className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Button asChild variant="outline">
          <Link href={`/admin/jobs/${jobId}/edit`}>Back to Edit</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => console.log("publish", jobId)}
          >
            Publish
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => console.log("reject", jobId)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}


