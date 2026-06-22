# Coolify Deployment Guide

This repo deploys on Coolify as a single **Docker Compose** resource using `docker-compose.coolify.yml`.

Services:
- `frontend` — Next.js app (public)
- `backend` — Laravel API (public)
- `queue` — Laravel queue worker (internal)
- `scheduler` — Laravel task scheduler (internal)
- `db` — PostgreSQL 16 (internal)
- `redis` — Redis 7 (internal)

---

## 1. Create the Coolify Resource

1. In Coolify, create a new **Docker Compose** resource.
2. Connect this repository and select the target branch.
3. Set **Compose File Path** to `./docker-compose.coolify.yml`.
4. Save the resource so Coolify detects all six services.

---

## 2. Configure Domains

Set domains only on the public services:

| Service    | Domain (example)              |
|------------|-------------------------------|
| `frontend` | `https://jobs.yourdomain.com` |
| `backend`  | `https://api.yourdomain.com`  |

Leave `queue`, `scheduler`, `db`, and `redis` **without** a public domain.

---

## 3. Configure Environment Variables

Add these variables in the Coolify environment variable panel for the Docker Compose resource.

### Required

```env
# === FRONTEND URLS (must be set explicitly — used at build time!) ===
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
INTERNAL_API_BASE_URL=http://backend
NEXT_PUBLIC_USE_MOCK=false

# === BACKEND APP ===
APP_NAME=Job Loker API
APP_ENV=production
APP_KEY=base64:GENERATE_THIS_WITH_php_artisan_key_generate
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://jobs.yourdomain.com

# === DATABASE ===
POSTGRES_DB=job_platform
POSTGRES_USER=scrapejob
POSTGRES_PASSWORD=CHANGE_ME_USE_STRONG_PASSWORD

# === SESSIONS / CORS ===
SANCTUM_STATEFUL_DOMAINS=jobs.yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# === REDIS ===
REDIS_PASSWORD=

# === SCRAPER ===
SCRAPER_INTERNAL_API_TOKEN=GENERATE_LONG_RANDOM_TOKEN_min_32_chars
SCRAPER_ACTIVE_SOURCES=glints,jobstreet
SCRAPER_SCHEDULE_ENABLED=true
SCRAPER_SCHEDULE_CRON=0 */8 * * *
SCRAPER_SCHEDULE_TIMEZONE=Asia/Jakarta

# === AI CLEANUP ===
AI_CLEANUP_ENABLED=true
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# === OPTIONAL — Ollama (if AI_PROVIDER=ollama) ===
OLLAMA_BASE_URL=
OLLAMA_API_KEY=
OLLAMA_MODEL=

# === OPTIONAL — Queue tuning ===
API_BEARER_TOKEN=
QUEUE_TRIES=3
QUEUE_TIMEOUT=900
LOG_LEVEL=warning
```

### Notes

> **`APP_KEY`** — generate with: `php artisan key:generate --show`
>
> **`SCRAPER_INTERNAL_API_TOKEN`** — must be identical for `frontend`, `backend`, `queue`, and `scheduler`.
>
> **`REDIS_PASSWORD`** — leave empty if you're not securing the Redis container with a password.
>
> **`NEXT_PUBLIC_API_BASE_URL`** — this is baked into the Next.js build. Must match the exact public URL of your backend.

---

## 4. First Deploy

### Step 1 — Enable Migrations for First Deploy

Add this variable **only for the first deploy**, then set it back to `false`:

```env
RUN_MIGRATIONS=true
```

### Step 2 — Deploy

1. Save all environment variables.
2. Click **Deploy**.
3. Wait until all 6 services are **Running** and healthy.

### Step 3 — Disable Auto-Migration

After the first deploy succeeds, set:

```env
RUN_MIGRATIONS=false
```

Then redeploy (or just leave it — subsequent deploys will skip migration automatically).

---

## 5. Seed the Database (First Time Only)

After the stack is healthy, open the **`backend`** terminal in Coolify and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
```

Default admin credentials after seeding:
- **Email:** `admin@example.com`
- **Password:** `password`

> Change the admin password immediately after first login.

---

## 6. Verify the Deployment

Check each item:

- [ ] `https://jobs.yourdomain.com` loads correctly
- [ ] `https://api.yourdomain.com/api/healthz` returns HTTP `200`
- [ ] Admin login works from the frontend
- [ ] `queue` container stays running (check Coolify logs)
- [ ] `scheduler` container stays running (check Coolify logs)
- [ ] AI cleanup endpoint returns `403` without token, `200` with correct token

---

## 7. Subsequent Deploys

For all future deploys after the first:

1. Ensure `RUN_MIGRATIONS=false` (default).
2. If you have schema changes, either:
   - Set `RUN_MIGRATIONS=true` temporarily, or
   - Run `php artisan migrate --force` manually from the Coolify terminal.
3. Click **Redeploy** in Coolify.

---

## Troubleshooting

### Frontend can't reach API

- Confirm `NEXT_PUBLIC_API_BASE_URL` is set to the **exact** backend public URL (with `https://`, no trailing slash).
- This value is baked at **build time** — changing it requires a **rebuild**.

### Backend fails to start (unhealthy)

- Check `APP_KEY` is set and valid.
- Ensure `POSTGRES_PASSWORD` matches between `backend` and `db`.
- Check Coolify logs for the `backend` container.

### Queue/Scheduler keeps restarting

- They wait for `backend` to be healthy first. If `backend` is unhealthy, they won't start.
- Ensure `REDIS_PASSWORD` is consistent — empty string if Redis has no auth.

### Database connection refused

- `DB_HOST` should be `db` (the compose service name) — this is hardcoded in the compose file.
- Ensure `POSTGRES_USER` and `POSTGRES_PASSWORD` match exactly.