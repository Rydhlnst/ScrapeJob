import { Button } from "@/components/ui/button"

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-white px-4 py-4 md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="md:hidden">
        <Button asChild variant="outline" className="w-full">
          <a href="/">Back to Public</a>
        </Button>
      </div>
    </div>
  )
}

