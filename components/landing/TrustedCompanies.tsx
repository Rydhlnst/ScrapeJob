"use client"

import { useMemo } from "react"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import type { LandingTrustedCompaniesContent } from "@/types/landing-content"

function CompanyLogo({ name }: { name: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-slate-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {name}
    </div>
  )
}

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{
          width: "max-content",
        }}
      >
        {[...items, ...items, ...items].map((name, index) => (
          <CompanyLogo key={`${name}-${index}`} name={name} />
        ))}
      </div>
    </div>
  )
}

export function TrustedCompanies({ content }: { content: LandingTrustedCompaniesContent }) {
  const companyNames = useMemo(() => {
    return content.items.map((item) => item.name)
  }, [content.items])

  const row1 = companyNames.slice(0, 6)
  const row2 = companyNames.slice(2, 8)
  const row3 = companyNames.slice(4, 10)

  return (
    <section className="border-b border-slate-100 bg-white py-12 md:py-16" id="companies">
      <Container>
        <p className="text-center text-sm font-medium text-slate-400">
          Dipercaya oleh pencari kerja yang melamar ke perusahaan seperti
        </p>

        <div className="mt-8 space-y-4">
          <MarqueeRow items={row1.length > 0 ? row1 : ["Astra Group", "Bank Mandiri", "Telkomsel", "Gojek", "Traveloka", "Unilever ID"]} />
          <MarqueeRow items={row2.length > 0 ? row2 : ["Shopee", "Tokopedia", "BRI", "BCA", " Pertamina", "Indosat"]} reverse />
          <MarqueeRow items={row3.length > 0 ? row3 : ["Grab", "Bukalapak", "Blibli", "TLK", "XL Axiata", "Smartfren"]} />
        </div>
      </Container>
    </section>
  )
}
