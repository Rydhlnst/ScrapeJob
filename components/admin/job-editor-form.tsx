"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "@tanstack/react-form"

import type { Job } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const schema = z.object({
  title: z.string().min(1, "Title required"),
  companyName: z.string().min(1, "Company name required"),
  location: z.string().min(1, "Location required"),
  category: z.string().min(1, "Category required"),
  jobType: z.string().min(1, "Job type required"),
  salaryText: z.string().optional(),
  description: z.string().min(1, "Description required"),
  sourceName: z.string().min(1, "Source name required"),
  sourceUrl: z.string().url("Source URL must be valid"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.string().min(1),
})

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700">{label}</Label>
      {children}
      {error ? <div className="text-xs text-rose-600">{error}</div> : null}
    </div>
  )
}

export function JobEditorForm({ job }: { job: Job }) {
  const form = useForm({
    defaultValues: {
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      category: job.category ?? "",
      jobType: job.jobType ?? "",
      salaryText: job.salaryText ?? "",
      description: job.description,
      sourceName: job.sourceName,
      sourceUrl: job.sourceUrl,
      seoTitle: "",
      seoDescription: "",
      status: job.status,
    },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success) return
      console.log("save-draft", { id: job.id, ...parsed.data })
    },
  })

  const rawDescription = job.rawDescription ?? ""

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="title"
          validators={{
            onSubmit: ({ value }) => schema.shape.title.safeParse(value).success ? undefined : "Title required",
          }}
        >
          {(field) => (
            <Field label="Title" error={field.state.meta.errors?.[0] as string | undefined}>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>

        <form.Field
          name="companyName"
          validators={{
            onSubmit: ({ value }) => schema.shape.companyName.safeParse(value).success ? undefined : "Company name required",
          }}
        >
          {(field) => (
            <Field label="Company Name" error={field.state.meta.errors?.[0] as string | undefined}>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>

        <form.Field
          name="location"
          validators={{
            onSubmit: ({ value }) => schema.shape.location.safeParse(value).success ? undefined : "Location required",
          }}
        >
          {(field) => (
            <Field label="Location" error={field.state.meta.errors?.[0] as string | undefined}>
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <Field label="Category">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="IT & Software" />
            </Field>
          )}
        </form.Field>

        <form.Field name="jobType">
          {(field) => (
            <Field label="Job Type">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Full-time" />
            </Field>
          )}
        </form.Field>

        <form.Field name="salaryText">
          {(field) => (
            <Field label="Salary Text">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Rp 6jt - Rp 10jt" />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field
        name="description"
        validators={{
          onSubmit: ({ value }) => schema.shape.description.safeParse(value).success ? undefined : "Description required",
        }}
      >
        {(field) => (
          <Field label="Description" error={field.state.meta.errors?.[0] as string | undefined}>
            <RichTextEditor value={field.state.value} onChange={(val) => field.handleChange(val)} />
          </Field>
        )}
      </form.Field>

      <Accordion type="single" collapsible>
        <AccordionItem value="raw">
          <AccordionTrigger>Raw Description (readonly)</AccordionTrigger>
          <AccordionContent>
            <div className={cn("rounded-md border bg-slate-50 p-3 text-sm text-slate-700")}>
              {rawDescription ? rawDescription : <span className="text-slate-500">No raw description.</span>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="sourceName">
          {(field) => (
            <Field label="Source Name">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>
        <form.Field
          name="sourceUrl"
          validators={{
            onSubmit: ({ value }) => schema.shape.sourceUrl.safeParse(value).success ? undefined : "Invalid URL",
          }}
        >
          {(field) => (
            <Field label="Source URL (readonly)" error={field.state.meta.errors?.[0] as string | undefined}>
              <Input readOnly value={field.state.value} />
            </Field>
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field name="seoTitle">
          {(field) => (
            <Field label="SEO Title">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>
        <form.Field name="seoDescription">
          {(field) => (
            <Field label="SEO Description">
              <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </Field>
          )}
        </form.Field>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => console.log("preview", job.id)}
          >
            Preview
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => console.log("publish", job.id)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Publish
          </Button>
          <Button
            type="button"
            onClick={() => console.log("reject", job.id)}
            className="bg-rose-600 hover:bg-rose-700"
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => console.log("delete", job.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </form>
  )
}

