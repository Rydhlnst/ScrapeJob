"use client"

import { MoreHorizontal } from "lucide-react"

import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
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

export function RawDataTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Raw title</TableHead>
            <TableHead>Raw company</TableHead>
            <TableHead>Raw location</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scraped</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((j) => (
            <TableRow key={j.id}>
              <TableCell className="font-medium text-slate-900">{j.title}</TableCell>
              <TableCell className="text-slate-700">{j.companyName}</TableCell>
              <TableCell className="text-slate-700">{j.location}</TableCell>
              <TableCell className="text-slate-600">{j.sourceName}</TableCell>
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
                    <DropdownMenuItem onSelect={() => console.log("normalize", j.id)}>
                      Normalize
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("mark-duplicate", j.id)}>
                      Mark as duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("move-to-draft", j.id)}>
                      Move to draft
                    </DropdownMenuItem>
                    <ConfirmDialog
                      title="Delete raw job?"
                      description="Action permanent (mock)."
                      confirmLabel="Delete"
                      onConfirm={() => console.log("delete-raw", j.id)}
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
  )
}

