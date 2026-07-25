import { z } from "zod"

import { htmlNonEmpty } from "./shared"

export const draftReviewSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  location: z.string().trim().max(200).optional().default(""),
  description: htmlNonEmpty("Description cannot be empty"),
})

export type DraftReviewValues = z.infer<typeof draftReviewSchema>
