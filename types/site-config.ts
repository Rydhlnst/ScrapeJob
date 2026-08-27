export type SiteConfig = {
  website: {
    id: string
    name: string
    domain: string
    logo?: string | null
  }
  branding: {
    primaryColor: string
    accentColor: string
    inkColor: string
    backgroundColor: string
    theme?: string | null
  }
  tagline: string
  metadata: {
    title: string
    description: string
  }
  contact: {
    email?: string | null
  }
  features: Record<string, boolean>
  settings?: Record<string, unknown>
}
