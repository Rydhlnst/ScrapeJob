"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { Page } from "@/types/page"
import {
  createAdminPage,
  publishAdminPage,
  updateAdminPage,
} from "@/lib/api/pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Textarea } from "@/components/ui/textarea"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  )
}

export function PageEditorForm({ page }: { page?: Page | null }) {
  const router = useRouter()
  const [title, setTitle] = React.useState(page?.title ?? "")
  const [slug, setSlug] = React.useState(page?.slug ?? "")
  const [summary, setSummary] = React.useState(page?.summary ?? "")
  const [content, setContent] = React.useState(page?.content ?? "")
  const [seoTitle, setSeoTitle] = React.useState(page?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = React.useState(page?.seoDescription ?? "")
  const [manualSlug, setManualSlug] = React.useState(Boolean(page?.slug))
  const [isSaving, setIsSaving] = React.useState(false)
  const [isPublishing, setIsPublishing] = React.useState(false)

  React.useEffect(() => {
    if (!manualSlug) {
      setSlug(slugify(title))
    }
  }, [title, manualSlug])

  async function handleSave() {
    setIsSaving(true)

    try {
      const payload = {
        title,
        slug,
        summary,
        content,
        seoTitle,
        seoDescription,
        status: page?.status === "published" ? "published" : "draft",
      } as const

      const nextPage = page
        ? await updateAdminPage(page.id, payload)
        : await createAdminPage(payload)

      toast.success("Page saved.")

      if (!page) {
        router.replace(`/admin/pages/${nextPage.id}/edit`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save page.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)

    try {
      const saved = page
        ? await updateAdminPage(page.id, {
            title,
            slug,
            summary,
            content,
            seoTitle,
            seoDescription,
            status: "draft",
          })
        : await createAdminPage({
            title,
            slug,
            summary,
            content,
            seoTitle,
            seoDescription,
            status: "draft",
          })

      const published = await publishAdminPage(saved.id)
      toast.success("Page published.")

      if (!page) {
        router.replace(`/admin/pages/${published.id}/edit`)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish page.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-border bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</div>
          <div className="mt-3 text-lg font-semibold text-[var(--brand-ink)]">
            {page?.status === "published" ? "Published" : "Draft"}
          </div>
        </div>
        <div className="border border-border bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Route</div>
          <div className="mt-3 break-all text-sm text-slate-700">/page/{slug || "your-slug"}</div>
        </div>
        <div className="border border-border bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Preview</div>
          <div className="mt-3">
            <Button asChild variant="outline" className="rounded-none">
              <Link href={`/page/${slug || ""}`} target="_blank">
                Open public page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Page title">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contact Us" />
        </Field>
        <Field label="Slug">
          <Input
            value={slug}
            onChange={(event) => {
              setManualSlug(true)
              setSlug(slugify(event.target.value))
            }}
            placeholder="contact-us"
          />
        </Field>
      </div>

      <Field label="Summary">
        <Textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Short page summary for listing and SEO support."
        />
      </Field>

      <Field label="Page content">
        <RichTextEditor value={content} onChange={setContent} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title">
          <Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
        </Field>
        <Field label="SEO description">
          <Textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-none" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save draft"}
        </Button>
        <Button type="button" className="rounded-none" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish page"}
        </Button>
      </div>
    </div>
  )
}
