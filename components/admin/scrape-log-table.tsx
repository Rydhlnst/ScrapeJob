"use client"

import type { ScrapeLog } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function LogStatusBadge({ status }: { status: ScrapeLog["status"] }) {
  const cls =
    status === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "failed"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : status === "duplicate"
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : "bg-slate-100 text-slate-700 border-slate-200"

  return (
    <Badge variant="outline" className={cn("capitalize", cls)}>
      {status}
    </Badge>
  )
}

export function ScrapeLogTable({ logs }: { logs: ScrapeLog[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="max-w-[260px] truncate text-slate-700">{l.url}</TableCell>
              <TableCell className="text-slate-900">{l.title ?? "-"}</TableCell>
              <TableCell><LogStatusBadge status={l.status} /></TableCell>
              <TableCell className="text-slate-600">{l.message ?? "-"}</TableCell>
              <TableCell className="text-slate-600">{l.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

