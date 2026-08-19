import Link from "next/link"
import { ArrowRight, CheckCircle2, Search } from "lucide-react"

import { JobPreviewCard, LandingEyebrow } from "@/components/landing/JobkanVisuals"
import { Reveal } from "@/components/landing/LandingMotion"
import { Container } from "@/components/shared/Container"
import type { LandingCtaContent, LandingSectionCopy } from "@/types/landing-content"
import type { Job } from "@/types"

export function CTASection({ content, copy, visualCopy, jobs = [] }: { content: LandingCtaContent; copy: LandingSectionCopy["cta"]; visualCopy: LandingSectionCopy["visuals"]; jobs?: Job[] }) {
  return (
    <section className="overflow-hidden bg-[#1f5f9f] py-20 text-white md:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[.88fr_1.12fr] lg:gap-20">
          <Reveal className="min-w-0">
            <LandingEyebrow><span className="text-[#ffd36a]">{copy.eyebrow}</span></LandingEyebrow>
            <h2 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-.065em] text-white md:text-6xl">{content.title}</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75">{content.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={content.primaryButton.href} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ffd36a] px-6 text-sm font-extrabold text-[#171717] shadow-[0_4px_0_rgba(0,0,0,.22)] transition-all hover:-translate-y-0.5 hover:bg-[#ffc955]">{content.primaryButton.label}<ArrowRight className="size-4" /></Link>
              <Link href={content.secondaryButton.href} className="inline-flex h-12 items-center rounded-xl border border-white/35 bg-white/10 px-6 text-sm font-bold text-white transition-colors hover:bg-white/20">{content.secondaryButton.label}</Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative min-w-0 min-h-[350px] sm:min-h-[390px]">
            <div className="absolute left-[8%] top-[15%] h-[70%] border-l-2 border-dashed border-white/60" />
            <div className="absolute left-[4.3%] top-[12%] grid size-12 place-items-center rounded-full border border-white/30 bg-[#ffd36a] text-[#171717]"><Search className="size-5" /></div>
            <div className="absolute bottom-[10%] left-[4.3%] grid size-12 place-items-center rounded-full border border-white/30 bg-[#dceeff] text-[#2479d1]"><CheckCircle2 className="size-5" /></div>
            <div className="absolute left-[18%] top-0 w-[78%] rounded-2xl bg-white px-5 py-3 text-sm font-medium text-[#171717] shadow-[0_8px_0_rgba(0,0,0,.12)]">{copy.prompt}</div>
            <div className="absolute right-[3%] top-[20%] w-[74%] rounded-2xl bg-[#d9eaff] px-5 py-3 text-right text-sm font-medium text-[#1f5f9f] shadow-[0_8px_0_rgba(0,0,0,.12)]">{copy.response}</div>
            <div className="absolute bottom-0 right-[3%] w-[86%] rounded-[26px] border border-white/60 bg-white p-4 shadow-[0_14px_0_rgba(0,0,0,.14)]"><p className="mb-3 text-sm font-extrabold text-[#171717]">{copy.cardTitle}</p><JobPreviewCard job={jobs[0]} index={0} compact copy={visualCopy} /><div className="mt-3"><JobPreviewCard job={jobs[1]} index={1} compact copy={visualCopy} /></div></div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
