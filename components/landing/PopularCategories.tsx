import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Category } from "@/types"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

export function PopularCategories({ categories }: { categories: Category[] }) {
  return (
    <section
      className="border-b bg-white py-16 md:py-20"
      id="categories"
      style={{ borderColor: "var(--brand-shell-strong)" }}
    >
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader
            title="Explore categories after you browse live openings"
            description="Jump into the roles people usually search first, from software and design to operations and customer teams."
          />
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 border bg-white px-4 py-3 text-sm font-medium hover:opacity-90"
            style={{
              borderColor: "var(--brand-shell-strong)",
              color: "var(--brand-ink)",
            }}
          >
            Browse all jobs <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <Card
              key={cat.id}
              className="group rounded-none border bg-white p-5 shadow-none transition-colors duration-200"
              style={{ borderColor: "var(--brand-shell-strong)" }}
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
                  <span className="text-sm font-semibold">
                    {cat.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div
                    className="text-base font-semibold"
                    style={{ color: "var(--brand-ink)" }}
                  >
                    {cat.name}
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: "rgba(23,37,84,0.68)" }}
                  >
                    {cat.totalJobs ? `${cat.totalJobs} jobs` : "Browse roles"}
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
