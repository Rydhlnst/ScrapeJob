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
          <Input placeholder="Search keyword (coming next)" />
          <Button variant="outline" disabled>
            Filter
          </Button>
        </div>
      </div>
      <div className="border border-slate-200 bg-white shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Kategori</TableHead>
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
                      <Button size="icon" variant="ghost" className="rounded-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/edit`}>Edit article</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/jobs/${j.id}/preview`}>Preview admin</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/jobs/${j.slug}`} target="_blank">Open public page</Link>
                      </DropdownMenuItem>
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
