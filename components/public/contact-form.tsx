"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"

import { submitContactMessage, type ContactFormState } from "@/app/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState: ContactFormState = { ok: false, message: "" }

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(submitContactMessage, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) {
      toast.success(state.message)
      formRef.current?.reset()
      return
    }
    toast.error(state.message)
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-5 border border-[var(--brand-shell-strong)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama" error={state.fieldErrors?.name}>
          <Input name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" error={state.fieldErrors?.email}>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
      </div>
      <Field label="Subjek" error={state.fieldErrors?.subject}>
        <Input name="subject" required />
      </Field>
      <Field label="Pesan" error={state.fieldErrors?.message}>
        <Textarea name="message" rows={7} required />
      </Field>
      <Button type="submit" disabled={pending} className="h-11 rounded-xl bg-primary px-6 text-white">
        {pending ? "Mengirim..." : "Kirim Pesan"}
      </Button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[var(--brand-ink)]">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}