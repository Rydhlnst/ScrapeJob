import Link from "next/link"
import { ArrowUpRight, BriefcaseBusiness, SearchCheck, Sparkles } from "lucide-react"

import { LandingEyebrow } from "@/components/landing/JobkanVisuals"
import { Reveal } from "@/components/landing/LandingMotion"
import { Container } from "@/components/shared/Container"
import type { LandingSectionCopy } from "@/types/landing-content"

const icons = [
  {
    icon: SearchCheck,
    color: "bg-[#dceeff] text-[#2479d1]",
  },
  {
    icon: Sparkles,
    color: "bg-white text-[#2479d1]",
  },
  {
    icon: BriefcaseBusiness,
    color: "bg-[#e8f7ef] text-[#15803d]",
  },
]

export function HowItWorks({ content }: { content: LandingSectionCopy["how"] }) {
  return (
    <section className="relative overflow-hidden bg-[#f6f9fc] py-20 md:py-28" id="how">
      <div className="absolute left-0 top-10 grid grid-cols-5 gap-2 opacity-30">
        {Array.from({ length: 30 }, (_, index) => <span key={index} className="size-1 rounded-full bg-[#2479d1]" />)}
      </div>
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <LandingEyebrow>{content.eyebrow}</LandingEyebrow>
          <h2 className="jobkan-section-title mt-5 text-4xl font-semibold leading-[1.04] tracking-[-.06em] text-[#171717] md:text-6xl">{content.title}</h2>
          <p className="mt-5 text-base leading-7 text-slate-500">{content.description}</p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {content.steps.slice(0, 3).map((step, index) => {
            const design = icons[index] ?? icons[0]
            const Icon = design.icon
            return (
              <Reveal key={step.title} delay={index * 0.08} className="min-w-0">
                <article className="relative rounded-[28px] border border-black/10 bg-white px-7 pb-8 pt-12 text-center shadow-[0_8px_0_rgba(23,23,23,.04)] transition-transform duration-200 hover:-translate-y-1">
                <div className={`absolute -top-7 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-full border-4 border-[#f6f9fc] ${design.color}`}><Icon className="size-6" /></div>
                <h3 className="text-xl font-semibold tracking-[-.04em] text-[#171717]">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-500">{step.description}</p>
                <Link href="/jobs" className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-[#2479d1] underline decoration-[#f2a23a] decoration-2 underline-offset-4 hover:text-[#171717]">{step.linkLabel} <ArrowUpRight className="size-4" /></Link>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
