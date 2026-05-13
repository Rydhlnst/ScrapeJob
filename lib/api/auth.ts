import { fetchJson, USE_MOCK } from "./client"

export type AdminLoginInput = { email: string; password: string }
export type AdminLoginResult = { token: string; user: { id: string; email: string } }

export async function adminLogin(
  input: AdminLoginInput,
): Promise<AdminLoginResult> {
  if (!USE_MOCK) {
    return fetchJson<AdminLoginResult>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(input),
    })
  }
  if (!input.email.includes("@") || input.password.length < 4) {
    throw new Error("Invalid credentials")
  }
  return { token: "mock-token", user: { id: "u_1", email: input.email } }
}

