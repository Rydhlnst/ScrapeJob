"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { cn } from "@/lib/utils"
import type { LandingSectionCopy } from "@/types/landing-content"

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-black/10 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-6 text-left transition-colors hover:text-[#2479d1]"
      >
        <span
          className={cn(
            "text-lg font-semibold leading-[1.45] transition-colors",
            isOpen ? "text-[#171717]" : "text-slate-600",
          )}
        >
          {question}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 transition-all duration-300",
            isOpen ? "rotate-180 text-[#2479d1]" : "text-slate-400",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-5" : "max-h-0",
        )}
      >
        <p className="max-w-3xl text-base leading-[1.75] text-slate-500">{answer}</p>
      </div>
    </div>
  )
}

export function FAQSection({ content }: { content: LandingSectionCopy["faq"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="w-full max-w-none bg-white py-16 md:py-24" id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.35fr] lg:gap-24">
          {/* Left: Heading */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2479d1] shadow-[0_3px_0_rgba(23,23,23,.04)]">
              <Sparkles className="size-3.5" />
              {content.eyebrow}
            </div>
            <h2 className="jobkan-section-title mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-[-0.05em] text-[#171717] md:text-6xl">
              {content.title}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-[1.8] text-slate-500">
              {content.description}
            </p>

            {/* Contact CTA */}
            <div className="mt-12">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-base font-semibold text-[#3f95e8] underline-offset-4 transition-all hover:underline"
              >
                {content.contactLabel}
              </a>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="divide-y divide-black/10 border-y border-black/10 px-1 lg:px-0">
            {content.items.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
