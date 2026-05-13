"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"

import { companies } from "@/constants/companies"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { Card } from "@/components/ui/card"

function CompanyChip({
  name,
  color,
}: {
  name: string
  color: string
}) {
  return (
    <Card className="flex h-14 items-center justify-center rounded-2xl border-border bg-card px-6 text-sm font-semibold text-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        {name}
      </div>
    </Card>
  )
}

export function TrustedCompanies() {
  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  const items = useMemo(() => companies, [])
  const loopItems = useMemo(() => [...items, ...items], [items])

  const trackRef = useRef<HTMLDivElement | null>(null)
  const x = useMotionValue(0)

  useEffect(() => {
    if (reduceMotion) return
    if (!trackRef.current) return

    const el = trackRef.current
    const totalWidth = el.scrollWidth
    const half = totalWidth / 2
    if (!half || Number.isNaN(half)) return

    if (paused) return

    const current = x.get()
    const normalized =
      current <= -half ? ((current % half) + half) % half : current
    x.set(normalized)

    const controls = animate(x, -half, {
      duration: 28,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    })

    return () => controls.stop()
  }, [paused, reduceMotion, x, loopItems.length])

  return (
    <section className="border-y border-border/70 bg-card py-14 md:py-20" id="companies">
      <Container>
        <SectionHeader
          title="Trusted by growing teams"
          description="Top brands and fast-growing startups use premium hiring experiences."
          align="center"
        />

        <div
          className="relative mt-10 overflow-hidden rounded-3xl border border-border bg-background/40 px-6 py-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent" />

          {reduceMotion ? (
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((c) => (
                <CompanyChip key={c.id} name={c.name} color={c.brandColor} />
              ))}
            </div>
          ) : (
            <motion.div
              ref={trackRef}
              className="flex gap-3 will-change-transform"
              style={{ x, width: "max-content" }}
            >
              {loopItems.map((c, idx) => (
                <CompanyChip
                  key={`${c.id}-${idx}`}
                  name={c.name}
                  color={c.brandColor}
                />
              ))}
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  )
}
