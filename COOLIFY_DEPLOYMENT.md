# Coolify Deployment — Simplified

One resource, one compose file, one env paste. Done.

- Frontend: `https://scrape.beres.io`
- Backend: `https://scrapejob.beres.io`

---

## 1. Create Resource (once)

1. Coolify Dashboard → **+ New Resource** → **Docker Compose** (from Git).
2. Pick your repo & branch.
3. Compose file location: `docker-compose.coolify.yml` *(no leading `/`)*.

That's the only file you need. It defines all 6 services:
`frontend`, `backend`, `queue`, `scheduler`, `db`, `redis` — env for backend/queue/scheduler is shared via a single YAML anchor, so there is nothing to keep in sync.

## 2. Set Domains (in Coolify UI)

| Service  | Domain                     | Port |
|----------|----------------------------|------|
| frontend | `https://scrape.beres.io`   | 3000 |
| backend  | `https://scrapejob.beres.io`| 80   |

Leave `queue`, `scheduler`, `db`, `redis` without domains.

## 3. Paste Environment Variables

Copy the entire contents of **`.env.coolify`** from the repo root into Coolify's
**Environment Variables → Bulk Import** (or paste manually).

The file is final for both domains — secrets (`APP_KEY`, `POSTGRES_PASSWORD`,
`SCRAPER_INTERNAL_API_TOKEN`, `ADMIN_PASSWORD`) are already generated.

> Keep `RUN_MIGRATIONS=true` for the first deploy — it auto-runs
> `migrate` + role & admin seeding. After the first successful deploy,
> set it to `false` and redeploy.

## 4. Deploy

Click **Deploy** and wait until all 6 services are healthy.

First build takes a while (PHP extensions + Playwright/Chromium).
Subsequent builds are cached.

## 5. Verify

- [ ] `https://scrape.beres.io` loads the homepage
- [ ] `https://scrapejob.beres.io/api/healthz` returns `{"status":"ok"}`
- [ ] `https://scrape.beres.io/admin` — login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.coolify`
- [ ] `queue` & `scheduler` containers healthy

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend unhealthy | Check `APP_KEY` and `POSTGRES_PASSWORD` are set (entrypoint exits if missing) |
| Frontend can't reach API | `NEXT_PUBLIC_API_BASE_URL` must be `https://scrapejob.beres.io` (also a build arg — rebuild after changing) |
| Migrations didn't run | Set `RUN_MIGRATIONS=true`, redeploy, then set back to `false` |
| 502 after deploy | Wait for healthchecks (60s start period), then check service logs |

---

## Files (reference)

| File | Purpose |
|---|---|
| `docker-compose.coolify.yml` | The single Coolify compose file (all services) |
| `.env.coolify` | Final env with real secrets — **never commit** (gitignored) |
| `.env.coolify.example` | Committed template with placeholders |
