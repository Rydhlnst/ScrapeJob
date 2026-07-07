import Link from "next/link"

import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import type { LandingCtaContent } from "@/types/landing-content"

export function CTASection({ content }: { content: LandingCtaContent }) {
  return (
    <section
      className="py-16 text-white md:py-20"
      style={{ backgroundColor: "var(--brand-blue)" }}
    >
      <Container>
        <div className="grid gap-8 border border-white bg-white p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" id="employers">
          <div className="max-w-4xl">
            <div className="text-4xl font-semibold leading-[1] tracking-[-0.04em] md:text-6xl">
              {content.title}
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
              {content.body}
            </p>
          </div>

          <div className="flex flex-wrap justify-start gap-3 lg:justify-end">
            <Button
              asChild
              className="h-11 rounded-none bg-white px-5 text-sm font-semibold text-[var(--brand-ink)] hover:opacity-90"
            >
              <Link href={content.primaryButton.href}>{content.primaryButton.label}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-none border-white bg-white px-5 text-sm font-semibold text-white hover:bg-white"
            >
              <Link href={content.secondaryButton.href}>{content.secondaryButton.label}</Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 text-xs text-white/72">
          (c) {new Date().getFullYear()} Lowonganku. All rights reserved.
        </div>
      </Container>
    </section>
  )
}

