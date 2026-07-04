"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"

import { AdminEditorSectionCard } from "@/components/admin/admin-editor-section-card"
import { AdminSectionHeader } from "@/components/admin/admin-section-header"
import { AdminStatusBadge } from "@/components/admin/admin-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  publishAdminLandingPageDraft,
  saveAdminLandingPageDraft,
} from "@/lib/api/landing-page-content"
import { resolveAdminLandingEditorContent } from "@/lib/landing-page-content"
import type {
  AdminLandingPageContentRecord,
  LandingBenefitItem,
  LandingCompanyItem,
  LandingLink,
  LandingPageContent,
} from "@/types/landing-content"

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
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

function setLinkValue(
  links: LandingLink[],
  index: number,
  key: keyof LandingLink,
  value: string,
) {
  return links.map((link, currentIndex) =>
    currentIndex === index ? { ...link, [key]: value } : link,
  )
}

function setBenefitValue(
  items: LandingBenefitItem[],
  index: number,
  key: keyof LandingBenefitItem,
  value: string,
) {
  return items.map((item, currentIndex) =>
    currentIndex === index ? { ...item, [key]: value } : item,
  )
}

function setCompanyValue(
  items: LandingCompanyItem[],
  index: number,
  key: keyof LandingCompanyItem,
  value: string,
) {
  return items.map((item, currentIndex) =>
    currentIndex === index ? { ...item, [key]: value } : item,
  )
}

