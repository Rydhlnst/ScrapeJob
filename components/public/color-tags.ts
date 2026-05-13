function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

const pastelBadgePalettes = [
  "bg-emerald-50 text-emerald-800 border-emerald-200",
  "bg-sky-50 text-sky-800 border-sky-200",
  "bg-violet-50 text-violet-800 border-violet-200",
  "bg-rose-50 text-rose-800 border-rose-200",
  "bg-amber-50 text-amber-800 border-amber-200",
  "bg-teal-50 text-teal-800 border-teal-200",
] as const

export const categoryColor = (category?: string | null) => {
  if (!category)
    return "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-border"

  const c = category.toLowerCase()

  if (c.includes("design") || c.includes("ui") || c.includes("ux") || c.includes("product"))
    return "bg-violet-50 text-violet-800 border-violet-200"

  if (c.includes("engineering") || c.includes("developer") || c.includes("frontend") || c.includes("backend") || c.includes("fullstack"))
    return "bg-sky-50 text-sky-800 border-sky-200"

  if (c.includes("data") || c.includes("analyst") || c.includes("ml") || c.includes("ai"))
    return "bg-emerald-50 text-emerald-800 border-emerald-200"

  if (c.includes("marketing") || c.includes("sales") || c.includes("business"))
    return "bg-amber-50 text-amber-800 border-amber-200"

  if (c.includes("hr") || c.includes("people") || c.includes("recruit"))
    return "bg-rose-50 text-rose-800 border-rose-200"

  const idx = hashToIndex(c, pastelBadgePalettes.length)
  return pastelBadgePalettes[idx]
}

export const jobTypeColor = (jobType?: string | null) => {
  if (!jobType)
    return "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-border"

  const t = jobType.toLowerCase()

  if (t.includes("full")) return "bg-emerald-50 text-emerald-800 border-emerald-200"
  if (t.includes("part")) return "bg-sky-50 text-sky-800 border-sky-200"
  if (t.includes("contract")) return "bg-amber-50 text-amber-800 border-amber-200"
  if (t.includes("freelance")) return "bg-violet-50 text-violet-800 border-violet-200"
  if (t.includes("intern")) return "bg-rose-50 text-rose-800 border-rose-200"

  const idx = hashToIndex(t, pastelBadgePalettes.length)
  return pastelBadgePalettes[idx]
}
