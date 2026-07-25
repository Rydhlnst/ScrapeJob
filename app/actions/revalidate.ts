"use server"

import { revalidatePath } from "next/cache"

export async function revalidateJob(slug: string): Promise<void> {
  if (slug) revalidatePath(`/jobs/${slug}`)
  revalidatePath("/jobs")
}

export async function revalidatePage(slug: string): Promise<void> {
  if (slug) revalidatePath(`/page/${slug}`)
}
