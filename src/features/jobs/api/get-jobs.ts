import { getPublicJobs } from "@/lib/api/jobs"

export async function getJobs() {
  return getPublicJobs()
}
