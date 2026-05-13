import { CheckCircle2, Sparkles, Wand2 } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const benefits = [
  {
    icon: Sparkles,
    title: "Smart Job Matching",
    description:
      "Get recommended jobs based on your skills, interests, and career goals—so you spend less time searching.",
  },
  {
    icon: Wand2,
    title: "Resume Optimization",
    description:
      "Improve your resume so it matches job descriptions more effectively and stands out to recruiters.",
  },
  {
    icon: CheckCircle2,
    title: "Interview Preparation",
    description:
      "Prepare better with practice questions and feedback to build confidence before interviews.",
  },
]

export function BenefitsSection() {
  return (
    <section className="border-y border-border/70 bg-card py-14 md:py-20" id="features">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            title="Why Choose Our Job Platform?"
            description="Find better opportunities faster with smart matching, resume optimization, and career insights."
          />
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted p-1">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-full bg-card px-4 text-foreground shadow-sm"
            >
              For Job Seekers
            </Button>
            <Button type="button" variant="ghost" className="h-9 rounded-full px-4">
              For Companies
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-stretch">
          <div className="space-y-4">
            {benefits.map((b) => (
              <Card
                key={b.title}
                className="rounded-3xl border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-11 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--dark))] shadow-sm">
                    <b.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold tracking-tight text-foreground">
                      {b.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {b.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="relative overflow-hidden rounded-[32px] border-border bg-[hsl(var(--primary))] p-8 text-white shadow-sm">
            <div className="absolute inset-0">
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[hsl(var(--accent))]/35 blur-2xl" />
              <div className="absolute -left-24 -bottom-24 size-80 rounded-full bg-black/20 blur-2xl" />
            </div>
            <div className="relative space-y-4">
              <div className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                Benefits
              </div>
              <div className="text-3xl font-semibold tracking-tight">
                Choose Lowongaku for Job Search
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/75">
                A simple, elegant interface that makes job discovery feel fast,
                focused, and trustworthy—powered by tailored recommendations.
              </p>
              <div className="pt-2">
                <Button className="rounded-2xl bg-white text-black hover:bg-white/90">
                  Get Started Now
                </Button>
              </div>
              <div className="pt-4 text-xs text-white/60">Lowongaku</div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  )
}
