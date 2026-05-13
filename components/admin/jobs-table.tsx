"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { JobStatusBadge } from "./job-status-badge"

export function JobsTable({
  jobs,
  title = "Jobs",
}: {
  jobs: Job[]
  title?: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="flex w-full gap-2 md:w-auto">
          <Input placeholder="Search keyword (mock)" />
          <Button variant="outline" disabled>
            Filter
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scraped</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium text-slate-900">
                  <Link className="hover:text-blue-700" href={`/admin/jobs/${j.id}/edit`}>
                    {j.title}
                  </Link>
                </TableCell>
                <TableCell>{j.companyName}</TableCell>
                <TableCell>{j.location}</TableCell>
                <TableCell>{j.category ?? "-"}</TableCell>
                <TableCell>{j.sourceName}</TableCell>
                <TableCell>
                  <JobStatusBadge status={j.status} />
                </TableCell>
                <TableCell className="text-slate-600">{j.scrapedAt ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/preview`}>Preview</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          console.log("publish", j.id)
                        }}
                      >
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          console.log("unpublish", j.id)
                        }}
                      >
                        Unpublish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          console.log("reject", j.id)
                        }}
                      >
                        Reject
                      </DropdownMenuItem>
                      <ConfirmDialog
                        title="Delete job?"
                        description="Action permanent (mock)."
                        confirmLabel="Delete"
                        onConfirm={() => console.log("delete", j.id)}
                      >
                        <DropdownMenuItem
                          className="text-rose-600 focus:text-rose-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </ConfirmDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

