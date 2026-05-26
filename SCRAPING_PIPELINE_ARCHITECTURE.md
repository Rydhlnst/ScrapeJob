# JSON-First Scraping Pipeline

## Target Production Flow

```txt
Python Scraper Microservice
  -> POST /api/internal/scraped-jobs/import (Laravel)
  -> scraped_jobs (status=pending)
  -> Admin review (approve/reject/edit/publish)
  -> jobs (published only)
  -> Next.js fetch /api/jobs
```

## Responsibility Split

- Frontend (Next.js): render jobs + admin moderation UI.
- Backend (Laravel): source of truth, validation, deduplication, status transitions.
- Scraper service (Python): collect + normalize + dedupe + send payload.

## Service Structures

```txt
project-root/
  frontend/ (current repo root in this implementation)
    app/
    components/
    lib/
    src/
      data/jobs.json
      features/jobs/*
      features/admin/scraped-jobs/*
    types/job.ts

  backend/
    app/
      Http/Controllers/Api/ScrapedJobImportController.php
      Http/Controllers/Api/Admin/AdminScrapedJobController.php
      Http/Requests/ImportScrapedJobsRequest.php
      Http/Middleware/EnsureInternalApiToken.php
      Models/ScrapedJob.php
      Services/ScrapedJobImportService.php
    database/migrations/*scraped_jobs*
    routes/api.php

  scraper-service/
    app/
      main.py
      config.py
      schemas/job_schema.py
      services/jobstreet_scraper.py
      services/glints_scraper.py
      services/json_exporter.py
      services/api_client.py
      utils/cleaner.py
      utils/date_parser.py
      utils/deduplicate.py
      utils/logger.py
    output/jobs.json
    .env.example
    requirements.txt
```

## API Contracts

### Import endpoint (internal)

`POST /api/internal/scraped-jobs/import`

Headers:

- `Authorization: Bearer {SCRAPER_INTERNAL_API_TOKEN}`
- `Content-Type: application/json`
- `Accept: application/json`

Payload:

```json
{
  "source": "jobstreet",
  "scraped_at": "2026-05-23T10:00:00+07:00",
  "jobs": []
}
```

Response:

```json
{
  "success": true,
  "message": "Scraped jobs imported successfully.",
  "summary": {
    "received": 25,
    "inserted": 20,
    "duplicates": 5,
    "failed": 0
  }
}
```

### Admin endpoints

- `GET /api/admin/scraped-jobs?status=pending`
- `GET /api/admin/scraped-jobs/{id}`
- `PATCH /api/admin/scraped-jobs/{id}`
- `PATCH /api/admin/scraped-jobs/{id}/approve`
- `PATCH /api/admin/scraped-jobs/{id}/reject`
- `POST /api/admin/scraped-jobs/{id}/publish`

### Public endpoints

- `GET /api/jobs`
- `GET /api/jobs/{slug}`

## Frontend Data Modes

- Development/demo mode:
  - `NEXT_PUBLIC_JOB_DATA_MODE=json`
  - Read static `src/data/jobs.json`
- Production mode:
  - `NEXT_PUBLIC_JOB_DATA_MODE=api`
  - Read Laravel API only

## Safety Guardrails

- No login bypass.
- No CAPTCHA bypass.
- No private profile/candidate scraping.
- Request delay + pacing enabled in scraper.
- Every imported row forced to `pending` status.
- No auto publish.
