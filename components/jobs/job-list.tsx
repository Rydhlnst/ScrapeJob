import type { Job, ScrapedJob } from "@/types/job"
import { JobCard } from "./job-card"

type JobListProps = {
  jobs: Array<Job | ScrapedJob>
  adminView?: boolean
}

export function JobList({ jobs, adminView = false }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No jobs found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} adminView={adminView} />
      ))}
    </div>
  )
}
