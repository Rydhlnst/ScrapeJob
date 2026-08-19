import Link from "next/link"
import { ArrowRight, Bookmark, CheckCircle2, Search } from "lucide-react"

import { JobPreviewCard, LandingEyebrow } from "@/components/landing/JobkanVisuals"
import { Reveal } from "@/components/landing/LandingMotion"
import { Container } from "@/components/shared/Container"
import type { LandingBenefitsContent, LandingSectionCopy } from "@/types/landing-content"
import type { Job } from "@/types"

const icons = [Search, CheckCircle2, Bookmark]

export function BenefitsSection({ content, copy, visualCopy, jobs = [] }: { content: LandingBenefitsContent; copy: LandingSectionCopy["features"]; visualCopy: LandingSectionCopy["visuals"]; jobs?: Job[] }) {
  return (
    <section className="overflow-hidden bg-white py-20 md:py-28" id="features">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <Reveal className="min-w-0">
            <LandingEyebrow>{copy.eyebrow}</LandingEyebrow>
            <h2 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-.06em] text-[#171717] md:text-6xl">{content.title}</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">{content.items[0]?.description ?? "Cari lowongan dari banyak sumber tanpa kehilangan konteks penting sebelum kamu melamar."}</p>
            <Link href="/jobs" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[#3f95e8] px-6 text-sm font-extrabold text-white shadow-[0_4px_0_rgba(23,23,23,.13)] transition-all hover:-translate-y-0.5 hover:bg-[#2479d1]">
              {copy.actionLabel} <ArrowRight className="size-4" />
            </Link>

            <div className="mt-11 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {content.items.slice(0, 3).map((item, index) => {
                const Icon = icons[index] ?? Search
                return (
                  <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_4px_0_rgba(23,23,23,.03)] transition-all duration-200 hover:-translate-y-1 hover:border-[#3f95e8]/40 hover:bg-white hover:shadow-[0_10px_24px_rgba(31,95,159,.10)]">
                    <Icon className="size-5 text-[#2479d1]" />
                    <p className="mt-3 text-sm font-extrabold tracking-[-.03em] text-[#171717]">{item.title}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative min-w-0 min-h-[430px] overflow-hidden rounded-[34px] bg-[#dceeff] p-6 sm:min-h-[500px] sm:p-10">
            <div className="absolute -right-20 -top-20 size-[310px] rounded-full border border-white/60 bg-white/40" />
            <div className="absolute -bottom-24 -left-12 size-[310px] rounded-full bg-[#3f95e8]" />
            <div className="relative mx-auto mt-5 max-w-[500px] rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_20px_0_rgba(23,23,23,.08)] sm:p-5">
              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 text-sm text-slate-400"><Search className="size-4 text-[#2479d1]" /><span className="flex-1">{copy.searchPlaceholder}</span><span className="rounded-lg bg-[#3f95e8] px-4 py-2 text-xs font-bold text-white">{copy.searchLabel}</span></div>
              <div className="mt-4 space-y-3"><JobPreviewCard job={jobs[0]} index={0} copy={visualCopy} /><JobPreviewCard job={jobs[1]} index={1} compact copy={visualCopy} /><JobPreviewCard job={jobs[2]} index={2} compact copy={visualCopy} /></div>
            </div>
            <div className="absolute bottom-7 left-5 w-[46%] -rotate-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_0_rgba(23,23,23,.08)] sm:bottom-10 sm:left-8">
              <p className="text-xs font-extrabold text-[#171717]">{copy.savedTitle}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{copy.savedDescription}</p>
            </div>
            <div className="absolute right-4 top-8 rounded-xl bg-[#1c0d0d] px-4 py-3 text-xs font-bold text-white shadow-lg sm:right-8">{copy.sourceLabel}</div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
