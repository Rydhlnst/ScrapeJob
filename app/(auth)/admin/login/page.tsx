import { AuthLoginForm } from "@/components/auth/auth-login-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin workspace sign in"
      description="Masuk untuk mengelola pipeline scraping, review data, dan publish lowongan."
    >
      <AuthLoginForm role="admin" />
    </AuthShell>
  )
}
