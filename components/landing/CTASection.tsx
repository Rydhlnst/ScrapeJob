import Link from "next/link"

import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CTASection() {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <Card
          className="relative overflow-hidden rounded-3xl border-border bg-primary p-10 text-primary-foreground shadow-sm md:p-12"
          id="employers"
        >
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to find your next opportunity?
            </h3>
            <p className="mt-3 text-sm text-primary-foreground/80 md:text-base">
              Start browsing curated jobs from trusted companies and discover
              roles that fit your goals.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-white text-primary hover:bg-white/90">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="rounded-xl bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/#insights">Create Profile</Link>
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl" />
          </div>
        </Card>
      </Container>
    </section>
  )
}
