import { CheckCircle2, SearchCheck, ShieldCheck } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const benefits = [
  {
    icon: SearchCheck,
    title: "Pencarian lebih fokus",
    description:
      "Cari lowongan dari banyak sumber dengan hasil yang lebih cepat dibaca dan lebih mudah dibandingkan.",
  },
  {
    icon: ShieldCheck,
    title: "Sumber lebih jelas",
    description:
      "Lanjutkan ke sumber resmi lowongan tanpa bingung dengan tampilan yang terlalu ramai atau tidak konsisten.",
  },
  {
    icon: CheckCircle2,
    title: "Filter yang membantu",
    description:
      "Gunakan filter inti seperti kategori, lokasi, dan tipe kerja untuk mempersempit pilihan dengan cepat.",
  },
]

export function BenefitsSection() {
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
            title="A cleaner way to compare jobs from different sources"
            description="The homepage now shows the product experience first, so visitors can search, browse, and evaluate roles immediately."
          />
        </div>

        <div
          className="mt-10 grid gap-px border md:grid-cols-2"
          style={{
            borderColor: "var(--brand-shell-strong)",
            backgroundColor: "var(--brand-shell-strong)",
          }}
        >
          {benefits.map((benefit, index) => (
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
                  <benefit.icon className="size-5" />
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
          ))}
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
              Find relevant roles faster, then continue on the official source.
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/78">
              Use one cleaner browsing experience to narrow the list before opening the full posting.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-12 rounded-none bg-white px-5 text-sm font-medium hover:opacity-90"
                style={{ color: "var(--brand-ink)" }}
              >
                <a href="/jobs">Explore jobs</a>
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
