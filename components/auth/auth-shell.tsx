import { BarChart3, Globe2 } from "lucide-react"
import Image from "next/image"

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
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <Card className="w-full max-w-md border-slate-200 bg-white/95 p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Image src="/logo.png" alt="Lowonganku logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
            <p className="text-sm font-semibold text-slate-700">Lowonganku</p>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </Card>
      </section>

      <aside className="relative hidden overflow-hidden border-l bg-gradient-to-b from-white via-slate-50 to-slate-100 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.18),transparent_45%),radial-gradient(circle_at_75%_35%,rgba(15,23,42,0.1),transparent_50%)]" />
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="w-full max-w-lg space-y-5">
            <Card className="rotate-[-5deg] border-slate-200/70 bg-white/90 p-5 shadow-xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm">
                <p className="font-medium text-slate-900">Job Health Overview</p>
                <BarChart3 className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-emerald-600">Published</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">5.2K</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-amber-600">Draft</p>
                  <p className="mt-1 text-lg font-semibold text-amber-700">944</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-3">
                  <p className="text-rose-600">Rejected</p>
                  <p className="mt-1 text-lg font-semibold text-rose-700">214</p>
                </div>
              </div>
            </Card>

            <Card className="rotate-[7deg] border-slate-200/70 bg-white/90 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">Global Sources</p>
                <Globe2 className="h-4 w-4 text-cyan-600" />
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Trusted ingestion pipeline with continuous review for Jobstreet, Glints, Loker.id, and more.
              </p>
            </Card>
          </div>
        </div>
      </aside>
    </div>
  )
}
