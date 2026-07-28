function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }

  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

export const categoryColor = (category?: string | null) => {
  if (!category) return "bg-slate-100 text-slate-600 border-slate-200"
  return "bg-slate-100 text-slate-600 border-slate-200"
}

export const jobTypeColor = (jobType?: string | null) => {
  if (!jobType) return "bg-slate-100 text-slate-600 border-slate-200"

  const normalized = jobType.toLowerCase()

  if (normalized.includes("remote")) return "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border-[var(--brand-blue)]/20"
  if (normalized.includes("full")) return "bg-slate-100 text-slate-600 border-slate-200"
  if (normalized.includes("part")) return "bg-slate-100 text-slate-600 border-slate-200"
  if (normalized.includes("contract")) return "bg-slate-100 text-slate-600 border-slate-200"
  if (normalized.includes("freelance")) return "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border-[var(--brand-blue)]/20"
  if (normalized.includes("intern")) return "bg-slate-100 text-slate-600 border-slate-200"

  return "bg-slate-100 text-slate-600 border-slate-200"
}

