import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export type AdminLoginInput = { email: string; password: string }
export type AdminLoginResult = {
  accessToken: string
  tokenType: string
  user: { id: string; email: string; name?: string }
}

export async function adminLogin(
  input: AdminLoginInput,
): Promise<AdminLoginResult> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<AdminLoginResult>>(
      "/api/auth/login",
      {
      method: "POST",
      body: JSON.stringify(input),
      },
    )
    return response.data
  }
  if (!input.email.includes("@") || input.password.length < 4) {
    throw new Error("Invalid credentials")
  }
  return {
    accessToken: "mock-token",
    tokenType: "Bearer",
    user: { id: "u_1", email: input.email, name: "Mock Admin" },
  }
}
