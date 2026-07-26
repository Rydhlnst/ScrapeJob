"use client"

import { useMemo, useRef } from "react"
import { FaAirbnb } from "@react-icons/all-files/fa/FaAirbnb"
import { FaGoogle } from "@react-icons/all-files/fa/FaGoogle"
import { FaSpotify } from "@react-icons/all-files/fa/FaSpotify"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SiCanva } from "@react-icons/all-files/si/SiCanva"
import { SiFigma } from "@react-icons/all-files/si/SiFigma"
import { SiNotion } from "@react-icons/all-files/si/SiNotion"
import { SiStripe } from "@react-icons/all-files/si/SiStripe"

import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import type { LandingCompanyItem, LandingTrustedCompaniesContent } from "@/types/landing-content"

const companyIcons = {
  airbnb: FaAirbnb,
  canva: SiCanva,
  figma: SiFigma,
  google: FaGoogle,
  notion: SiNotion,
  spotify: FaSpotify,
  stripe: SiStripe,
} as const

type Tier = {
  key: "featured" | "growing" | "partners"
  label: string
  helper: string
  items: LandingCompanyItem[]
}

function splitIntoTiers(items: LandingCompanyItem[]): Tier[] {
  if (items.length === 0) return []
  // Round-robin so each tier gets a fair mix even with short lists.
  const buckets: LandingCompanyItem[][] = [[], [], []]
  items.forEach((item, i) => buckets[i % 3].push(item))
  const labels: Array<{ key: Tier["key"]; label: string; helper: string }> = [
    { key: "featured", label: "Perusahaan Unggulan", helper: "Yang paling dicari kandidat" },
    { key: "growing", label: "Sedang Berkembang", helper: "Tumbuh cepat, banyak lowongan" },
    { key: "partners", label: "Partner Resmi", helper: "Sumber lowongan terverifikasi" },
  ]
  return buckets
    .map((bucket, i) => ({ ...labels[i], items: bucket }))
    .filter((tier) => tier.items.length > 0)
}

function CompanyChip({ company }: { company: LandingCompanyItem }) {
  const Icon = companyIcons[company.id as keyof typeof companyIcons]
  return (
    <div className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-white px-4 text-sm font-semibold text-[var(--brand-ink)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {Icon ? (
        <Icon className="size-4 shrink-0" style={{ color: company.brandColor }} />
      ) : (
        <span
          className="grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: company.brandColor }}
        >
          {company.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {company.name}
    </div>
  )
}

function TierRow({ tier }: { tier: Tier }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.max(240, Math.round(el.clientWidth * 0.7))
    el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" })
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <div className="text-sm font-semibold text-[var(--brand-ink)]">{tier.label}</div>
          <div className="text-xs text-slate-500">{tier.helper}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Geser ${tier.label} ke kiri`}
            onClick={() => scrollBy("left")}
            className="grid size-8 place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:text-[var(--brand-blue)]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Geser ${tier.label} ke kanan`}
            onClick={() => scrollBy("right")}
            className="grid size-8 place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:text-[var(--brand-blue)]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tier.items.map((company) => (
          <div key={`${tier.key}-${company.id}`} className="snap-start">
            <CompanyChip company={company} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrustedCompanies({ content }: { content: LandingTrustedCompaniesContent }) {
  const tiers = useMemo(() => splitIntoTiers(content.items), [content.items])

  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white py-16 md:py-20" id="companies">
      <Container>
        <div className="max-w-3xl">
          <SectionHeader
            title={content.title}
            description="Sumber lowongan yang sudah dikenal — dari perusahaan unggulan sampai partner terverifikasi."
          />
        </div>

        {tiers.length ? (
          <div className="mt-10 grid gap-3">
            {tiers.map((tier) => (
              <TierRow key={tier.key} tier={tier} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            Belum ada perusahaan yang ditampilkan.
          </div>
        )}
      </Container>
    </section>
  )
}
