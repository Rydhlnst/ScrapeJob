function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }

  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

export const categoryColor = (category?: string | null) => {
  if (!category) return "bg-muted text-muted-foreground border-border"
  return "bg-muted text-muted-foreground border-border"
}

export const jobTypeColor = (jobType?: string | null) => {
  if (!jobType) return "bg-muted text-muted-foreground border-border"

  const normalized = jobType.toLowerCase()

  if (normalized.includes("remote")) return "bg-accent text-accent-foreground border-accent"
  if (normalized.includes("full")) return "bg-muted text-muted-foreground border-border"
  if (normalized.includes("part")) return "bg-muted text-muted-foreground border-border"
  if (normalized.includes("contract")) return "bg-muted text-muted-foreground border-border"
  if (normalized.includes("freelance")) return "bg-accent text-accent-foreground border-accent"
  if (normalized.includes("intern")) return "bg-muted text-muted-foreground border-border"

  return "bg-muted text-muted-foreground border-border"
}

