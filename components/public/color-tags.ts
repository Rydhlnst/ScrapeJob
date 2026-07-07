function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }

  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

const badgePalettes = [
  "bg-white text-slate-700 border-white",
  "bg-sky-50/90 text-sky-700 border-sky-100",
  "bg-amber-50/90 text-amber-700 border-amber-100",
] as const

export const categoryColor = (category?: string | null) => {
  if (!category) return "bg-muted text-muted-foreground border-border"

  const normalized = category.toLowerCase()

  if (
    normalized.includes("design") ||
    normalized.includes("ui") ||
    normalized.includes("ux") ||
    normalized.includes("product")
  ) {
    return "bg-sky-50/90 text-sky-700 border-sky-100"
  }

  if (
    normalized.includes("engineering") ||
    normalized.includes("developer") ||
    normalized.includes("frontend") ||
    normalized.includes("backend") ||
    normalized.includes("fullstack")
  ) {
    return "bg-white text-slate-700 border-white"
  }

  const idx = hashToIndex(normalized, badgePalettes.length)
  return badgePalettes[idx]
}

export const jobTypeColor = (jobType?: string | null) => {
  if (!jobType) return "bg-muted text-muted-foreground border-border"

  const normalized = jobType.toLowerCase()

  if (normalized.includes("remote")) return "bg-sky-50/90 text-sky-700 border-sky-100"
  if (normalized.includes("full")) return "bg-white text-slate-700 border-white"
  if (normalized.includes("part")) return "bg-amber-50/90 text-amber-700 border-amber-100"
  if (normalized.includes("contract")) return "bg-white text-slate-600 border-white"
  if (normalized.includes("freelance")) return "bg-sky-50/90 text-sky-700 border-sky-100"
  if (normalized.includes("intern")) return "bg-amber-50/90 text-amber-700 border-amber-100"

  const idx = hashToIndex(normalized, badgePalettes.length)
  return badgePalettes[idx]
}

