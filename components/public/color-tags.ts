export const categoryColor = (category?: string | null) => {
  const c = (category ?? "").toLowerCase()
  if (c.includes("it")) return "bg-indigo-50 text-indigo-700 border-indigo-200"
  if (c.includes("software")) return "bg-indigo-50 text-indigo-700 border-indigo-200"
  if (c.includes("marketing")) return "bg-cyan-50 text-cyan-700 border-cyan-200"
  if (c.includes("admin")) return "bg-slate-100 text-slate-700 border-slate-200"
  if (c.includes("finance")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (c.includes("design")) return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
  if (c.includes("sales")) return "bg-amber-50 text-amber-800 border-amber-200"
  if (c.includes("customer")) return "bg-violet-50 text-violet-700 border-violet-200"
  if (c.includes("intern")) return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-blue-50 text-blue-700 border-blue-200"
}

export const jobTypeColor = (jobType?: string | null) => {
  const t = (jobType ?? "").toLowerCase()
  if (!t) return "bg-slate-100 text-slate-700 border-slate-200"
  if (t.includes("full")) return "bg-blue-50 text-blue-700 border-blue-200"
  if (t.includes("part")) return "bg-amber-50 text-amber-800 border-amber-200"
  if (t.includes("contract")) return "bg-violet-50 text-violet-700 border-violet-200"
  if (t.includes("freelance")) return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
  if (t.includes("intern")) return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-slate-100 text-slate-700 border-slate-200"
}

