import { CheckCircle2, SearchCheck, ShieldCheck, Briefcase, Clock, Search, Shield } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import type { LandingBenefitsContent } from "@/types/landing-content"

const benefitVisuals = [
  { icon: Shield, bg: "bg-accent", fg: "text-accent-foreground" },
  { icon: Clock, bg: "bg-muted", fg: "text-muted-foreground" },
  { icon: Search, bg: "bg-accent", fg: "text-accent-foreground" },
  { icon: Briefcase, bg: "bg-muted", fg: "text-muted-foreground" },
]

export function BenefitsSection({ content }: { content: LandingBenefitsContent }) {
  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white py-16 md:py-20" id="features">
      <Container>
        <div className="max-w-4xl">
          <SectionHeader
            title={content.title}
            description="Dirancang supaya pencarian kerjamu lebih cepat dan lebih tenang."
          />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((benefit, index) => {
            const visual = benefitVisuals[index] ?? benefitVisuals[benefitVisuals.length - 1]
            const Icon = visual.icon

            return (
              <div
                key={benefit.title + index}
                className="rounded-[14px] bg-slate-50 p-5"
              >
                <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${visual.bg} ${visual.fg}`}>
                  <Icon className="size-5" />
                </div>
                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {benefit.title}
                  </div>
                  <p className="mt-1.5 text-xs leading-6 text-slate-500">
                    {benefit.description}
                  </p>
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
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-primary hover:bg-muted"
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
