"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AdminEditorSectionCard } from "@/components/admin/admin-editor-section-card"
import { AdminSectionHeader } from "@/components/admin/admin-section-header"
import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  publishAdminLandingPageDraft,
  saveAdminLandingPageDraft,
} from "@/lib/api/landing-page-content"
import { resolveAdminLandingEditorContent } from "@/lib/landing-page-content"
import { cn } from "@/lib/utils"
import { landingPageContentSchema, landingPageSectionsSchema } from "@/types/landing-content"
import type {
  AdminLandingPageContentRecord,
  LandingBenefitItem,
  LandingCompanyItem,
  LandingLink,
  LandingPageContent,
} from "@/types/landing-content"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      {children}
    </label>
  )
}

function setLinkValue(links: LandingLink[], index: number, key: keyof LandingLink, value: string) {
  return links.map((link, currentIndex) => (currentIndex === index ? { ...link, [key]: value } : link))
}

function setBenefitValue(items: LandingBenefitItem[], index: number, key: keyof LandingBenefitItem, value: string) {
  return items.map((item, currentIndex) => (currentIndex === index ? { ...item, [key]: value } : item))
}

function setCompanyValue(items: LandingCompanyItem[], index: number, key: keyof LandingCompanyItem, value: string) {
  return items.map((item, currentIndex) => (currentIndex === index ? { ...item, [key]: value } : item))
}

const sections = [
  { value: "hero", label: "Hero", description: "Headline, CTA, quick links" },
  { value: "featured", label: "Featured Jobs", description: "Rule dan copy listing unggulan" },
  { value: "benefits", label: "Benefit", description: "Benefit cards landing page" },
  { value: "companies", label: "Perusahaan Terpercaya", description: "Strip logo dan brand color" },
  { value: "cta", label: "CTA", description: "Penutup dan call to action" },
  { value: "sections", label: "Section Copy", description: "Visual labels, how-it-works, categories, testimonials, FAQ, and footer" },
] as const

