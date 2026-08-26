import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import type { Category } from "@/types"
import { Container } from "@/components/shared/Container"
import type { LandingSectionCopy } from "@/types/landing-content"

export function PopularCategories({ categories, content }: { categories: Category[]; content: LandingSectionCopy["categories"] }) {
  return (
    <section
      className="relative overflow-hidden border-b border-black/10 bg-white py-20 md:py-28"
      id="categories"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto w-full max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3f95e8]/30 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2479d1]">
              <Sparkles className="size-3.5" />
              {content.eyebrow}
            </div>
            <h2 className="jobkan-section-title mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.06em] text-[#171717] md:text-6xl">
              {content.title}
            </h2>
            <p className="mt-3 text-sm leading-[1.8] text-slate-500">
              {content.description}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((cat, index) => {
            // Cycle through accent colors for variety
            const colors = [
              { bg: "bg-[#dceeff]", fg: "text-[#2479d1]", border: "border-[#b9ddff]" },
              { bg: "bg-white", fg: "text-[#2479d1]", border: "border-[#3f95e8]/30" },
              { bg: "bg-[#eaf5ff]", fg: "text-[#2479d1]", border: "border-[#d1e9ff]" },
            ]
            const color = colors[index % colors.length]

            return (
              <Link
                key={cat.id}
                href={`/jobs?category=${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_4px_0_rgba(23,23,23,.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2a23a] hover:shadow-[0_10px_24px_rgba(63,149,232,.14)]"
              >
                <div
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${color.bg} ${color.fg} border ${color.border}`}
                >
                  <span className="text-base font-semibold">
                    {cat.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--brand-ink)] group-hover:text-[var(--brand-blue)]">
                    {cat.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {cat.totalJobs ? `${cat.totalJobs.toLocaleString("id-ID")} lowongan` : "Jelajahi peran"}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-10 text-center"><Link href="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-[#3f95e8] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_0_rgba(23,23,23,.13)] transition-all hover:-translate-y-0.5 hover:bg-[#2479d1]">{content.buttonLabel} <ArrowRight className="size-4" /></Link></div>
      </Container>
    </section>
  )
}
