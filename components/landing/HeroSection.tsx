import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"

import type { Job } from "@/types"
import type { LandingCompanyItem, LandingHeroContent, LandingSectionCopy } from "@/types/landing-content"
import { JobPreviewCard, LandingEyebrow, PeopleArtwork } from "@/components/landing/JobkanVisuals"
import { Float, Reveal } from "@/components/landing/LandingMotion"
import { SiteContent } from "@/components/shared/SiteShell"

export function HeroSection({
  totalJobs,
  totalCategories,
  content,
  copy,
  visualCopy,
  companies,
  jobs = [],
}: {
  totalJobs: number
  totalCategories: number
  totalSources: number
  content: LandingHeroContent
  copy: LandingSectionCopy["hero"]
  visualCopy: LandingSectionCopy["visuals"]
  companies: LandingCompanyItem[]
  jobs?: Job[]
}) {
  const boardJobs = jobs.length ? jobs : [undefined, undefined, undefined]

  return (
    <section className="w-full overflow-hidden bg-white pt-0">
      <div className="mx-auto grid w-full max-w-[1400px] overflow-hidden border-y border-black/10 bg-white lg:grid-cols-[.94fr_1.06fr]">
        <Reveal className="flex min-w-0 flex-col justify-center px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
          <LandingEyebrow>{copy.eyebrow}</LandingEyebrow>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[.96] tracking-[-.075em] text-[#171717] sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-500 sm:text-lg">
            {content.description}
          </p>

          <Link
            href={content.primaryCta.href}
            className="group mt-8 flex w-full max-w-md items-center gap-3 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_7px_0_rgba(23,23,23,.05)] transition-all hover:-translate-y-0.5 hover:border-[#f2a23a] hover:shadow-[0_10px_24px_rgba(63,149,232,.14)]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf5ff] text-[#2479d1]"><Search className="size-5" /></span>
            <span className="min-w-0 flex-1 text-left text-sm text-slate-400">{copy.searchPlaceholder}</span>
            <span className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#3f95e8] px-5 text-sm font-semibold text-white transition-colors group-hover:bg-[#2479d1]">{copy.searchLabel}</span>
          </Link>

          <div className="mt-10 flex items-center gap-4">
            <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center shadow-[0_5px_0_rgba(23,23,23,.04)]">
              <strong className="block text-3xl font-semibold tracking-[-.07em] text-[#171717]">{totalJobs.toLocaleString("id-ID")}+</strong>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a5a00]">{copy.statLabel}</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-.04em] text-[#171717]">{copy.statTitle}</p>
              <p className="mt-1 max-w-[230px] text-sm leading-5 text-slate-500">{totalCategories}+ {copy.statDescription}</p>
              <Link href={content.secondaryCta.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2479d1] underline decoration-[#f2a23a] decoration-2 underline-offset-4 hover:text-[#171717]">{content.secondaryCta.label}<ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative isolate min-h-[470px] min-w-0 overflow-hidden bg-[#1f5f9f] sm:min-h-[590px] lg:min-h-full">
          <div className="absolute -left-10 bottom-0 h-[28%] w-[54%] -skew-x-12 bg-white/10" />
          <div className="absolute bottom-8 right-8 grid grid-cols-4 gap-2 opacity-25 sm:bottom-12 sm:right-12">
            {Array.from({ length: 16 }, (_, index) => <span key={index} className="size-1.5 rounded-full bg-white" />)}
          </div>
          <div className="absolute inset-x-[12%] top-[16%] bottom-[11%] overflow-hidden rounded-[28px] border border-white/50 bg-white p-5 shadow-[0_18px_0_rgba(23,23,23,.14)] sm:p-7">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div>
                <p className="text-sm font-semibold tracking-[-.03em] text-[#171717]">{visualCopy.boardTitle}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.14em] text-slate-400">{visualCopy.boardEyebrow}</p>
              </div>
              <Link href="/jobs" className="text-[10px] font-medium text-[#2479d1] transition-colors hover:text-[#171717]">{visualCopy.boardLinkLabel}</Link>
            </div>
            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1 sm:max-h-[405px]">
              {boardJobs.map((job, index) => <JobPreviewCard key={`${job?.id ?? "preview"}-${index}`} job={job} index={index} compact copy={visualCopy} />)}
            </div>
          </div>
          <Float className="pointer-events-none absolute -bottom-3 right-[3%] hidden w-[38%] drop-shadow-[0_12px_0_rgba(23,23,23,.12)] md:block"><PeopleArtwork className="w-full" /></Float>
          <div className="absolute left-[5%] top-[22%] w-[46%] sm:left-[3%] sm:w-[40%]"><JobPreviewCard job={jobs[0]} index={0} compact copy={visualCopy} /></div>
          <div className="absolute bottom-[7%] left-[7%] w-[52%] -rotate-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_10px_0_rgba(23,23,23,.1)] sm:left-[4%] sm:w-[46%]">
            <p className="text-sm font-semibold tracking-[-.03em] text-[#171717]">{copy.floatingTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{copy.floatingDescription}</p>
          </div>
          <div className="absolute right-[5%] top-[12%] w-[37%] rotate-2 sm:right-[3%] sm:w-[32%]"><JobPreviewCard job={jobs[1]} index={1} compact copy={visualCopy} /></div>
        </Reveal>
      </div>

      <div className="w-full border-b border-black/10 bg-white">
        <SiteContent className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-8 text-xl font-semibold tracking-[-.06em] text-[#171717] sm:justify-between">
          {(companies.length ? companies : []).slice(0, 5).map((company) => <span key={company.id}>{company.name}</span>)}
        </SiteContent>
      </div>
    </section>
  )
}
