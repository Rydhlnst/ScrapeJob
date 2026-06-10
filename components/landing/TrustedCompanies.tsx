"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FaAirbnb } from "@react-icons/all-files/fa/FaAirbnb"
import { FaGoogle } from "@react-icons/all-files/fa/FaGoogle"
import { FaSpotify } from "@react-icons/all-files/fa/FaSpotify"
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
import { SiCanva } from "@react-icons/all-files/si/SiCanva"
import { SiFigma } from "@react-icons/all-files/si/SiFigma"
import { SiNotion } from "@react-icons/all-files/si/SiNotion"
import { SiStripe } from "@react-icons/all-files/si/SiStripe"

import { companies } from "@/constants/companies"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

const companyIcons = {
  airbnb: FaAirbnb,
  canva: SiCanva,
  figma: SiFigma,
  google: FaGoogle,
  notion: SiNotion,
  spotify: FaSpotify,
  stripe: SiStripe,
} as const

function CompanyChip({
  id,
  name,
  color,
}: {
  id: string
  name: string
  color: string
}) {
  const Icon = companyIcons[id as keyof typeof companyIcons]

  return (
    <Card className="flex h-14 items-center justify-center rounded-none border border-[var(--brand-shell-strong)] bg-white px-6 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3">
        {Icon ? (
          <Icon className="size-5 shrink-0" style={{ color }} />
        ) : (
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-none text-[10px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
        {name}
      </div>
    </Card>
  )
}

export function TrustedCompanies() {
  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  const items = useMemo(() => companies, [])
  const displayItems = useMemo(
    () => (reduceMotion ? items : [...items, ...items]),
    [items, reduceMotion]
  )

  const trackRef = useRef<HTMLDivElement | null>(null)
  const x = useMotionValue(0)

  useEffect(() => {
    if (reduceMotion) return
    if (!trackRef.current) return

    const el = trackRef.current
    const totalWidth = el.scrollWidth
    const half = totalWidth / 2
    if (!half || Number.isNaN(half) || paused) return

    const current = x.get()
    const normalized = current <= -half ? ((current % half) + half) % half : current
    x.set(normalized)

    const controls = animate(x, -half, {
      duration: 28,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    })

    return () => controls.stop()
  }, [displayItems.length, paused, reduceMotion, x])

  return (
    <section className="border-b border-[var(--brand-shell-strong)] bg-white py-16 md:py-20" id="companies">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="max-w-lg">
            <SectionHeader
              title="Companies and sources visitors expect to see on a job platform"
              description="Keep the marketplace feeling credible with recognizable hiring brands and familiar job-source patterns."
            />
          </div>

          <div
            className="overflow-hidden border border-[var(--brand-shell-strong)] bg-[var(--brand-shell)] px-6 py-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          >
            <div className="grid gap-0 md:grid-cols-2">
              <div className="border border-[var(--brand-shell-strong)] bg-white p-8">
                <div className="text-5xl font-semibold tracking-[-0.05em] text-[var(--brand-blue)]">
                  10,000+
                </div>
                <div className="mt-3 text-lg font-medium text-[var(--brand-ink)]">
                  Openings indexed
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:rgba(23,37,84,0.72)]">
                  Browse roles across engineering, product, operations, sales, and support.
                </p>
              </div>
              <div className="border border-[var(--brand-shell-strong)] bg-white p-8">
                <div className="text-5xl font-semibold tracking-[-0.05em] text-[var(--brand-blue)]">
                  200,000+
                </div>
                <div className="mt-3 text-lg font-medium text-[var(--brand-ink)]">
                  Monthly job seekers
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:rgba(23,37,84,0.72)]">
                  Designed for first-time visitors who want to evaluate jobs before committing to a deeper search.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden">
              <motion.div
                ref={trackRef}
                className={
                  reduceMotion
                    ? "flex flex-wrap justify-center gap-3"
                    : "flex gap-3 will-change-transform"
                }
                style={reduceMotion ? undefined : { x, width: "max-content" }}
              >
                {displayItems.map((company, idx) => (
                  <CompanyChip
                    key={reduceMotion ? company.id : `${company.id}-${idx}`}
                    id={company.id}
                    name={company.name}
                    color={company.brandColor}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
