# Coolify Deployment

Use a single Coolify Docker Compose resource.

Compose file:
- `docker-compose.coolify.yml`

Do not split `web`, `queue`, `scheduler`, and `infra` into separate resources unless you also manage cross-resource networking yourself.

## 1. Create Resource

Create 1 Coolify Docker Compose resource from the same repository and branch.

1. `app`
   - Compose file: `docker-compose.coolify.yml`

Use the repo-relative path in Coolify.
Do not prefix the compose file path with `/`.

## 2. Domains

Public domains:
- `frontend` -> `https://jobs.yourdomain.com`
- `backend` -> `https://api.yourdomain.com`

No public domains:
- `queue`
- `scheduler`
- `db`
- `redis`

## 3. Recommended Order

1. Configure environment variables
2. Deploy `app`
3. Verify `frontend`, `backend`, `db`, `redis`, `queue`, and `scheduler` are healthy
4. Run migrations and seeders manually in `backend`

## 4. Environment

Use this core application configuration:

```env
APP_NAME=Job Loker API
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_WITH_php_artisan_key_generate_show
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://jobs.yourdomain.com
SESSION_DRIVER=database
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=jobs.yourdomain.com
CACHE_STORE=database
QUEUE_CONNECTION=database
SCRAPER_INTERNAL_API_TOKEN=use-a-long-random-token
SCRAPER_PYTHON_MODE=local
SCRAPER_PYTHON_BIN=python3
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning
ENABLE_LARAVEL_CACHE_WARMUP=true
```

## 5. Database and Redis

With the single Compose resource, use the internal service names directly:

```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=job_platform
DB_USERNAME=postgres
DB_PASSWORD=your-password

REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

Set the matching Postgres container values too:

```env
POSTGRES_DB=job_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
```

## 6. Required Variables

Required for `docker-compose.coolify.yml`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
INTERNAL_API_BASE_URL=http://backend
NEXT_PUBLIC_USE_MOCK=false
RUN_MIGRATIONS=false
AI_CLEANUP_ENABLED=false
AI_CLEANUP_URL=http://frontend:3000/api/internal/clean-job
```

Notes:
- `NEXT_PUBLIC_API_BASE_URL` is build-time. Rebuild after changing it.
- Keep `RUN_MIGRATIONS=false` for first deploy.
- Run migrations manually from the `backend` terminal after the stack is healthy.
- Keep `RUN_MIGRATIONS=false` after migration unless you intentionally need startup-time migration on a later deploy.

## 7. Queue and Scheduler Variables

```env
QUEUE_TRIES=3
QUEUE_TIMEOUT=900
SCRAPER_SCHEDULE_ENABLED=true
SCRAPER_SCHEDULE_CRON=0 */8 * * *
SCRAPER_SCHEDULE_TIMEZONE=Asia/Jakarta
```

## 8. First-Time Setup

Use `.env.coolify.example` as the starting point for the resource environment.

After the stack is healthy, open the `backend` terminal and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan optimize:clear
```

Do not enable `RUN_MIGRATIONS` for the initial deploy.

If you temporarily enable it for a later schema rollout, turn it back to:

```env
RUN_MIGRATIONS=false
```

after the deployment completes and redeploy the stack.

## 9. Rollback

- If deploy fails before migration, redeploy the previous image/config.
- If migration fails, stop the rollout, restore the database from backup or snapshot, and redeploy the last known good stack.

## 10. Verification

Check:
- frontend homepage works
- `https://api.yourdomain.com/api/healthz` returns success
- admin login works
- `queue` stays running
- `scheduler` stays running
