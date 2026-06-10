import { generateObject } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"

// Schema definition for structured cleaning output
const cleanedJobSchema = z.object({
  title: z
    .string()
    .describe(
      "Tidy job title, capitalized properly (Title Case), removing spam/urgency words like 'URGENT', 'HIRING', 'DICARI', 'BUTUH SEGERA', etc."
    ),
  company: z
    .string()
    .describe(
      "Normalized company name. Strip legal entity prefixes/suffixes like 'PT.', 'Tbk.', 'CV.', 'Group', 'Indonesia' unless it is part of the core brand name."
    ),
  location: z
    .string()
    .describe(
      "Standardized Indonesian city or province (e.g. 'Jakarta Selatan', 'Bandung', 'Surabaya', 'Tangerang'). Do not include zip codes or full street addresses."
    ),
  salary: z
    .string()
    .nullable()
    .describe(
      "Standardized salary text if provided. Format as IDR monthly range (e.g., 'IDR 5.000.000 - 8.000.000') or single amount (e.g., 'IDR 7.000.000'). Return null if undisclosed or not specified."
    ),
  employment_type: z
    .enum(["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Other"])
    .describe("Determine the closest standard employment type based on the raw description/metadata."),
  description: z
    .string()
    .describe(
      "Standardized job description using clean HTML tags. Use <p> for paragraphs, <ul> and <li> for lists. Fix typos, grammar, and improve readability. Translate English templates/boilerplates to natural Indonesian if it makes the posting clearer for Indonesian candidates."
    ),
  description_summary: z
    .string()
    .describe(
      "A brief 1-2 sentence summary of the role, core responsibilities, and main requirements in polite, professional Indonesian."
    ),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization check
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : authHeader
    const expectedToken = process.env.SCRAPER_INTERNAL_API_TOKEN || "secure-token"

    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse request payload
    const body = await request.json()
    const { title, company, location, salary, employment_type, description } = body

    if (!title && !description) {
      return NextResponse.json(
        { error: "Missing required fields (title and/or description)" },
        { status: 400 }
      )
    }

    // 3. Setup Deepseek Model configuration
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuration Error: DEEPSEEK_API_KEY is not set on the server" },
        { status: 500 }
      )
    }

    // Initialize deepseek provider with api key explicitly or let it load from env
    const model = deepseek("deepseek-chat")

    // 4. Generate structured object via Vercel AI SDK
    const result = await generateObject({
      model,
      schema: cleanedJobSchema,
      prompt: `Identify, format, and clean the following job details:\n` +
        `Raw Title: ${title || "N/A"}\n` +
        `Raw Company: ${company || "N/A"}\n` +
        `Raw Location: ${location || "N/A"}\n` +
        `Raw Salary: ${salary || "N/A"}\n` +
        `Raw Employment Type: ${employment_type || "N/A"}\n` +
        `Raw Description:\n${description || "N/A"}`,
      system:
        "You are a professional Indonesian recruitment assistant. Your goal is to clean and standardize scraped job postings to look highly professional, clean, and consistent for Indonesian job seekers.",
    })

    return NextResponse.json({
      success: true,
      data: result.object,
    })
  } catch (error: any) {
    console.error("AI Cleanup Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process job details with AI",
      },
      { status: 500 }
    )
  }
}
