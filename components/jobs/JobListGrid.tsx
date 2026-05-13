"use client"

import { motion, useReducedMotion } from "framer-motion"

import type { JobListing } from "@/constants/jobs"
import { JobCard } from "@/components/jobs/JobCard"

export function JobListGrid({
  jobs,
  view,
  savedIds,
  onToggleSaved,
}: {
  jobs: JobListing[]
  view: "grid" | "list"
  savedIds: Record<string, boolean>
  onToggleSaved: (id: string) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: reduceMotion ? undefined : { staggerChildren: 0.04 },
        },
      }}
      className={
        view === "list"
          ? "grid gap-4"
          : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {jobs.map((job) => (
        <motion.div
          key={job.id}
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <JobCard
            job={job}
            view={view}
            saved={Boolean(savedIds[job.id])}
            onToggleSaved={onToggleSaved}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

