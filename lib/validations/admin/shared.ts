import { z } from "zod"

const HTTP_OR_MAILTO = /^(https?:|mailto:|tel:)/i

export function stripTagsForCheck(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export const htmlNonEmpty = (message = "Cannot be empty") =>
  z
    .string()
    .transform((v) => v ?? "")
    .refine((v) => stripTagsForCheck(v).length > 0, { message })

export const optionalHtml = z.string().optional().default("")

export const safeUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((v) => HTTP_OR_MAILTO.test(v), { message: "URL must use http, https, mailto, or tel" })
  .refine(
    (v) => {
      try {
        // eslint-disable-next-line no-new
        new URL(v)
        return true
      } catch {
        return false
      }
    },
    { message: "URL is not a valid absolute URL" },
  )

export const optionalSafeUrl = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((v) => v === "" || HTTP_OR_MAILTO.test(v), { message: "URL must use http, https, mailto, or tel" })
