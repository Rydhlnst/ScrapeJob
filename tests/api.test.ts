import { describe, it, expect, beforeAll } from "vitest"

const API_BASE = process.env.API_BASE_URL || "http://localhost:8000"
const ADMIN_BASE = `${API_BASE}/api/admin`

let adminToken = ""

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lowonganku.id", password: "password123" }),
  })
  const data = await res.json()
  return data.data?.accessToken || ""
}

async function apiGet(path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${ADMIN_BASE}${path}`, { headers })
  return { status: res.status, body: await res.json() }
}

async function apiPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

async function apiPut(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json() }
}

async function apiDelete(path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${ADMIN_BASE}${path}`, { method: "DELETE", headers })
  return { status: res.status, body: await res.json() }
}

beforeAll(async () => {
  adminToken = await getAdminToken()
  expect(adminToken).toBeTruthy()
})

describe("Auth", () => {
  it("should login with valid credentials", async () => {
    const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@lowonganku.id", password: "password123" }),
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.accessToken).toBeTruthy()
  })

  it("should reject invalid credentials", async () => {
    const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "wrong@email.com", password: "wrong" }),
    })
    expect(res.status).toBe(401)
  })
})

describe("Dashboard", () => {
  it("should return dashboard summary", async () => {
    const { status, body } = await apiGet("/dashboard", adminToken)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.statusCounts).toBeDefined()
    expect(body.data.statusCounts.raw).toBeGreaterThanOrEqual(0)
    expect(body.data.statusCounts.draft).toBeGreaterThanOrEqual(0)
    expect(body.data.statusCounts.published).toBeGreaterThanOrEqual(0)
  })
})

describe("Jobs", () => {
  it("should list jobs", async () => {
    const { status, body } = await apiGet("/jobs", adminToken)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it("should filter jobs by status", async () => {
    const { status, body } = await apiGet("/jobs?status=draft", adminToken)
    expect(status).toBe(200)
    expect(body.data.every((j: Record<string, string>) => j.status === "draft")).toBe(true)
  })

  it("should get a single job", async () => {
    const list = await apiGet("/jobs", adminToken)
    const jobId = list.body.data[0].id
    const { status, body } = await apiGet(`/jobs/${jobId}`, adminToken)
    expect(status).toBe(200)
    expect(body.data.id).toBe(jobId)
  })
})

describe("Categories", () => {
  it("should list categories", async () => {
    const { status, body } = await apiGet("/categories", adminToken)
    expect(status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it("should create, update, delete category", async () => {
    const create = await apiPost("/categories", { name: "Test Category", slug: "test-category" }, adminToken)
    expect(create.status).toBe(201)
    const catId = create.body.data.id

    const update = await apiPut(`/categories/${catId}`, { name: "Updated Category" }, adminToken)
    expect(update.status).toBe(200)
    expect(update.body.data.name).toBe("Updated Category")

    const del = await apiDelete(`/categories/${catId}`, adminToken)
    expect(del.status).toBe(200)
  })
})

describe("Locations", () => {
  it("should list locations", async () => {
    const { status, body } = await apiGet("/locations", adminToken)
    expect(status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it("should create, update, delete location", async () => {
    const create = await apiPost("/locations", { name: "Test Location" }, adminToken)
    expect(create.status).toBe(201)
    const locId = create.body.data.id

    const update = await apiPut(`/locations/${locId}`, { name: "Updated Location" }, adminToken)
    expect(update.status).toBe(200)

    const del = await apiDelete(`/locations/${locId}`, adminToken)
    expect(del.status).toBe(200)
  })
})

describe("Pages", () => {
  let pageId: string

  it("should list pages", async () => {
    const { status, body } = await apiGet("/pages", adminToken)
    expect(status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it("should create a page", async () => {
    const { status, body } = await apiPost("/pages", {
      title: "Test Page",
      slug: "test-page-api",
      content: "<p>Test content</p>",
      status: "draft",
    }, adminToken)
    expect(status).toBe(201)
    pageId = body.data.id
    expect(body.data.title).toBe("Test Page")
  })

  it("should get a page by id", async () => {
    const { status, body } = await apiGet(`/pages/${pageId}`, adminToken)
    expect(status).toBe(200)
    expect(body.data.id).toBe(pageId)
  })

  it("should update a page", async () => {
    const { status, body } = await apiPut(`/pages/${pageId}`, {
      title: "Updated Test Page",
    }, adminToken)
    expect(status).toBe(200)
    expect(body.data.title).toBe("Updated Test Page")
  })

  it("should delete a page", async () => {
    const { status } = await apiDelete(`/pages/${pageId}`, adminToken)
    expect(status).toBe(200)
  })
})

describe("Job Sources", () => {
  it("should list job sources", async () => {
    const { status, body } = await apiGet("/job-sources", adminToken)
    expect(status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it("should create, update, delete job source", async () => {
    const create = await apiPost("/job-sources", { name: "Test Source", base_url: "https://test.example.com" }, adminToken)
    expect(create.status).toBe(201)
    const sourceId = create.body.data.id

    const update = await apiPut(`/job-sources/${sourceId}`, { name: "Updated Source" }, adminToken)
    expect(update.status).toBe(200)

    const del = await apiDelete(`/job-sources/${sourceId}`, adminToken)
    expect(del.status).toBe(200)
  })
})

describe("Landing Page Content", () => {
  it("should get landing page content", async () => {
    const { status, body } = await apiGet("/landing-page-content", adminToken)
    expect(status).toBe(200)
    expect(body.data).toBeDefined()
    expect(body.data.key).toBe("landing_page")
  })

  it("should save draft", async () => {
    const current = await apiGet("/landing-page-content", adminToken)
    const draftPayload = current.body.data.draftPayload || current.body.data.publishedPayload

    const { status, body } = await apiPut("/landing-page-content", {
      draftPayload,
    }, adminToken)
    expect(status).toBe(200)
    expect(body.data.hasDraft).toBe(true)
  })

  it("should publish draft", async () => {
    const { status, body } = await apiPost("/landing-page-content/publish", {}, adminToken)
    expect(status).toBe(200)
    expect(body.data.status).toBe("published")
    expect(body.data.hasDraft).toBe(false)
  })
})

describe("Settings", () => {
  it("should get settings", async () => {
    const { status, body } = await apiGet("/settings", adminToken)
    expect(status).toBe(200)
    expect(body.data).toBeDefined()
  })
})

describe("Scrape Runs", () => {
  it("should list scrape runs", async () => {
    const { status, body } = await apiGet("/scrape-runs", adminToken)
    expect(status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
  })
})
