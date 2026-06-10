import Link from "next/link"

import { Container } from "@/components/shared/Container"

export function CTASection() {
  return (
    <section
      className="py-16 text-white md:py-20"
      style={{ backgroundColor: "var(--brand-blue)" }}
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" id="employers">
          <div>
            <div className="max-w-4xl text-6xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-7xl">
              Find Work.
              <br />
              Share Work.
              <br />
              All in One Place.
            </div>
            <div className="mt-12 text-xs text-white/72">
              (c) {new Date().getFullYear()} Lowonganku. All rights reserved.
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--brand-yellow)" }}
              >
                Product
              </div>
              <div className="space-y-3 text-sm text-white/88">
                <Link href="/#about">About us</Link>
                <Link href="/jobs">Services</Link>
                <Link href="/#employers">Contact</Link>
                <Link href="/#features">Question?</Link>
              </div>
            </div>
            <div className="space-y-4">
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--brand-yellow)" }}
              >
                Company
              </div>
              <div className="space-y-3 text-sm text-white/88">
                <Link href="/#categories">Partners</Link>
                <Link href="/#jobs">Customers</Link>
                <Link href="/#how">Brand</Link>
              </div>
            </div>
            <div className="space-y-4">
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--brand-yellow)" }}
              >
                Resources
              </div>
              <div className="space-y-3 text-sm text-white/88">
                <Link href="/jobs">Community</Link>
                <Link href="/#employers">Contact</Link>
                <Link href="/#features">Terms of service</Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
