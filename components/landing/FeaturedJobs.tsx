"use client"

import { useMemo, useState } from "react"

import { motion, useReducedMotion } from "framer-motion"

import { jobs } from "@/constants/jobs"
import { Container } from "@/components/shared/Container"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { JobCard } from "@/components/jobs/JobCard"

export function FeaturedJobs() {
  const reduceMotion = useReducedMotion()
  const featured = useMemo(() => jobs.slice(0, 6), [])
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            title="Featured jobs"
            description="Handpicked roles with transparent salary and clean details."
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: reduceMotion
                ? undefined
                : { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {featured.map((job) => (
            <motion.div
              key={job.id}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <JobCard
                job={job}
                saved={Boolean(savedIds[job.id])}
                onToggleSaved={(id) =>
                  setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }))
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
