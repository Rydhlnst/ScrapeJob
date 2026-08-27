"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { AdminJobRecord } from "@/lib/api/admin-jobs"
import {
  deleteAdminJob,
  getAdminJobSiteContent,
  updateAdminJobSiteContent,
  publishAdminJob,
  rejectAdminJob,
  unpublishAdminJob,
  updateAdminJob,
} from "@/lib/api/admin-jobs"
import { listAdminCategories } from "@/lib/api/admin-categories"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Textarea } from "@/components/ui/textarea"
import { sanitizeHtml } from "@/lib/sanitize"
import { jobEditorSchema, jobPublishSchema } from "@/lib/validations/admin/job-editor.schema"
import { revalidateJob } from "@/app/actions/revalidate"
import { ConfirmButton } from "@/components/admin/confirm-button"

type FieldErrors = Partial<Record<
  | "title"
  | "companyName"
  | "location"
  | "jobType"
  | "salaryText"
  | "categoryLabel"
  | "sourceUrl"
  | "seoTitle"
  | "seoDescription"
  | "intro",
  string
>>

function errorLine(message?: string) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function toParagraphs(value: string) {
  return stripHtml(value)
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function paragraphHtml(value: string) {
  if (!value.trim()) return ""
  return `<p>${escapeHtml(value).replace(/\n/g, "<br />")}</p>`
}

function ensureHtml(value?: string | null) {
  if (!value?.trim()) return ""
  return /<[a-z][\s\S]*>/i.test(value) ? value : paragraphHtml(value)
}

function buildDescriptionHtml(values: {
  intro: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  extraParagraphs: string[]
  additionalInfo: string
  sourceContent: string
}) {
  return [
    values.intro,
    values.paragraph1,
    values.paragraph2,
    values.paragraph3,
    ...values.extraParagraphs,
    values.additionalInfo,
    values.sourceContent,
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join("")
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      {children}
    </label>
  )
}

export function JobEditorForm({ job }: { job: AdminJobRecord }) {
  const router = useRouter()
  const editorial = ((job.unified as {
    editorial?: {
      blog?: {
        categoryLabel?: string
        intro?: string
        paragraph1?: string
        paragraph2?: string
        paragraph3?: string
        extraParagraphs?: string[]
        additionalInfo?: string
        sourceContent?: string
        seoTitle?: string
        seoDescription?: string
      }
    }
  } | null)?.editorial?.blog ?? null)
  const descriptionParagraphs = toParagraphs(job.description ?? "")

  const [title, setTitle] = React.useState(job.title)
  const [companyName, setCompanyName] = React.useState(job.companyName)
  const [companyLogo, setCompanyLogo] = React.useState(job.companyLogo ?? "")
  const [location, setLocation] = React.useState(job.location)
  const [jobType, setJobType] = React.useState(job.jobType ?? "")
  const [salaryText, setSalaryText] = React.useState(job.salaryText ?? "")
  const [categoryLabel, setCategoryLabel] = React.useState(editorial?.categoryLabel ?? job.category ?? "")
  const [intro, setIntro] = React.useState(ensureHtml(editorial?.intro ?? descriptionParagraphs[0] ?? ""))
  const [paragraph1, setParagraph1] = React.useState(ensureHtml(editorial?.paragraph1 ?? descriptionParagraphs[1] ?? ""))
  const [paragraph2, setParagraph2] = React.useState(ensureHtml(editorial?.paragraph2 ?? descriptionParagraphs[2] ?? ""))
  const [paragraph3, setParagraph3] = React.useState(ensureHtml(editorial?.paragraph3 ?? descriptionParagraphs[3] ?? ""))
  const [extraParagraphs, setExtraParagraphs] = React.useState<string[]>((editorial?.extraParagraphs ?? descriptionParagraphs.slice(4)).map((item) => ensureHtml(item)))
  const [additionalInfo, setAdditionalInfo] = React.useState(ensureHtml(editorial?.additionalInfo ?? ""))
  const [sourceContent, setSourceContent] = React.useState(ensureHtml(editorial?.sourceContent ?? `<p><strong>Sumber:</strong> ${escapeHtml(job.sourceName)}${job.sourceUrl ? ` - <a href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(job.sourceUrl)}</a>` : ""}</p>`))
  const [sourceUrl, setSourceUrl] = React.useState(job.sourceUrl)
  const [seoTitle, setSeoTitle] = React.useState(editorial?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = React.useState(editorial?.seoDescription ?? "")
  const [requirementsText, setRequirementsText] = React.useState((job.requirements ?? []).join("\n"))
  const [skillsText, setSkillsText] = React.useState((job.skills ?? []).join("\n"))
  const [benefitsText, setBenefitsText] = React.useState((job.benefits ?? []).join("\n"))
  const [status, setStatus] = React.useState(job.status)
  const [isSaving, setIsSaving] = React.useState(false)
  const [busyAction, setBusyAction] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [siteContentReady, setSiteContentReady] = React.useState(false)
  const [siteCategoryId, setSiteCategoryId] = React.useState("")
  const [siteCategories, setSiteCategories] = React.useState<Array<{ id: string; name: string }>>([])
  const initialSourceUrlRef = React.useRef(job.sourceUrl)

  React.useEffect(() => {
    let active = true
    Promise.all([getAdminJobSiteContent(job.id), listAdminCategories()])
      .then(([content, categories]) => {
        if (!active) return
        if (content) {
          setTitle(content.title ?? job.title)
          setSalaryText(content.salaryText ?? job.salaryText ?? "")
          setSiteCategoryId(content.categoryId ?? "")
          if (content.description) {
            setIntro(ensureHtml(content.description))
            setParagraph1("")
            setParagraph2("")
            setParagraph3("")
            setExtraParagraphs([])
            setAdditionalInfo("")
          }
          setSeoTitle(content.seoTitle ?? "")
          setSeoDescription(content.seoDescription ?? "")
          if (content.applyUrl) setSourceUrl(content.applyUrl)
        }
        setSiteCategories(categories)
        setSiteContentReady(true)
      })
      .catch(() => {
        if (active) setSiteContentReady(true)
      })

    return () => {
      active = false
    }
  }, [job.id, job.salaryText, job.title])

  React.useEffect(() => {
    // Regenerate sourceContent when sourceUrl changes so the "Sumber" block
    // matches the URL the admin actually saved (fix for stale initial value).
    if (sourceUrl === initialSourceUrlRef.current) return
    setSourceContent(
      `<p><strong>Sumber:</strong> ${escapeHtml(job.sourceName)}${
        sourceUrl
          ? ` - <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(sourceUrl)}</a>`
          : ""
      }</p>`,
    )
  }, [sourceUrl, job.sourceName])

  function collectValues() {
    return {
      title,
      companyName,
      location,
      jobType,
      salaryText,
      categoryLabel,
      sourceUrl,
      seoTitle,
      seoDescription,
      intro,
      paragraph1,
      paragraph2,
      paragraph3,
      extraParagraphs,
      additionalInfo,
      sourceContent,
      requirementsText,
      skillsText,
      benefitsText,
    }
  }

  function validate(mode: "save" | "publish"): boolean {
    const schema = mode === "publish" ? jobPublishSchema : jobEditorSchema
    const parsed = schema.safeParse(collectValues())
    if (parsed.success) {
      setFieldErrors({})
      return true
    }
    const next: FieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && !(key in next)) {
        next[key as keyof FieldErrors] = issue.message
      }
    }
    setFieldErrors(next)
    toast.error(parsed.error.issues[0]?.message ?? "Form is invalid")
    return false
  }

  const previewHtml = React.useMemo(
    () => buildDescriptionHtml({ intro, paragraph1, paragraph2, paragraph3, extraParagraphs, additionalInfo, sourceContent }),
    [additionalInfo, extraParagraphs, intro, paragraph1, paragraph2, paragraph3, sourceContent],
  )

  async function saveDraft(): Promise<boolean> {
    if (!validate("save")) return false
    setIsSaving(true)

    try {
      const nextUnified = {
        ...(job.unified ?? {}),
        editorial: {
          contentType: "blog",
          blog: {
            categoryLabel,
            intro,
            paragraph1,
            paragraph2,
            paragraph3,
            extraParagraphs,
            additionalInfo,
            sourceContent,
            seoTitle,
            seoDescription,
          },
        },
      }

      // Fase C: description_doc is populated by the Laravel-side backfill
      // command (jobs:backfill-description-doc) — see plan file for the
      // reason we don't dual-write from Next.js (happy-dom's fs.readFileSync
      // of a relative stylesheet asset breaks the webpack server bundle).
      const nextJob = await updateAdminJob(job.id, {
        company_name: companyName,
        company_logo_url: companyLogo.trim() || null,
        location,
        job_type: jobType,
        source_name: stripHtml(sourceContent) || job.sourceName,
        requirements: splitLines(requirementsText),
        skills: splitLines(skillsText),
        benefits: splitLines(benefitsText),
        unified_payload: nextUnified,
        status: status === "published" ? undefined : "draft",
      })
      await updateAdminJobSiteContent(job.id, {
        title,
        description: previewHtml,
        salary_text: salaryText || null,
        apply_url: sourceUrl || null,
        category_id: siteCategoryId || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      })

      setStatus(nextJob.status)
      toast.success("Website job content saved.")
      void revalidateJob(job.slug)
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save job.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function runAction(action: "publish" | "unpublish" | "reject" | "delete") {
    if (action === "publish" && !validate("publish")) return
    setBusyAction(action)

    try {
      if (action === "publish") {
        const saved = await saveDraft()
        if (!saved) return
        const nextJob = await publishAdminJob(job.id)
        setStatus(nextJob.status)
        toast.success("Job published.")
        void revalidateJob(job.slug)
        return
      }

      if (action === "unpublish") {
        const nextJob = await unpublishAdminJob(job.id)
        setStatus(nextJob.status)
        toast.success("Job moved back to draft.")
        void revalidateJob(job.slug)
        return
      }

      if (action === "reject") {
        const nextJob = await rejectAdminJob(job.id)
        setStatus(nextJob.status)
        toast.success("Job rejected.")
        void revalidateJob(job.slug)
        return
      }

      await deleteAdminJob(job.id)
      toast.success("Job deleted.")
      void revalidateJob(job.slug)
      router.push("/admin/jobs")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} job.`)
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border border-border bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</div><div className="mt-3 text-lg font-semibold text-[var(--brand-ink)]">{status}</div></div>
        <div className="border border-border bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Format</div><div className="mt-3 text-lg font-semibold text-[var(--brand-ink)]">Blog article</div></div>
        <div className="border border-border bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Route</div><div className="mt-3 break-all text-sm text-slate-700">/jobs/{job.slug}</div></div>
        <div className="border border-border bg-white p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Public</div><div className="mt-3"><Button asChild variant="outline" className="rounded-lg"><Link href={`/jobs/${job.slug}`} target="_blank">Open page</Link></Button></div></div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-900">
          Website-specific fields below are saved only for the selected website. Master company and source data remain shared.
        </div>
        <Field label="Judul"><Input value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={Boolean(fieldErrors.title)} />{errorLine(fieldErrors.title)}</Field>
        <Field label="Company"><Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} aria-invalid={Boolean(fieldErrors.companyName)} />{errorLine(fieldErrors.companyName)}</Field>
        <Field label="Company logo URL">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogo} alt="" className="size-10 shrink-0 rounded-lg bg-white object-cover ring-1 ring-slate-200" />
            ) : (
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-400">
                LOGO
              </div>
            )}
            <Input
              value={companyLogo}
              onChange={(event) => setCompanyLogo(event.target.value)}
              placeholder="https://…/logo.png"
            />
          </div>
        </Field>
        <Field label="Lokasi"><Input value={location} onChange={(event) => setLocation(event.target.value)} /></Field>
        <Field label="Kategori Blog"><Input value={categoryLabel} onChange={(event) => setCategoryLabel(event.target.value)} placeholder="Technology / Data / Marketing" /></Field>
        <Field label="Website category">
          <select
            value={siteCategoryId}
            onChange={(event) => setSiteCategoryId(event.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Use master category</option>
            {siteCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Employment Type"><Input value={jobType} onChange={(event) => setJobType(event.target.value)} placeholder="Full-time" /></Field>
        <Field label="Salary"><Input value={salaryText} onChange={(event) => setSalaryText(event.target.value)} placeholder="Rp 6jt - Rp 10jt" /></Field>
      </section>

      <section className="space-y-4 border border-border bg-white p-5">
        <div><h2 className="text-base font-semibold text-[var(--brand-ink)]">Body Article</h2><p className="text-sm text-muted-foreground">Bagian isi blog sekarang memakai tiptap editor untuk tiap blok konten.</p></div>
        <Field label="Intro"><RichTextEditor value={intro} onChange={setIntro} /></Field>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Paragraf 1"><RichTextEditor value={paragraph1} onChange={setParagraph1} /></Field><Field label="Paragraf 2"><RichTextEditor value={paragraph2} onChange={setParagraph2} /></Field><Field label="Paragraf 3"><RichTextEditor value={paragraph3} onChange={setParagraph3} /></Field></div>
        <div className="space-y-3"><div className="flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Paragraf lain</div><Button type="button" variant="outline" className="rounded-lg" onClick={() => setExtraParagraphs((current) => [...current, "<p></p>"])}>Add paragraph</Button></div>{extraParagraphs.map((paragraph, index) => (<div key={index} className="space-y-2"><RichTextEditor value={paragraph} onChange={(value) => setExtraParagraphs((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)))} /><div className="flex justify-end"><Button type="button" variant="destructive" className="rounded-lg" onClick={() => setExtraParagraphs((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove</Button></div></div>))}</div>
        <Field label="Tambahan informasi"><RichTextEditor value={additionalInfo} onChange={setAdditionalInfo} /></Field>
        <Field label="Source"><RichTextEditor value={sourceContent} onChange={setSourceContent} /></Field>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Apply URL (website)"><Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} aria-invalid={Boolean(fieldErrors.sourceUrl)} placeholder="https://…" />{errorLine(fieldErrors.sourceUrl)}</Field>
        <Field label="SEO title"><Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /></Field>
        <Field label="SEO description"><Textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} className="min-h-24" /></Field>
        <Field label="Requirements"><Textarea value={requirementsText} onChange={(event) => setRequirementsText(event.target.value)} className="min-h-24 rounded-xl border-blue-200 bg-blue-50/40 focus-visible:border-blue-400 focus-visible:ring-blue-100" placeholder="Satu baris satu item" /></Field>
        <Field label="Skills"><Textarea value={skillsText} onChange={(event) => setSkillsText(event.target.value)} className="min-h-24 rounded-xl border-blue-200 bg-blue-50/40 focus-visible:border-blue-400 focus-visible:ring-blue-100" placeholder="Skills" /></Field>
        <Field label="Benefits"><Textarea value={benefitsText} onChange={(event) => setBenefitsText(event.target.value)} className="min-h-24 rounded-xl border-blue-200 bg-blue-50/40 focus-visible:border-blue-400 focus-visible:ring-blue-100" placeholder="Benefits" /></Field>
      </section>

      <section className="border border-border bg-white p-5">
        <div className="mb-4"><h2 className="text-base font-semibold text-[var(--brand-ink)]">Live preview</h2><p className="text-sm text-muted-foreground">HTML final yang akan tampil di halaman publik lowonganku.com.</p></div>
        <div className="rich-text min-h-48 border border-border bg-slate-50 p-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewHtml) }} />
      </section>

      <Accordion type="single" collapsible>
        <AccordionItem value="raw"><AccordionTrigger>Raw description (readonly)</AccordionTrigger><AccordionContent><div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">{job.rawDescription ? job.rawDescription : <span className="text-slate-500">No raw description.</span>}</div></AccordionContent></AccordionItem>
      </Accordion>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-lg" onClick={saveDraft} disabled={isSaving || !siteContentReady}>{isSaving ? "Saving..." : "Save draft"}</Button>
        <Button type="button" className="rounded-lg" onClick={() => runAction("publish")} disabled={busyAction === "publish" || !siteContentReady}>{busyAction === "publish" ? "Publishing..." : "Publish"}</Button>
        <Button type="button" variant="outline" className="rounded-lg" onClick={() => runAction("unpublish")} disabled={busyAction === "unpublish"}>{busyAction === "unpublish" ? "Moving..." : "Back to draft"}</Button>
        <ConfirmButton
          variant="outline"
          destructive={false}
          disabled={busyAction === "reject"}
          label={busyAction === "reject" ? "Rejecting..." : "Reject"}
          title="Reject this job?"
          description={<>&ldquo;{title || "This job"}&rdquo; will be marked as rejected and hidden from public listings.</>}
          confirmLabel="Reject"
          onConfirm={() => runAction("reject")}
        />
        <ConfirmButton
          disabled={busyAction === "delete"}
          label={busyAction === "delete" ? "Deleting..." : "Delete"}
          title="Delete this job permanently?"
          description={<>&ldquo;{title || "This job"}&rdquo; and its editorial payload will be removed. This cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={() => runAction("delete")}
        />
      </div>
    </div>
  )
}
