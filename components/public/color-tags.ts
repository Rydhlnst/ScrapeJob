function hashToIndex(input: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }

  const positive = Math.abs(hash)
  return positive % Math.max(1, modulo)
}

export const categoryColor = (category?: string | null) => {
  if (!category) return "bg-white text-slate-600 border-black/10"
  return "bg-white text-slate-600 border-black/10"
}

export const jobTypeColor = (jobType?: string | null) => {
  if (!jobType) return "bg-white text-slate-600 border-black/10"

  const normalized = jobType.toLowerCase()

  if (normalized.includes("remote")) return "bg-white text-[#2479d1] border-[#3f95e8]/30"
  if (normalized.includes("full")) return "bg-white text-slate-600 border-black/10"
  if (normalized.includes("part")) return "bg-white text-slate-600 border-black/10"
  if (normalized.includes("contract")) return "bg-white text-slate-600 border-black/10"
  if (normalized.includes("freelance")) return "bg-white text-[#2479d1] border-[#3f95e8]/30"
  if (normalized.includes("intern")) return "bg-white text-slate-600 border-black/10"

  return "bg-white text-slate-600 border-black/10"
}

