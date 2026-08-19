"use client"

import type { Job } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
