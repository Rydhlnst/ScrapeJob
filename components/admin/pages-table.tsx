"use client"

import Link from "next/link"
import { toast } from "sonner"

import type { Page } from "@/types/page"
import { deleteAdminPage, publishAdminPage } from "@/lib/api/pages"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function PagesTable({
  pages,
  onRefresh,
}: {
  pages: Page[]
  onRefresh: () => Promise<void> | void
}) {
  async function handlePublish(id: string) {
    try {
      await publishAdminPage(id)
      toast.success("Page published.")
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish page.")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminPage(id)
      toast.success("Page deleted.")
      await onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete page.")
    }
  }

  return (
    <div className="border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell>/page/{page.slug}</TableCell>
              <TableCell>{page.status}</TableCell>
              <TableCell>{new Date(page.updatedAt).toLocaleString("id-ID")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href={`/admin/pages/${page.id}/edit`}>Edit</Link>
                  </Button>
                  <Button type="button" variant="outline" className="rounded-lg" onClick={() => handlePublish(page.id)}>
                    Publish
                  </Button>
                  <Button type="button" variant="destructive" className="rounded-lg" onClick={() => handleDelete(page.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