export function LandingContentEditor({ initialRecord }: { initialRecord: AdminLandingPageContentRecord }) {
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get("tab")
  const activeTab = useMemo(
    () => (sections.some((section) => section.value === requestedTab) ? (requestedTab as typeof sections[number]["value"]) : "hero"),
    [requestedTab],
  )

  const [record, setRecord] = useState(initialRecord)
  const [draft, setDraft] = useState<LandingPageContent>(resolveAdminLandingEditorContent(initialRecord))
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [sectionsJson, setSectionsJson] = useState(() => JSON.stringify(resolveAdminLandingEditorContent(initialRecord).sections, null, 2))
  const [sectionsError, setSectionsError] = useState<string | null>(null)

  async function handleSave() {
    const validation = landingPageContentSchema.safeParse(draft)
    if (sectionsError || !validation.success) {
      toast.error("Fix the Section Copy JSON before saving.")
      return
    }
    setIsSaving(true)
    try {
      const nextRecord = await saveAdminLandingPageDraft(draft)
      setRecord(nextRecord)
      const nextDraft = resolveAdminLandingEditorContent(nextRecord)
      setDraft(nextDraft)
      setSectionsJson(JSON.stringify(nextDraft.sections, null, 2))
      toast.success("Landing content draft saved.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    const validation = landingPageContentSchema.safeParse(draft)
    if (sectionsError || !validation.success) {
      toast.error("Fix the Section Copy JSON before publishing.")
      return
    }
    setIsPublishing(true)
    try {
      const nextRecord = await publishAdminLandingPageDraft()
      setRecord(nextRecord)
      const nextDraft = resolveAdminLandingEditorContent(nextRecord)
      setDraft(nextDraft)
      setSectionsJson(JSON.stringify(nextDraft.sections, null, 2))
      toast.success("Landing content published.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish content.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Landing CMS"
        title="Edit landing page sections"
        description="Choose a landing-page section, edit its content, then save the draft or publish it when ready."
        actions={
          <>
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={record.status} />
              {record.updatedAt ? <div className="text-xs text-muted-foreground">Updated {new Date(record.updatedAt).toLocaleString("id-ID")}</div> : null}
            </div>
            <Button type="button" variant="outline" className="rounded-lg" onClick={handleSave} disabled={isSaving || Boolean(sectionsError)}>{isSaving ? "Saving..." : "Save draft"}</Button>
            <Button type="button" className="rounded-lg" onClick={handlePublish} disabled={isPublishing || Boolean(sectionsError)}>{isPublishing ? "Publishing..." : "Publish changes"}</Button>
          </>
        }
      />

      <nav aria-label="Landing CMS sections" className="overflow-x-auto border border-[var(--brand-shell-strong)] bg-white p-2 shadow-[var(--shadow-sm)]">
        <div className="flex min-w-max gap-2">
          {sections.map((section) => {
            const isActive = activeTab === section.value

            return (
              <Link
                key={section.value}
                href={`/admin/content?tab=${section.value}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "min-w-40 border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]",
                  isActive
                    ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white"
                    : "border-[var(--brand-shell-strong)] bg-white text-[var(--brand-ink)] hover:border-[var(--brand-blue)] hover:bg-[var(--brand-shell)]",
                )}
              >
                <span className="block text-sm font-semibold">{section.label}</span>
                <span className={cn("mt-1 block text-xs leading-5", isActive ? "text-white/80" : "text-slate-500")}>
                  {section.description}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="min-w-0 space-y-4">
          {activeTab === "hero" ? (<AdminEditorSectionCard title="Hero" description="Main headline, supporting copy, primary actions, and quick links."><div className="grid gap-4"><Field label="Title"><Textarea value={draft.hero.title} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} /></Field><Field label="Description"><Textarea value={draft.hero.description} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, description: event.target.value } }))} /></Field></div><div className="grid gap-4"><Field label="Primary CTA Label"><Input value={draft.hero.primaryCta.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, label: event.target.value } } }))} /></Field><Field label="Primary CTA Link"><Input value={draft.hero.primaryCta.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, href: event.target.value } } }))} /></Field><Field label="Secondary CTA Label"><Input value={draft.hero.secondaryCta.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, label: event.target.value } } }))} /></Field><Field label="Secondary CTA Link"><Input value={draft.hero.secondaryCta.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, href: event.target.value } } }))} /></Field></div><div className="grid gap-4">{draft.hero.quickLinks.map((link, index) => (<div key={`${link.label}-${index}`} className="grid gap-4"><Field label={`Quick Link ${index + 1} Label`}><Input value={link.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, quickLinks: setLinkValue(current.hero.quickLinks, index, "label", event.target.value) } }))} /></Field><Field label={`Quick Link ${index + 1} Link`}><Input value={link.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, quickLinks: setLinkValue(current.hero.quickLinks, index, "href", event.target.value) } }))} /></Field></div>))}</div></AdminEditorSectionCard>) : null}
          {activeTab === "featured" ? (<AdminEditorSectionCard title="Featured jobs" description="Section copy plus query rules for the jobs pulled into the homepage."><div className="grid gap-4"><Field label="Title"><Textarea value={draft.featuredJobs.title} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, title: event.target.value } }))} /></Field><Field label="Description"><Textarea value={draft.featuredJobs.description} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, description: event.target.value } }))} /></Field><Field label="Empty state"><Textarea value={draft.featuredJobs.emptyState} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, emptyState: event.target.value } }))} /></Field><Field label="Sort"><Input value={draft.featuredJobs.rules.sort} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, sort: event.target.value as LandingPageContent["featuredJobs"]["rules"]["sort"] } } }))} /></Field><Field label="Limit"><Input type="number" value={draft.featuredJobs.rules.limit} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, limit: Number(event.target.value) || 1 } } }))} /></Field></div></AdminEditorSectionCard>) : null}
          {activeTab === "benefits" ? (<AdminEditorSectionCard title="Benefits" description="Structured benefits cards shown after the featured jobs section."><Field label="Section title"><Input value={draft.benefits.title} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, title: event.target.value } }))} /></Field><div className="grid gap-4">{draft.benefits.items.map((item, index) => (<div key={`${item.title}-${index}`} className="grid gap-4"><Field label={`Benefit ${index + 1} title`}><Input value={item.title} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, items: setBenefitValue(current.benefits.items, index, "title", event.target.value) } }))} /></Field><Field label={`Benefit ${index + 1} description`}><Textarea value={item.description} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, items: setBenefitValue(current.benefits.items, index, "description", event.target.value) } }))} /></Field></div>))}</div></AdminEditorSectionCard>) : null}
          {activeTab === "companies" ? (<AdminEditorSectionCard title="Trusted companies" description="Structured company strip for the credibility section."><Field label="Section title"><Input value={draft.trustedCompanies.title} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, title: event.target.value } }))} /></Field><div className="grid gap-4">{draft.trustedCompanies.items.map((item, index) => (<div key={`${item.id}-${index}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label={`Company ${index + 1} ID`}><Input value={item.id} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "id", event.target.value) } }))} /></Field><Field label={`Company ${index + 1} Name`}><Input value={item.name} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "name", event.target.value) } }))} /></Field><Field label={`Company ${index + 1} URL`}><Input value={item.url} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "url", event.target.value) } }))} /></Field><Field label={`Company ${index + 1} Color`}><Input value={item.brandColor} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "brandColor", event.target.value) } }))} /></Field></div>))}</div></AdminEditorSectionCard>) : null}
          {activeTab === "cta" ? (<AdminEditorSectionCard title="CTA" description="Closing call-to-action that anchors the bottom of the landing page."><div className="grid gap-4"><Field label="Title"><Textarea value={draft.cta.title} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, title: event.target.value } }))} /></Field><Field label="Body"><Textarea value={draft.cta.body} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, body: event.target.value } }))} /></Field><Field label="Primary button label"><Input value={draft.cta.primaryButton.label} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, primaryButton: { ...current.cta.primaryButton, label: event.target.value } } }))} /></Field><Field label="Primary button link"><Input value={draft.cta.primaryButton.href} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, primaryButton: { ...current.cta.primaryButton, href: event.target.value } } }))} /></Field></div></AdminEditorSectionCard>) : null}
          {activeTab === "sections" ? (<AdminEditorSectionCard title="Section copy" description="All remaining visible homepage text, including the hero artwork labels. Edit this structured content, save the draft, then publish."><Field label="Homepage section content (JSON schema validated)"><Textarea className="min-h-[680px] font-mono text-xs leading-5" value={sectionsJson} onChange={(event) => { const value = event.target.value; setSectionsJson(value); try { const parsed = JSON.parse(value); const validation = landingPageSectionsSchema.safeParse(parsed); if (!validation.success) { setSectionsError(validation.error.issues[0]?.message ?? "Section copy does not match the landing schema."); return } setDraft((current) => ({ ...current, sections: validation.data })); setSectionsError(null) } catch { setSectionsError("JSON is not valid yet. Fix it before saving.") } }} /></Field>{sectionsError ? <p className="text-sm text-destructive">{sectionsError}</p> : null}</AdminEditorSectionCard>) : null}
      </div>
    </div>
  )
}
