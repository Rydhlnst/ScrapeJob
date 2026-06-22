# Coolify Deployment

This repo is intended to run in Coolify as one Docker Compose resource with these services:
- `frontend`
- `backend`
- `queue`
- `scheduler`
- `db`
- `redis`

Public domains:
- Frontend: `https://jobs.example.com`
- Backend API: `https://api.example.com`

## 1. Create the Coolify Resource

1. In Coolify, create a new **Docker Compose** resource.
2. Connect this repository and select the target branch.
3. Set **Compose File Path** to `./docker-compose.coolify.yml`.
4. Save the resource so Coolify detects all six services.

## 2. Configure Domains

Set domains only on the public services:
- `frontend` -> `https://jobs.example.com`
- `backend` -> `https://api.example.com`

Leave these services without public domains:
- `queue`
- `scheduler`
- `db`
- `redis`

## 3. Configure Environment Variables

Add these variables in Coolify for the Docker Compose resource.

Required:

```env
SERVICE_FQDN_FRONTEND=https://jobs.example.com
SERVICE_FQDN_BACKEND=https://api.example.com

APP_NAME=Job Loker API
APP_ENV=production
APP_KEY=base64:GENERATE_REAL_LARAVEL_KEY
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://jobs.example.com

POSTGRES_DB=job_platform
POSTGRES_USER=scrapejob
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

SANCTUM_STATEFUL_DOMAINS=jobs.example.com

SCRAPER_INTERNAL_API_TOKEN=GENERATE_LONG_RANDOM_TOKEN

AI_CLEANUP_ENABLED=true
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY

OLLAMA_BASE_URL=
OLLAMA_API_KEY=
OLLAMA_MODEL=

API_BEARER_TOKEN=
REDIS_PASSWORD=
QUEUE_TRIES=3
QUEUE_TIMEOUT=900
```

Recommended extras:

```env
SESSION_DOMAIN=.example.com
SCRAPER_ACTIVE_SOURCES=glints,jobstreet
SCRAPER_SCHEDULE_ENABLED=true
SCRAPER_SCHEDULE_CRON=0 */8 * * *
SCRAPER_PYTHON_MODE=local
SCRAPER_PYTHON_BIN=python3
ENABLE_LARAVEL_CACHE_WARMUP=true
RUN_MIGRATIONS=false
```

Notes:
- Generate `APP_KEY` with `php artisan key:generate --show`.
- Leave `REDIS_PASSWORD` empty unless you explicitly secure the Redis container with a password.
- `SCRAPER_INTERNAL_API_TOKEN` must be identical for `frontend`, `backend`, `queue`, and `scheduler`.

## 4. First Deploy

1. Save all environment variables.
2. Click **Deploy**.
3. Wait until `frontend`, `backend`, `queue`, `scheduler`, `db`, and `redis` are running.

## 5. Initialize the Database

After the stack is healthy, open the `backend` terminal in Coolify and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
```

Default admin login after seeding:
- Email: `admin@example.com`
- Password: `password`

## 6. Verify the Deployment

Check these items:
- `https://jobs.example.com` loads.
- `https://api.example.com/api/healthz` returns `200`.
- Admin login works from the frontend.
- `queue` stays running without Redis connection/auth errors.
- `scheduler` stays running.
- Backend can connect to PostgreSQL and Redis.
- AI cleanup accepts only requests with `SCRAPER_INTERNAL_API_TOKEN`.