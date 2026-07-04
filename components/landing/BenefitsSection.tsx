import { CheckCircle2, SearchCheck, ShieldCheck } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LandingBenefitsContent } from "@/types/landing-content"

const benefitIcons = [SearchCheck, ShieldCheck, CheckCircle2]

export function BenefitsSection({ content }: { content: LandingBenefitsContent }) {
  return (
    <section
      className="border-b py-16 md:py-20"
      id="features"
      style={{
        borderColor: "var(--brand-shell-strong)",
        backgroundColor: "var(--brand-shell)",
      }}
    >
      <Container>
        <div className="max-w-4xl">
          <SectionHeader
            title={content.title}
            description="Temukan lowongan yang relevan dengan cepat dan mudah melalui satu platform terpusat."
          />
        </div>

        <div
          className="mt-10 grid gap-px border md:grid-cols-2"
          style={{
            borderColor: "var(--brand-shell-strong)",
            backgroundColor: "var(--brand-shell-strong)",
          }}
        >
          {content.items.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? CheckCircle2

            return (
              <Card
                key={benefit.title + index}
                className="rounded-none border-0 bg-white p-8 shadow-none"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="grid size-12 place-items-center border"
                    style={{
                      borderColor: "var(--brand-shell-strong)",
                      backgroundColor: "var(--brand-shell)",
                      color: "var(--brand-blue)",
                    }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-[1.75rem] font-medium tracking-[-0.04em]"
                      style={{ color: "var(--brand-ink)" }}
                    >
                      {benefit.title}
                    </div>
                    <p
                      className="mt-3 max-w-xl text-sm leading-7"
                      style={{ color: "rgba(23,37,84,0.72)" }}
                    >
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div
          className="mt-10 grid gap-0 overflow-hidden border lg:grid-cols-[0.95fr_1.05fr]"
          style={{ borderColor: "var(--brand-shell-strong)" }}
        >
          <div
            className="p-8 text-white md:p-10"
            style={{ backgroundColor: "var(--brand-blue)" }}
          >
            <div className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.05em]">
              Temukan lowongan yang tepat, lalu lanjutkan di sumber resminya.
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/78">
              Saring pilihan dengan lebih mudah sebelum membuka postingan lengkap di sumber aslinya.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-12 rounded-none bg-white px-5 text-sm font-medium hover:opacity-90"
                style={{ color: "var(--brand-ink)" }}
              >
                <a href="/jobs">Jelajahi lowongan</a>
              </Button>
            </div>
          </div>
          <div
            className="min-h-[320px] border-t lg:border-l lg:border-t-0"
            style={{
              borderColor: "var(--brand-shell-strong)",
              backgroundColor: "#ffffff",
            }}
          />
        </div>
      </Container>
    </section>
  )
}
