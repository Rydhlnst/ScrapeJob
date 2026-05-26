import { getPublicJobDetail } from "@/lib/api/jobs"

export async function getJobDetail(slug: string) {
  return getPublicJobDetail(slug)
}
