"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { adminLogin } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(4, "Password too short"),
})

export function AuthLoginForm({ role }: { role: "user" | "admin" }) {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid input")
        return
      }

      try {
        if (role === "admin") {
          const res = await adminLogin(parsed.data)
          localStorage.setItem("admin_access_token", res.accessToken)
          // Set HttpOnly session cookie for the Next middleware gate. If this
          // fails, the middleware will bounce the very next navigation — so
          // block the redirect and surface the error instead of leaving the
          // user with a token that can't pass the server-side gate.
          const sessionResponse = await fetch("/api/auth/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: res.accessToken }),
          })
          if (!sessionResponse.ok) {
            localStorage.removeItem("admin_access_token")
            toast.error("Login berhasil tapi sesi gagal disimpan. Coba lagi.")
            return
          }
          toast.success("Login admin berhasil")
          router.push("/admin/dashboard")
          return
        }

        localStorage.setItem("user_access_token", "mock-user-token")
        toast.success("Login user berhasil")
        router.push("/")
      } catch (e) {
        toast.error((e as Error).message || "Login gagal.")
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={`${role}-email`}>Email</Label>
            <Input
              id={`${role}-email`}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-xl border-[#d8e4f6] bg-white px-3 text-foreground shadow-none"
            />
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={`${role}-password`}>Password</Label>
            <Input
              id={`${role}-password`}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="********"
              className="h-11 rounded-xl border-[#d8e4f6] bg-white px-3 text-foreground shadow-none"
            />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button
            className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Log in with email"
            )}
          </Button>
        )}
      />

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        {role === "admin" ? (
          <p>
            User account?{" "}
            <Link className="font-medium text-foreground hover:underline" href="/login">
              Sign in as user
            </Link>
          </p>
        ) : (
          <p>
            Admin account?{" "}
            <Link className="font-medium text-foreground hover:underline" href="/admin/login">
              Sign in as admin
            </Link>
          </p>
        )}
      </div>
    </form>
  )
}
