import { cn } from "@/lib/utils"

export function AdminHeader({
  title,
  description,
  actions,
  className,
  sticky = true,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  sticky?: boolean
}) {
  return (
    <header
      className={cn(
        "border border-border bg-card px-5 py-4 md:px-6",
        sticky && "z-10 mb-3 rounded-none",
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
    </header>
  )
}
