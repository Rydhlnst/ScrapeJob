"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { ExternalLink, ImageOff, Palette, Save } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateWebsite } from "@/lib/api/websites"
import type { Website } from "@/types/website"

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color.")

const brandingSchema = z.object({
  logo: z.string().trim().max(2048).refine(
    (value) => value === "" || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value),
    "Use an HTTPS/HTTP image URL or an app-relative path starting with /.",
  ),
  primaryColor: colorSchema,
  accentColor: colorSchema,
  inkColor: colorSchema,
  backgroundColor: colorSchema,
})

type BrandingValues = z.infer<typeof brandingSchema>

function colorValue(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

function defaultValues(website: Website): BrandingValues {
  const settings = website.settings ?? {}

  return {
    logo: website.logo ?? "",
    primaryColor: colorValue(settings.primaryColor ?? settings.primary_color, "#1f5f9f"),
    accentColor: colorValue(settings.accentColor ?? settings.accent_color, "#f2a23a"),
    inkColor: colorValue(settings.inkColor ?? settings.ink_color, "#171717"),
    backgroundColor: colorValue(settings.backgroundColor ?? settings.background_color, "#ffffff"),
  }
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          id={`${id}-picker`}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} picker`}
          className="h-9 w-12 shrink-0 cursor-pointer p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hex value`}
          className="h-9 font-mono text-xs uppercase"
        />
      </div>
    </div>
  )
}

export function WebsiteBrandingDialog({
  website,
  onSaved,
}: {
  website: Website
  onSaved: (website: Website) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [logoFailed, setLogoFailed] = React.useState(false)
  const initialValues = React.useMemo(() => defaultValues(website), [website])
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const parsed = brandingSchema.safeParse(value)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Check the branding values.")
        return
      }

      try {
        const updated = await updateWebsite(website.id, {
          logo: parsed.data.logo || null,
          settings: {
            ...(website.settings ?? {}),
            primaryColor: parsed.data.primaryColor,
            accentColor: parsed.data.accentColor,
            inkColor: parsed.data.inkColor,
            backgroundColor: parsed.data.backgroundColor,
          },
        })
        onSaved(updated)
        setOpen(false)
        toast.success(`Branding saved for ${website.name}.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save branding.")
      }
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      form.reset(defaultValues(website))
      setLogoFailed(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Palette className="mr-2 size-3.5" />
          Branding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Website branding</DialogTitle>
          <DialogDescription>
            Changes apply only to <strong>{website.domain}</strong>, including its public navbar, metadata icon, and theme colors.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Subscribe
            selector={(state) => state.values}
            children={(values) => (
              <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-[96px_1fr]">
                <div
                  className="grid size-20 place-items-center overflow-hidden rounded-lg border bg-white"
                  style={{ borderColor: values.primaryColor, backgroundColor: values.backgroundColor }}
                >
                  {values.logo && !logoFailed ? (
                    <img
                      src={values.logo}
                      alt={`${website.name} logo preview`}
                      className="size-full object-contain p-2"
                      onError={() => setLogoFailed(true)}
                    />
                  ) : (
                    <ImageOff className="size-5" style={{ color: values.primaryColor }} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: values.inkColor }}>{website.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{website.domain}</p>
                  <a
                    href={`https://${website.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    style={{ color: values.primaryColor }}
                  >
                    Open public website <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            )}
          />

          <form.Field
            name="logo"
            children={(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={`website-logo-${website.id}`}>Logo URL</Label>
                <Input
                  id={`website-logo-${website.id}`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setLogoFailed(false)
                    field.handleChange(event.target.value)
                  }}
                  placeholder="https://cdn.example.com/logo.svg or /brand/logo.svg"
                />
                <p className="text-xs text-muted-foreground">Use a square or transparent logo for the best navbar and favicon result.</p>
              </div>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="primaryColor" children={(field) => <ColorField id={`primary-color-${website.id}`} label="Primary color" value={field.state.value} onChange={field.handleChange} />} />
            <form.Field name="accentColor" children={(field) => <ColorField id={`accent-color-${website.id}`} label="Accent color" value={field.state.value} onChange={field.handleChange} />} />
            <form.Field name="inkColor" children={(field) => <ColorField id={`ink-color-${website.id}`} label="Text color" value={field.state.value} onChange={field.handleChange} />} />
            <form.Field name="backgroundColor" children={(field) => <ColorField id={`background-color-${website.id}`} label="Background color" value={field.state.value} onChange={field.handleChange} />} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 size-4" />
                  {isSubmitting ? "Saving…" : "Save branding"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