export function LandingContentEditor({
  initialRecord,
}: {
  initialRecord: AdminLandingPageContentRecord
}) {
  const [record, setRecord] = useState(initialRecord)
  const [draft, setDraft] = useState<LandingPageContent>(
    resolveAdminLandingEditorContent(initialRecord),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      const nextRecord = await saveAdminLandingPageDraft(draft)
      setRecord(nextRecord)
      setDraft(resolveAdminLandingEditorContent(nextRecord))
      toast.success("Landing content draft saved.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      const nextRecord = await publishAdminLandingPageDraft()
      setRecord(nextRecord)
      setDraft(resolveAdminLandingEditorContent(nextRecord))
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
        description="Kelola copy, CTA, featured jobs rules, dan company strip tanpa mengubah layout publik."
        actions={
          <>
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={record.status} />
              {record.updatedAt ? (
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(record.updatedAt).toLocaleString("id-ID")}
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              className="rounded-none"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish changes"}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <div className="border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</div>
          <div className="mt-3"><AdminStatusBadge status={record.status} /></div>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Quick links</div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">{draft.hero.quickLinks.length}</div>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Featured jobs</div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">{draft.featuredJobs.rules.limit}</div>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Benefits</div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">{draft.benefits.items.length}</div>
        </div>
        <div className="border border-[var(--brand-shell-strong)] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Trusted companies</div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">{draft.trustedCompanies.items.length}</div>
        </div>
      </section>

      <Tabs defaultValue="hero" className="space-y-4">
        <div className="overflow-x-auto border border-[var(--brand-shell-strong)] bg-white shadow-[var(--shadow-sm)]">
          <TabsList className="h-auto min-w-max gap-2 rounded-none bg-transparent p-2">
            <TabsTrigger value="hero" className="h-11 flex-none rounded-none border border-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] data-active:border-[var(--brand-shell-strong)] data-active:bg-[var(--brand-shell)] data-active:text-[var(--brand-ink)]">Hero</TabsTrigger>
            <TabsTrigger value="featured" className="h-11 flex-none rounded-none border border-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] data-active:border-[var(--brand-shell-strong)] data-active:bg-[var(--brand-shell)] data-active:text-[var(--brand-ink)]">Featured Jobs</TabsTrigger>
            <TabsTrigger value="benefits" className="h-11 flex-none rounded-none border border-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] data-active:border-[var(--brand-shell-strong)] data-active:bg-[var(--brand-shell)] data-active:text-[var(--brand-ink)]">Benefits</TabsTrigger>
            <TabsTrigger value="companies" className="h-11 flex-none rounded-none border border-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] data-active:border-[var(--brand-shell-strong)] data-active:bg-[var(--brand-shell)] data-active:text-[var(--brand-ink)]">Companies</TabsTrigger>
            <TabsTrigger value="cta" className="h-11 flex-none rounded-none border border-transparent px-5 text-xs font-semibold uppercase tracking-[0.14em] data-active:border-[var(--brand-shell-strong)] data-active:bg-[var(--brand-shell)] data-active:text-[var(--brand-ink)]">CTA</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hero" className="w-full">
          <AdminEditorSectionCard
            title="Hero"
            description="Main headline, supporting copy, primary actions, and quick links."
          >
            <div className="grid gap-4">
              <Field label="Title">
                <Textarea value={draft.hero.title} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} />
              </Field>
              <Field label="Description">
                <Textarea value={draft.hero.description} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, description: event.target.value } }))} />
              </Field>
            </div>
            <div className="grid gap-4">
              <Field label="Primary CTA Label">
                <Input value={draft.hero.primaryCta.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, label: event.target.value } } }))} />
              </Field>
              <Field label="Primary CTA Link">
                <Input value={draft.hero.primaryCta.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: { ...current.hero.primaryCta, href: event.target.value } } }))} />
              </Field>
              <Field label="Secondary CTA Label">
                <Input value={draft.hero.secondaryCta.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, label: event.target.value } } }))} />
              </Field>
              <Field label="Secondary CTA Link">
                <Input value={draft.hero.secondaryCta.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: { ...current.hero.secondaryCta, href: event.target.value } } }))} />
              </Field>
            </div>
            <div className="grid gap-4">
              {draft.hero.quickLinks.map((link, index) => (
                <div key={`${link.label}-${index}`} className="grid gap-4">
                  <Field label={`Quick Link ${index + 1} Label`}>
                    <Input value={link.label} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, quickLinks: setLinkValue(current.hero.quickLinks, index, "label", event.target.value) } }))} />
                  </Field>
                  <Field label={`Quick Link ${index + 1} Link`}>
                    <Input value={link.href} onChange={(event) => setDraft((current) => ({ ...current, hero: { ...current.hero, quickLinks: setLinkValue(current.hero.quickLinks, index, "href", event.target.value) } }))} />
                  </Field>
                </div>
              ))}
            </div>
          </AdminEditorSectionCard>
        </TabsContent>

        <TabsContent value="featured" className="w-full">
          <AdminEditorSectionCard
            title="Featured jobs"
            description="Section copy plus query rules for the jobs pulled into the homepage."
          >
            <div className="grid gap-4">
              <Field label="Title">
                <Textarea value={draft.featuredJobs.title} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, title: event.target.value } }))} />
              </Field>
              <Field label="Description">
                <Textarea value={draft.featuredJobs.description} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, description: event.target.value } }))} />
              </Field>
              <Field label="Empty state">
                <Textarea value={draft.featuredJobs.emptyState} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, emptyState: event.target.value } }))} />
              </Field>
              <div className="grid gap-4">
                <Field label="Sort">
                  <Input value={draft.featuredJobs.rules.sort} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, sort: event.target.value as LandingPageContent["featuredJobs"]["rules"]["sort"] } } }))} />
                </Field>
                <Field label="Limit">
                  <Input type="number" value={draft.featuredJobs.rules.limit} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, limit: Number(event.target.value) || 1 } } }))} />
                </Field>
                <Field label="Category filter">
                  <Input value={draft.featuredJobs.rules.category ?? ""} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, category: event.target.value || null } } }))} />
                </Field>
                <Field label="Source filter">
                  <Input value={draft.featuredJobs.rules.source ?? ""} onChange={(event) => setDraft((current) => ({ ...current, featuredJobs: { ...current.featuredJobs, rules: { ...current.featuredJobs.rules, source: event.target.value || null } } }))} />
                </Field>
              </div>
            </div>
          </AdminEditorSectionCard>
        </TabsContent>

        <TabsContent value="benefits" className="w-full">
          <AdminEditorSectionCard
            title="Benefits"
            description="Structured benefits cards shown after the featured jobs section."
          >
            <Field label="Section title">
              <Input value={draft.benefits.title} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, title: event.target.value } }))} />
            </Field>
            <div className="grid gap-4">
              {draft.benefits.items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="grid gap-4">
                  <Field label={`Benefit ${index + 1} title`}>
                    <Input value={item.title} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, items: setBenefitValue(current.benefits.items, index, "title", event.target.value) } }))} />
                  </Field>
                  <Field label={`Benefit ${index + 1} description`}>
                    <Textarea value={item.description} onChange={(event) => setDraft((current) => ({ ...current, benefits: { ...current.benefits, items: setBenefitValue(current.benefits.items, index, "description", event.target.value) } }))} />
                  </Field>
                </div>
              ))}
            </div>
          </AdminEditorSectionCard>
        </TabsContent>

        <TabsContent value="companies" className="w-full">
          <AdminEditorSectionCard
            title="Trusted companies"
            description="Structured company strip for the credibility section."
          >
            <Field label="Section title">
              <Input value={draft.trustedCompanies.title} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, title: event.target.value } }))} />
            </Field>
            <div className="grid gap-4">
              {draft.trustedCompanies.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label={`Company ${index + 1} ID`}>
                    <Input value={item.id} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "id", event.target.value) } }))} />
                  </Field>
                  <Field label={`Company ${index + 1} Name`}>
                    <Input value={item.name} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "name", event.target.value) } }))} />
                  </Field>
                  <Field label={`Company ${index + 1} URL`}>
                    <Input value={item.url} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "url", event.target.value) } }))} />
                  </Field>
                  <Field label={`Company ${index + 1} Color`}>
                    <Input value={item.brandColor} onChange={(event) => setDraft((current) => ({ ...current, trustedCompanies: { ...current.trustedCompanies, items: setCompanyValue(current.trustedCompanies.items, index, "brandColor", event.target.value) } }))} />
                  </Field>
                </div>
              ))}
            </div>
          </AdminEditorSectionCard>
        </TabsContent>

        <TabsContent value="cta" className="w-full">
          <AdminEditorSectionCard
            title="CTA"
            description="Closing call-to-action that anchors the bottom of the landing page."
          >
            <div className="grid gap-4">
              <Field label="Title">
                <Textarea value={draft.cta.title} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, title: event.target.value } }))} />
              </Field>
              <Field label="Body">
                <Textarea value={draft.cta.body} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, body: event.target.value } }))} />
              </Field>
              <Field label="Primary button label">
                <Input value={draft.cta.primaryButton.label} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, primaryButton: { ...current.cta.primaryButton, label: event.target.value } } }))} />
              </Field>
              <Field label="Primary button link">
                <Input value={draft.cta.primaryButton.href} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, primaryButton: { ...current.cta.primaryButton, href: event.target.value } } }))} />
              </Field>
              <Field label="Secondary button label">
                <Input value={draft.cta.secondaryButton.label} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, secondaryButton: { ...current.cta.secondaryButton, label: event.target.value } } }))} />
              </Field>
              <Field label="Secondary button link">
                <Input value={draft.cta.secondaryButton.href} onChange={(event) => setDraft((current) => ({ ...current, cta: { ...current.cta, secondaryButton: { ...current.cta.secondaryButton, href: event.target.value } } }))} />
              </Field>
            </div>
          </AdminEditorSectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
