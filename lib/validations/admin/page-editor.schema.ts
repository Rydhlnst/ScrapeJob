import { z } from "zod"

import { htmlNonEmpty, optionalHtml } from "./shared"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const pageEditorSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugRegex, "Use lowercase letters, numbers, dashes only"),
  summary: z.string().trim().max(500).optional().default(""),
  content: optionalHtml,
  seoTitle: z.string().trim().max(70, "SEO title should be ≤70 chars").optional().default(""),
  seoDescription: z.string().trim().max(160, "SEO description should be ≤160 chars").optional().default(""),
})

export type PageEditorValues = z.infer<typeof pageEditorSchema>

export const pagePublishSchema = pageEditorSchema.extend({
  content: htmlNonEmpty("Content is required before publishing"),
})
