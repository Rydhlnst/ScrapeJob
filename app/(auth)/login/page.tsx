import { AuthLoginForm } from "@/components/auth/auth-login-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function UserLoginPage() {
  return (
    <AuthShell
      title="Get started with Lowonganku"
      description="Masuk untuk menyimpan lowongan, melamar lebih cepat, dan memantau status lamaran."
    >
      <AuthLoginForm role="user" />
    </AuthShell>
  )
}
