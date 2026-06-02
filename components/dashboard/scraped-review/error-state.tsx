import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ReviewErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert className="border-rose-200 bg-rose-50/60 text-rose-900">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Failed to load scraped jobs</AlertTitle>
      <AlertDescription className="mt-1 flex flex-wrap items-center gap-3">
        <span>Please try refreshing the data.</span>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

