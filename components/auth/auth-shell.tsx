import Image from "next/image"
import { BarChart3, Globe2 } from "lucide-react"

import { Card } from "@/components/ui/card"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen bg-[#f4f8ff] lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <Card className="w-full max-w-md rounded-none border-[#d8e4f6] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Lowonganku logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-none object-cover"
            />
            <p className="text-sm font-semibold text-foreground">Lowonganku</p>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </Card>
      </section>

      <aside className="hidden border-l border-[#d8e4f6] bg-[#eef5ff] lg:block">
        <div className="flex h-full items-center justify-center p-12">
          <div className="w-full max-w-lg space-y-5">
            <Card className="rounded-none border-[#d8e4f6] bg-white p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-3 flex items-center justify-between text-sm">
                <p className="font-medium text-foreground">Job Health Overview</p>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-none border border-[#d8e4f6] bg-[#f8fbff] p-3">
                  <p className="text-muted-foreground">Published</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">5.2K</p>
                </div>
                <div className="rounded-none border border-[#d8e4f6] bg-[#f8fbff] p-3">
                  <p className="text-muted-foreground">Draft</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">944</p>
                </div>
                <div className="rounded-none border border-[#d8e4f6] bg-[#f8fbff] p-3">
                  <p className="text-muted-foreground">Rejected</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">214</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-none border-[#d8e4f6] bg-white p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Global Sources</p>
                <Globe2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Trusted ingestion pipeline with continuous review for Jobstreet,
                Glints, Loker.id, and more.
              </p>
            </Card>
          </div>
        </div>
      </aside>
    </div>
  )
}
