import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { categories } from "@/constants/categories"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

export function PopularCategories() {
  return (
    <section className="border-y border-border/70 bg-card py-14 md:py-20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader
            title="Popular categories"
            description="Explore roles by specialization. Clean, focused, and easy to scan."
          />
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-[hsl(var(--primary-soft))]"
          >
            Browse all jobs <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="group rounded-2xl border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 place-items-center rounded-2xl bg-[hsl(var(--primary-soft))] text-primary ring-1 ring-border/70">
                  <cat.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold text-foreground">
                    {cat.title}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {cat.jobsCount.toLocaleString()} jobs
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

