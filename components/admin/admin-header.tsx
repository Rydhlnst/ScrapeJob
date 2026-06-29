import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AdminHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "border border-border bg-card px-5 py-5 md:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div className="md:hidden">
        <Button asChild variant="outline" className="mt-4 h-11 w-full rounded-none">
          <a href="/">Back to Public</a>
        </Button>
      </div>
    </header>
  )
}
