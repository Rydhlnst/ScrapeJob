"use client"

import type { ExperienceLevel, JobEmploymentType, JobWorkType } from "@/constants/jobs"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const jobTypes: JobEmploymentType[] = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
]

const experienceLevels: ExperienceLevel[] = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead / Manager",
]

const workTypes: JobWorkType[] = ["Remote", "Hybrid", "On-site"]

export type LastUpdated = "24h" | "7d" | "30d" | "any"

export type JobFilters = {
  jobTypes: JobEmploymentType[]
  experience: ExperienceLevel[]
  workTypes: JobWorkType[]
  lastUpdated: LastUpdated
}

function CheckboxRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
      />
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
    </div>
  )
}

export function JobFilterSidebar({
  filters,
  onChange,
  onClear,
}: {
  filters: JobFilters
  onChange: (next: JobFilters) => void
  onClear: () => void
}) {
  return (
    <aside className="w-full space-y-4">
      <Card className="rounded-2xl border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Filter</div>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Clear filter
          </button>
        </div>

        <div className="mt-5 space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">Job type</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {jobTypes.map((t) => (
                <CheckboxRow
                  key={t}
                  id={`jobType-${t}`}
                  label={t}
                  checked={filters.jobTypes.includes(t)}
                  onCheckedChange={(next) =>
                    onChange({
                      ...filters,
                      jobTypes: next
                        ? Array.from(new Set([...filters.jobTypes, t]))
                        : filters.jobTypes.filter((x) => x !== t),
                    })
                  }
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">
              Experience
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {experienceLevels.map((l) => (
                <CheckboxRow
                  key={l}
                  id={`exp-${l}`}
                  label={l}
                  checked={filters.experience.includes(l)}
                  onCheckedChange={(next) =>
                    onChange({
                      ...filters,
                      experience: next
                        ? Array.from(new Set([...filters.experience, l]))
                        : filters.experience.filter((x) => x !== l),
                    })
                  }
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">Work type</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {workTypes.map((w) => (
                <CheckboxRow
                  key={w}
                  id={`work-${w}`}
                  label={w}
                  checked={filters.workTypes.includes(w)}
                  onCheckedChange={(next) =>
                    onChange({
                      ...filters,
                      workTypes: next
                        ? Array.from(new Set([...filters.workTypes, w]))
                        : filters.workTypes.filter((x) => x !== w),
                    })
                  }
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground">
              Last updated
            </div>
            <Select
              value={filters.lastUpdated}
              onValueChange={(v) =>
                onChange({ ...filters, lastUpdated: v as LastUpdated })
              }
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 hours ago</SelectItem>
                <SelectItem value="7d">7 days ago</SelectItem>
                <SelectItem value="30d">30 days ago</SelectItem>
                <SelectItem value="any">Any time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </aside>
  )
}
