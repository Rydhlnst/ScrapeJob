"use client"

import * as React from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { adminLogin } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(4, "Password too short"),
})

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("admin@example.com")
  const [password, setPassword] = React.useState("password")
  const [loading, setLoading] = React.useState(false)

  async function submit() {
    setLoading(true)
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input")
      setLoading(false)
      return
    }
    try {
      const res = await adminLogin(parsed.data)
      localStorage.setItem("admin_access_token", res.accessToken)
      toast.success("Login berhasil. Mengarahkan ke dashboard...")
      router.push("/admin/dashboard")
    } catch (e) {
      toast.error((e as Error).message || "Login gagal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Masuk untuk mengelola draft dan publish lowongan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} onClick={submit}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
