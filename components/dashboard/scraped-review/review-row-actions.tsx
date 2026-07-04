import Link from "next/link"
import { Check, ExternalLink, MoreHorizontal, Send, Sparkles, X } from "lucide-react"

import type { ScrapedJob } from "@/types/job"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { RowAction } from "./types"

type Props = {
  job: ScrapedJob
  sourceUrl: string
  disabled: boolean
  publishDisabled: boolean
  onAction: (action: RowAction) => Promise<void>
  onInspect: () => void
}

export function ReviewRowActions({ job, sourceUrl, disabled, publishDisabled, onAction, onInspect }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <MoreHorizontal className="h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            View Source
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => void onAction("clean_ai")}>
          <Sparkles className="h-4 w-4 text-sky-600" />
          Clean with AI
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInspect}>
          <Sparkles className={`h-4 w-4 ${job.draftStatus === "drafted_ai" ? "text-sky-600" : "text-slate-500"}`} />
          View draft
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => void onAction("approve")}>
          <Check className="h-4 w-4 text-blue-600" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onClick={() => void onAction("reject")}>
          <X className="h-4 w-4 text-rose-600" />
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled || publishDisabled} onClick={() => void onAction("publish")}>
          <Send className="h-4 w-4 text-emerald-600" />
          Publish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
