import { z } from "zod"

import { htmlNonEmpty, optionalHtml, optionalSafeUrl } from "./shared"

export const jobTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Other",
  "",
])

export const jobEditorSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  location: z.string().trim().max(200).optional().default(""),
  jobType: jobTypeEnum.optional().default(""),
  salaryText: z.string().trim().max(200).optional().default(""),
  categoryLabel: z.string().trim().max(200).optional().default(""),
  sourceUrl: optionalSafeUrl,
  seoTitle: z.string().trim().max(70, "SEO title should be ≤70 chars").optional().default(""),
  seoDescription: z.string().trim().max(160, "SEO description should be ≤160 chars").optional().default(""),
  intro: htmlNonEmpty("Intro paragraph is required"),
  paragraph1: optionalHtml,
  paragraph2: optionalHtml,
  paragraph3: optionalHtml,
  extraParagraphs: z.array(z.string()).optional().default([]),
  additionalInfo: optionalHtml,
  sourceContent: optionalHtml,
  requirementsText: z.string().optional().default(""),
  skillsText: z.string().optional().default(""),
  benefitsText: z.string().optional().default(""),
})

export type JobEditorValues = z.infer<typeof jobEditorSchema>

export const jobPublishSchema = jobEditorSchema.superRefine((v, ctx) => {
  if (!v.sourceUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["sourceUrl"],
      message: "Source URL is required before publishing",
    })
  }
})
