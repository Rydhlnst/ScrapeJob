# Coolify Full-Stack VPS Deployment

This repository is intended to run on a VPS through one Coolify Docker Compose resource.

Stack:
- `frontend` - Next.js public app
- `backend` - Laravel API public app
- `queue` - Laravel queue worker
- `scheduler` - Laravel scheduler
- `db` - PostgreSQL 16
- `redis` - Redis 7

Compose file:
- `docker-compose.coolify.yml`

Environment template:
- `.env.coolify.example`

## 1. Create the Coolify Resource

1. In Coolify, create a new `Docker Compose` resource.
2. Connect this repository and branch.
3. Set `Compose File Path` to `docker-compose.coolify.yml`.
4. Add all environment variables from `.env.coolify.example` into the Coolify environment panel.

## 2. Domains

Public services only:
- `frontend` -> `https://jobs.yourdomain.com`
- `backend` -> `https://api.yourdomain.com`

Internal-only services:
- `queue`
- `scheduler`
- `db`
- `redis`

Do not assign public domains to the internal services.

## 3. Required Values

Set these before first deploy:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://jobs.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=jobs.yourdomain.com
APP_KEY=base64:GENERATE_WITH_php_artisan_key_generate_show
POSTGRES_PASSWORD=use-a-strong-password
SCRAPER_INTERNAL_API_TOKEN=use-a-long-random-token
DEEPSEEK_API_KEY=your-deepseek-api-key
RUN_MIGRATIONS=true
```

Notes:
- `NEXT_PUBLIC_API_BASE_URL` is build-time. Changing it requires rebuild/redeploy.
- `AI_CLEANUP_URL` should stay internal: `http://frontend:3000/api/internal/clean-job`.
- `SCRAPER_INTERNAL_API_TOKEN` must match across frontend, backend, queue, and scheduler.

## 4. First Deploy

1. Save env vars in Coolify.
2. Deploy the stack.
3. Wait until `frontend`, `backend`, `db`, and `redis` are healthy.
4. After first successful deploy, change `RUN_MIGRATIONS=false`.
5. Redeploy once after that change.

## 5. First-Time Seed

Open the `backend` terminal in Coolify and run:

```bash
php artisan migrate --force
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
```

Default seeded admin:
- Email: `admin@example.com`
- Password: `password`

Change the password immediately.

## 6. Verify

Check:
- `https://jobs.yourdomain.com`
- `https://api.yourdomain.com/api/healthz`
- Admin login from frontend
- `queue` stays running
- `scheduler` stays running

## 7. Deploy Updates

For normal redeploys:
1. Keep `RUN_MIGRATIONS=false`.
2. If schema changed, temporarily set `RUN_MIGRATIONS=true` or run `php artisan migrate --force` manually.
3. Redeploy.

## 8. Troubleshooting

Frontend cannot call API:
- Check `NEXT_PUBLIC_API_BASE_URL`.
- Rebuild after changing it.

Backend unhealthy:
- Check `APP_KEY`.
- Check Postgres credentials.
- Check Coolify backend logs.

Queue or scheduler restarting:
- Usually backend is unhealthy or DB/Redis env is wrong.

AI cleanup failing:
- Keep `AI_CLEANUP_URL=http://frontend:3000/api/internal/clean-job`.
- Check `SCRAPER_INTERNAL_API_TOKEN` matches.
