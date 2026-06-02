import { ApiEnvelope, fetchJson, USE_MOCK } from "./client"

export type AdminLoginInput = { email: string; password: string }
export type UserLoginInput = { email: string; password: string }
export type RegisterInput = {
  name: string
  email: string
  password: string
  password_confirmation: string
}
export type AdminLoginResult = {
  accessToken: string
  tokenType: string
  user: { id: string; email: string; name?: string }
}
export type AuthResult = AdminLoginResult

export async function adminLogin(
  input: AdminLoginInput,
): Promise<AdminLoginResult> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<AdminLoginResult>>(
      "/api/auth/admin/login",
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

export async function userLogin(input: UserLoginInput): Promise<AuthResult> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<AuthResult>>("/api/auth/user/login", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return response.data
  }
  if (!input.email.includes("@") || input.password.length < 4) {
    throw new Error("Invalid credentials")
  }
  return {
    accessToken: "mock-user-token",
    tokenType: "Bearer",
    user: { id: "u_2", email: input.email, name: "Mock User" },
  }
}

export async function adminRegister(input: RegisterInput): Promise<AuthResult> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<AuthResult>>("/api/auth/admin/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return response.data
  }
  return {
    accessToken: "mock-admin-token",
    tokenType: "Bearer",
    user: { id: "u_3", email: input.email, name: input.name },
  }
}

export async function userRegister(input: RegisterInput): Promise<AuthResult> {
  if (!USE_MOCK) {
    const response = await fetchJson<ApiEnvelope<AuthResult>>("/api/auth/user/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return response.data
  }
  return {
    accessToken: "mock-user-token",
    tokenType: "Bearer",
    user: { id: "u_4", email: input.email, name: input.name },
  }
}
