import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"

export function PublicHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-slate-900"
        >
          <Image src="/logo.png" alt="Lowonganku logo" width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
          <span>Lowonganku</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/jobs">Lowongan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/login">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
