"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type JobFilterProps = {
  onSubmit: (keyword: string) => void
}

export function JobFilter({ onSubmit }: JobFilterProps) {
  const [keyword, setKeyword] = useState("")

  return (
    <form
      className="flex w-full max-w-xl items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(keyword.trim())
      }}
    >
      <Input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Search title, company, or location"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
