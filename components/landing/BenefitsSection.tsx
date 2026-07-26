import { CheckCircle2, SearchCheck, ShieldCheck } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import type { LandingBenefitsContent } from "@/types/landing-content"

const benefitVisuals = [
  { icon: SearchCheck, bg: "bg-sky-50", fg: "text-sky-600" },
  { icon: ShieldCheck, bg: "bg-emerald-50", fg: "text-emerald-600" },
  { icon: CheckCircle2, bg: "bg-violet-50", fg: "text-violet-600" },
]

export function BenefitsSection({ content }: { content: LandingBenefitsContent }) {
  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white py-16 md:py-20" id="features">
      <Container>
        <div className="max-w-4xl">
          <SectionHeader
            title={content.title}
            description="Kami bantu proses cari lowongan jadi lebih terarah — dari filter yang relevan sampai sumber yang jelas."
          />
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {content.items.map((benefit, index) => {
            const visual = benefitVisuals[index] ?? benefitVisuals[benefitVisuals.length - 1]
            const Icon = visual.icon

            return (
              <div
                key={benefit.title + index}
                className="rounded-2xl bg-slate-50 p-6 md:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${visual.bg} ${visual.fg}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xl font-semibold tracking-[-0.02em]"
                      style={{ color: "var(--brand-ink)" }}
                    >
                      {benefit.title}
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 grid gap-0 overflow-hidden rounded-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="p-8 text-white md:p-10" style={{ backgroundColor: "var(--brand-blue)" }}>
            <div className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-4xl">
              Temukan lowongan yang tepat, lalu lanjutkan di sumber resminya.
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/80">
              Saring pilihan dengan lebih mudah sebelum membuka postingan lengkap di sumber aslinya.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-12 rounded-xl bg-white px-5 text-sm font-medium hover:opacity-90"
                style={{ color: "var(--brand-ink)" }}
              >
                <a href="/jobs">Jelajahi lowongan</a>
              </Button>
            </div>
          </div>
          <div className="min-h-[320px] bg-slate-50" />
        </div>
      </Container>
    </section>
  )
}
