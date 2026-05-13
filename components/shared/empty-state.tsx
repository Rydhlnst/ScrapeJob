import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-10 text-center shadow-sm",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          className="mt-5 rounded-2xl bg-[hsl(var(--dark))] text-white hover:bg-[hsl(var(--dark-soft))]"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
