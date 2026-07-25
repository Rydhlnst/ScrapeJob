"use server"

import { z } from "zod"

import { fetchJson, type ApiEnvelope } from "@/lib/api/client"

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(160),
  subject: z.string().trim().min(3, "Subject is required").max(180),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
})

export type ContactFormState = {
  ok: boolean
  message: string
  fieldErrors?: Partial<Record<keyof z.input<typeof contactSchema>, string>>
}

export async function submitContactMessage(
  _state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  })

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.input<typeof contactSchema>
      fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Please check the form fields.", fieldErrors }
  }

  try {
    await fetchJson<ApiEnvelope<null>>("/api/contact", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    })
    return { ok: true, message: "Message sent. We will contact you soon." }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to send message.",
    }
  }
}