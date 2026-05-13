import { companies } from "@/constants/companies"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

export function TrustedCompanies() {
  return (
    <section className="border-y border-border/70 bg-card py-14 md:py-20" id="companies">
      <Container>
        <SectionHeader
          title="Trusted by teams"
          description="Top brands and fast-growing startups use premium hiring experiences."
          align="center"
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {companies.map((c) => (
            <Card
              key={c.id}
              className="flex items-center justify-center rounded-2xl border-border bg-card p-5 text-sm font-semibold text-foreground shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: c.brandColor }}
                />
                {c.name}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

