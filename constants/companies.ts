export type Company = {
  id: string
  name: string
  verified?: boolean
  brandColor: string
}

export const companies: Company[] = [
  { id: "spotify", name: "Spotify", verified: true, brandColor: "#1DB954" },
  { id: "airbnb", name: "Airbnb", verified: true, brandColor: "#FF385C" },
  { id: "canva", name: "Canva", verified: true, brandColor: "#00C4CC" },
  { id: "notion", name: "Notion", verified: true, brandColor: "#111827" },
  { id: "google", name: "Google", verified: true, brandColor: "#4285F4" },
  { id: "openai", name: "OpenAI", verified: true, brandColor: "#111827" },
  { id: "stripe", name: "Stripe", verified: true, brandColor: "#635BFF" },
  { id: "figma", name: "Figma", verified: true, brandColor: "#A259FF" },
]

