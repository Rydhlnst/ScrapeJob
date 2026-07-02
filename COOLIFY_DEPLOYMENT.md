# Coolify Split Deployment

This repository can be deployed to Coolify as 4 smaller Docker Compose resources instead of one heavy stack.

Resources:
- `web` -> `frontend` + `backend`
- `queue` -> Laravel worker
- `scheduler` -> Laravel scheduler
- `infra` -> PostgreSQL + Redis

Compose files:
- `docker-compose.coolify.web.yml`
- `docker-compose.coolify.queue.yml`
- `docker-compose.coolify.scheduler.yml`
- `docker-compose.coolify.infra.yml`

Legacy all-in-one file:
- `docker-compose.coolify.yml`

## 1. Create Resources

Create 4 Coolify Docker Compose resources from the same repository and branch.

1. `infra`
   - Compose file: `docker-compose.coolify.infra.yml`
2. `web`
   - Compose file: `docker-compose.coolify.web.yml`
3. `queue`
   - Compose file: `docker-compose.coolify.queue.yml`
4. `scheduler`
   - Compose file: `docker-compose.coolify.scheduler.yml`

Use repo-relative paths in Coolify.
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

1. Deploy `infra`
2. Deploy `web`
3. Run migrations and seeders in `backend`
4. Deploy `queue`
5. Deploy `scheduler`

## 4. Shared Environment

Use the same core application values across `web`, `queue`, and `scheduler`:

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

## 5. Database and Redis After Split

Because resources are split, `DB_HOST=db` and `REDIS_HOST=redis` only work if Coolify provides cross-resource hostnames for those resource names in your environment.

Set these values in `web`, `queue`, and `scheduler` to the hostnames exposed by your `infra` resource:

```env
DB_CONNECTION=pgsql
DB_HOST=<infra-postgres-host>
DB_PORT=5432
DB_DATABASE=job_platform
DB_USERNAME=postgres
DB_PASSWORD=your-password

REDIS_CLIENT=phpredis
REDIS_HOST=<infra-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=
```

Use the actual service hostname shown by Coolify for the Postgres and Redis resource.

## 6. Web Resource Variables

Required for `docker-compose.coolify.web.yml`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
INTERNAL_API_BASE_URL=http://backend
NEXT_PUBLIC_USE_MOCK=false
RUN_MIGRATIONS=true
AI_CLEANUP_ENABLED=false
AI_CLEANUP_URL=http://frontend:3000/api/internal/clean-job
```

Notes:
- `NEXT_PUBLIC_API_BASE_URL` is build-time. Rebuild/redeploy after changing it.
- Keep `RUN_MIGRATIONS=true` only for first deploy or schema changes.
- After successful migration, set `RUN_MIGRATIONS=false` and redeploy `web`.

## 7. Queue Resource Variables

Required for `docker-compose.coolify.queue.yml`:

```env
QUEUE_TRIES=3
QUEUE_TIMEOUT=900
AI_CLEANUP_ENABLED=false
AI_CLEANUP_URL=https://jobs.yourdomain.com/api/internal/clean-job
```

Notes:
- When `queue` is split from `web`, it cannot reach `http://frontend:3000`.
- Use the public frontend URL for `AI_CLEANUP_URL` if AI cleanup stays enabled.
- If AI cleanup is not needed yet, keep `AI_CLEANUP_ENABLED=false`.

## 8. Scheduler Resource Variables

Required for `docker-compose.coolify.scheduler.yml`:

```env
SCRAPER_SCHEDULE_ENABLED=true
SCRAPER_SCHEDULE_CRON=0 */8 * * *
SCRAPER_SCHEDULE_TIMEZONE=Asia/Jakarta
```

## 9. Infra Resource Variables

Required for `docker-compose.coolify.infra.yml`:

```env
POSTGRES_DB=job_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=use-a-strong-password
```

## 10. First-Time Setup

After `web` is healthy, open the `backend` terminal and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan optimize:clear
```

Then set:

```env
RUN_MIGRATIONS=false
```

and redeploy `web`.

## 11. Verification

Check:
- frontend homepage works
- `https://api.yourdomain.com/api/healthz` returns success
- admin login works
- `queue` stays running
- `scheduler` stays running

## 12. Why Split

Benefits:
- smaller deployments
- easier rollback
- worker crashes do not restart web
- clearer logs per workload
- lower resource spikes during deploy
