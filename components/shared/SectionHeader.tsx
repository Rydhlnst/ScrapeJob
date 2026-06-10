import { cn } from "@/lib/utils"

export function SectionHeader({
  title,
  description,
  align = "left",
  className,
}: {
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-[2rem]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
