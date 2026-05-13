import { FileText, Search, UserRound } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

const steps = [
  {
    step: "01",
    icon: UserRound,
    title: "Create your profile",
    description:
      "Add your skills, role preferences, and salary target so your search feels relevant from day one.",
  },
  {
    step: "02",
    icon: Search,
    title: "Discover curated jobs",
    description:
      "Use clean filters and smart sorting to find the right roles faster without scrolling endlessly.",
  },
  {
    step: "03",
    icon: FileText,
    title: "Apply faster",
    description:
      "Save roles, track what you like, and apply with confidence using clean job summaries.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-14 md:py-20" id="insights">
      <Container>
        <SectionHeader
          title="How it works"
          description="A premium flow that helps you go from search to shortlist in minutes."
          align="center"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card
              key={s.step}
              className="rounded-2xl border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-[hsl(var(--primary-soft))] text-primary ring-1 ring-border/70">
                  <s.icon className="size-5" />
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {s.step}
                </div>
              </div>
              <div className="mt-4 text-base font-semibold text-foreground">
                {s.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
