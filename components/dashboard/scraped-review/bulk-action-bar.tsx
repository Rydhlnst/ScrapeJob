import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  selectedCount: number
  busy: boolean
  publishDisabled: boolean
  onApproveSelected: () => void
  onRejectSelected: () => void
  onPublishSelected: () => void
  onCleanAiSelected: () => void
  onClear: () => void
}

export function BulkActionBar({
  selectedCount,
  busy,
  publishDisabled,
  onApproveSelected,
  onRejectSelected,
  onPublishSelected,
  onCleanAiSelected,
  onClear,
}: Props) {
  if (selectedCount <= 0) return null

  return (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
      <Badge variant="secondary">{selectedCount} selected</Badge>
      <Button size="sm" variant="outline" disabled={busy} onClick={onCleanAiSelected} className="gap-1.5 text-sky-700 border-sky-100 hover:bg-sky-50/50">
        <Sparkles className="h-3.5 w-3.5 text-sky-600" />
        Clean with AI
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={onApproveSelected}>
        Approve Selected
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={onRejectSelected}>
        Reject Selected
      </Button>
      <Button size="sm" disabled={busy || publishDisabled} onClick={onPublishSelected}>
        Publish Selected
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Clear Selection
      </Button>
    </div>
  )
}
