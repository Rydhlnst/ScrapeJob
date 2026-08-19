import { Quote } from "lucide-react"

import { LandingEyebrow } from "@/components/landing/JobkanVisuals"
import { Container } from "@/components/shared/Container"
import type { LandingSectionCopy } from "@/types/landing-content"

export function TestimonialsSection({ content }: { content: LandingSectionCopy["testimonials"] }) {
  const [featured, ...supporting] = content.items

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28" id="about">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <LandingEyebrow>{content.eyebrow}</LandingEyebrow>
          <h2 className="jobkan-section-title mt-5 text-4xl font-extrabold leading-[1.08] tracking-[-.055em] text-[#171717] md:text-6xl">{content.title}</h2>
          <p className="mt-5 text-slate-500">{content.description}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-[.72fr_1.28fr_.72fr] lg:items-center">
          <article className="rounded-[24px] border border-black/10 bg-[#f6f9fc] p-6 text-left"><p className="text-sm leading-6 text-slate-600">“{supporting[0]?.quote}”</p><p className="mt-5 text-sm font-extrabold text-[#171717]">{supporting[0]?.name}</p></article>
          <article className="order-first rounded-[30px] border border-black/10 bg-[#fffdf8] p-8 text-center shadow-[0_10px_0_rgba(23,23,23,.05)] lg:order-none">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#3f95e8] text-white"><Quote className="size-6 fill-current" /></div>
            <p className="mt-6 text-lg leading-8 tracking-[-.02em] text-[#171717] md:text-xl">“{featured?.quote}”</p>
            <p className="mt-6 text-sm font-extrabold text-[#171717]">{featured?.name}</p>
            <p className="mt-1 text-xs text-slate-500">{content.featuredRole}</p>
          </article>
          <article className="rounded-[24px] border border-black/10 bg-[#f6f9fc] p-6 text-left"><p className="text-sm leading-6 text-slate-600">“{supporting[1]?.quote}”</p><p className="mt-5 text-sm font-extrabold text-[#171717]">{supporting[1]?.name}</p></article>
        </div>
      </Container>
    </section>
  )
}
