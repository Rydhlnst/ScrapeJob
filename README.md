# ScrapeJob

Monorepo sederhana untuk platform lowongan kerja yang terdiri dari:

- `frontend` Next.js di root project
- `backend` Laravel API + admin + queue/scheduler
- `scraper-service` Python scraper yang bisa jalan mandiri atau dipanggil dari backend

## Arsitektur Singkat

- Frontend mengambil data dari Laravel API melalui `NEXT_PUBLIC_API_BASE_URL`
- Backend menyediakan endpoint public, auth, admin, dan endpoint internal untuk import hasil scraping
- Scraper Python mengumpulkan data lowongan lalu mengirimkannya ke backend melalui token internal

## Struktur Folder

- `app`, `components`, `lib`, `public`: frontend Next.js
- `backend`: Laravel API dan admin backend
- `scraper-service`: service Python untuk scraping
- `docker-compose.yml`: compose file lokal untuk frontend, backend, queue, scheduler, PostgreSQL, dan Redis
- `docker-compose.production.yml`: compose file production untuk single VPS

## Prasyarat

### Umum

- Node.js 20+ disarankan
- `pnpm` disarankan karena repo menggunakan `pnpm-lock.yaml`

### Backend Laravel

- PHP 8.3+
- Composer
- Database MySQL/MariaDB **atau** PostgreSQL
- Redis

### Scraper Python

- Python 3.11+ disarankan
- Browser dependency untuk Playwright / Selenium

## Menjalankan Project Secara Lokal

### 1) Frontend (Next.js)

Di root project:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Frontend default berjalan di:

```bash
http://localhost:3000
```

Isi env frontend yang penting:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_JOB_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
API_BEARER_TOKEN=
```

Catatan:

- Jika `NEXT_PUBLIC_USE_MOCK=true`, sebagian layer frontend bisa fallback ke mock data
- Untuk mode integrasi penuh, set `NEXT_PUBLIC_USE_MOCK=false`

### 2) Backend (Laravel)

Masuk ke folder backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Lalu jalankan server:

```bash
php artisan serve
```

Backend default berjalan di:

```bash
http://localhost:8000
```

Endpoint health check:

```bash
http://localhost:8000/up
```

### 3) Queue dan Scheduler Backend

Beberapa fitur scraping dan notifikasi bergantung pada queue dan scheduler Laravel.

Jalankan queue worker:

```bash
cd backend
php artisan queue:work
```

Jalankan scheduler saat development:

```bash
cd backend
php artisan schedule:work
```

Alternatif command bawaan composer untuk environment development Laravel:

```bash
cd backend
composer run dev
```

Command ini akan menjalankan beberapa proses sekaligus seperti:

- `php artisan serve`
- queue listener
- log tail
- Vite untuk aset backend

### 4) Redis

Pastikan Redis aktif karena backend default memakai Redis untuk koneksi cache/queue tertentu.

Contoh jika pakai Docker:

```bash
docker run --name scrapejob-redis -p 6379:6379 redis:7
```

### 5) Database

Repo ini mendukung beberapa driver Laravel. Untuk local manual, contoh env backend saat ini default ke MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job_loker
DB_USERNAME=root
DB_PASSWORD=
```

Jika ingin memakai PostgreSQL, sesuaikan menjadi:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=job_platform
DB_USERNAME=postgres
DB_PASSWORD=password
```

> Catatan: workflow Docker di repo ini memakai PostgreSQL. Workflow manual tetap bisa memakai MySQL atau PostgreSQL selama env backend disesuaikan.

### 6) Seeder Default Admin

Setelah `php artisan db:seed`, akun admin default adalah:

```text
email: admin@example.com
password: password
```

## Menjalankan Scraper Service

Scraper bisa dijalankan dalam 2 mode:

- standalone dari folder `scraper-service`
- dipicu dari backend/admin flow

### Opsi A — Jalankan scraper secara langsung

```bash
cd scraper-service
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependency dan jalankan:

```bash
pip install -r requirements.txt
cp .env.example .env
python app/main.py
```

Output scraper:

- `scraper-service/output/jobs.json`
- `scraper-service/output/logs/scraper.log`

Env scraper yang penting:

```env
LARAVEL_API_BASE_URL=http://localhost:8000/api
LARAVEL_IMPORT_PATH=/internal/scraped-jobs/import
LARAVEL_INTERNAL_API_TOKEN=secure-token
SEND_TO_LARAVEL=true
SAVE_JSON=true
```

Pastikan token ini sama dengan backend:

```env
SCRAPER_INTERNAL_API_TOKEN=secure-token
```

### Opsi B — Trigger scraping dari backend

Backend menyediakan command:

```bash
cd backend
php artisan jobs:scrape --list
php artisan jobs:scrape jobstreet
php artisan jobs:scrape glints --keyword=backend --location=jakarta
php artisan jobs:scrape jobstreet --queue
```

Backend juga punya endpoint terkait scraping:

- `POST /api/admin/scrape-runs/run`
- `GET /api/admin/scrape-runs`
- `POST /api/internal/scraped-jobs/import`

### Opsi C — Scraping terjadwal setiap 8 jam

Scheduler backend sekarang configurable via env berikut:

```env
SCRAPER_SCHEDULE_ENABLED=true
SCRAPER_SCHEDULE_CRON="0 */8 * * *"
SCRAPER_SCHEDULE_TIMEZONE=Asia/Jakarta
SCRAPER_SCHEDULE_WITHOUT_OVERLAPPING_MINUTES=480
```

Perilaku scheduler:

- berjalan setiap 8 jam secara default
- membaca `SCRAPER_ACTIVE_SOURCES`
- dispatch queue job per source aktif
- memakai `withoutOverlapping` agar run lama tidak tumpang tindih
- saat stack di-rebuild, service `migrate` menjalankan semua seeder (termasuk job sources) lalu dispatch scrape awal satu kali

Untuk server Linux tradisional, cukup jalankan cron Laravel standar:

```bash
* * * * * cd /path/to/project/backend && php artisan schedule:run >> /dev/null 2>&1
```

Kalau memakai Docker Compose, service `scheduler` sudah menjalankan:

```bash
php artisan schedule:work
```

## Urutan Menjalankan Semua Service

Urutan paling aman untuk local development:

1. Nyalakan database
2. Nyalakan Redis
3. Jalankan service initializer/migration
4. Jalankan backend Laravel
5. Jalankan queue worker dan scheduler
6. Jalankan frontend Next.js

## Menjalankan dengan Docker Compose

Workflow Docker sekarang mencakup:

- `frontend`
- `migrate` (migrations, seeders, initial scrape dispatch)
- `backend`
- `queue`
- `scheduler`
- `db`
- `redis`

Command satu kali dari root project:

```bash
pnpm run:all
```

Command ini akan:

- membuat `.env.local`, `backend/.env.docker`, dan `scraper-service/.env` jika belum ada
- menjalankan `frontend`, `backend`, `queue`, `scheduler`, `db`, dan `redis`

Command manual yang setara:

```bash
pnpm docker:up
```

Untuk mematikan semua service:

```bash
pnpm docker:down
```

Untuk menjalankan scraper manual via container terpisah:

```bash
pnpm docker:scraper
```

Catatan workflow Docker:

- backend image sudah membawa PHP, Python, dependency scraper, dan Chromium untuk Playwright
- service `backend` sekarang memakai Apache dengan document root Laravel `public/`
- service `backend` health check memakai endpoint `/api/healthz`
- service `queue` memproses job async
- service `scheduler` memicu scheduled task termasuk scraping 8 jam sekali
- frontend build memakai Next.js standalone output
- frontend build argument untuk `NEXT_PUBLIC_*` disetel saat image dibangun agar URL API tidak salah di bundle Docker

## Build untuk Production

Deployment production di repo ini sekarang memakai:

- `docker-compose.production.yml`
- `.env.production` yang di-copy dari `.env.production.example`
- manual migration sebagai langkah deploy terpisah

### 1) Siapkan env production

```bash
cp .env.production.example .env.production
```

Field yang wajib diisi sebelum deploy:

- `NEXT_PUBLIC_API_BASE_URL`
- `APP_KEY`
- `APP_URL`
- `FRONTEND_URL`
- `SANCTUM_STATEFUL_DOMAINS`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SCRAPER_INTERNAL_API_TOKEN`

Referensi variabel backend murni juga tersedia di:

```bash
backend/.env.production.example
```

### 2) Validasi compose production

```bash
pnpm docker:prod:config
```

### 3) Build image production

```bash
pnpm docker:prod:build
```

### 4) Jalankan service production

```bash
pnpm docker:prod:up
```

Service yang aktif di production compose:

- `frontend`
- `backend`
- `queue`
- `scheduler`
- `db`
- `redis`

Service opsional:

- `scraper` hanya dijalankan saat memang dibutuhkan:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml --profile scraper run --rm scraper
```

### 5) Jalankan migration secara manual

Migration, semua seeder, dan scrape awal dijalankan otomatis oleh service `migrate` saat stack dibuat ulang. Untuk menjalankan ulang secara manual:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml run --rm backend php artisan migrate --force
```

Kalau butuh seed awal di environment baru:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml run --rm backend php artisan db:seed --force
```

Untuk memicu scrape manual setelah worker aktif:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml run --rm backend php artisan jobs:scrape --queue
```

### 6) Verifikasi setelah deploy

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
docker compose --env-file .env.production -f docker-compose.production.yml logs backend --tail=100
docker compose --env-file .env.production -f docker-compose.production.yml logs frontend --tail=100
```

Checklist minimum:

- frontend merespons di port production yang dipetakan
- backend `/api/healthz` sehat
- `GET /api/jobs` merespons sukses
- halaman `/jobs` berhasil SSR tanpa request ke `127.0.0.1`
- queue dan scheduler tetap hidup setelah restart stack

## Rekomendasi Deployment

### Target yang didukung repo ini sekarang

- single VPS dengan Docker Compose production
- frontend dan backend tetap dipisah sebagai service terpisah
- database PostgreSQL dan Redis berjalan sebagai service internal compose
- scraper tetap opsional dan tidak ikut boot path utama

### Skema deployment yang sehat

- frontend membaca API publik dari `NEXT_PUBLIC_API_BASE_URL`
- frontend SSR memakai `INTERNAL_API_BASE_URL=http://backend`
- backend memakai Apache, bukan `php artisan serve`
- queue worker dan scheduler dijalankan sebagai service terpisah
- migration dijalankan manual, bukan saat container backend start
- healthcheck production memakai endpoint stateless `/api/healthz`

### Process production minimum

- web frontend
- backend web
- queue worker
- scheduler
- PostgreSQL
- Redis

## Checklist Verifikasi Lokal

Sebelum dianggap berhasil jalan, cek hal berikut:

- frontend bisa dibuka di `http://localhost:3000`
- backend health check `http://localhost:8000/api/healthz` mengembalikan sukses
- endpoint `GET /api/jobs` bisa diakses
- login admin berhasil dengan akun seeded
- queue worker aktif
- scheduler aktif
- scraper bisa menulis `output/jobs.json`
- import internal scraper ke backend berhasil

## Checklist Verifikasi Production

Sebelum dianggap siap deploy di VPS, cek hal berikut:

- `pnpm docker:prod:config` lolos tanpa env yang hilang
- tidak ada URL `localhost` atau `127.0.0.1` untuk komunikasi antar-container production
- `pnpm docker:prod:build` sukses
- `pnpm docker:prod:up` menyalakan `frontend`, `backend`, `queue`, `scheduler`, `db`, dan `redis`
- healthcheck `frontend`, `backend`, `db`, dan `redis` berubah sehat
- migration manual berhasil saat dijalankan terpisah
- `GET /api/jobs` sukses setelah deploy
- halaman `/jobs` sukses dimuat setelah restart stack

## Temuan Review Singkat

Beberapa hal yang perlu diketahui sebelum deployment:

- workflow Docker lokal dan production sekarang dipisah
- build frontend Docker sekarang menerima env publik saat build time
- backend production sekarang berjalan di Apache dan fail fast jika env wajib belum diisi
- service `migrate` menjalankan semua seeder dan dispatch scrape awal pada setiap rebuild stack
- scheduler scraping default sekarang setiap 8 jam dan bisa diubah lewat env
- konfigurasi database manual dan Docker memang dibedakan: Docker default ke PostgreSQL, local manual bebas disesuaikan
- README backend masih bawaan Laravel, jadi dokumentasi operasional memang sebaiknya dipusatkan di root README ini

## Saran Langkah Berikutnya

Kalau mau repo ini lebih siap untuk onboarding/deploy, langkah paling bernilai berikutnya adalah:

1. Tambahkan reverse proxy production (`Nginx` / `Traefik`) bila ingin TLS termination dan domain routing dalam stack yang sama
2. Pindahkan PostgreSQL dan Redis ke service terkelola jika ingin mengurangi beban operasional VPS
3. Tambahkan monitoring/log shipping untuk queue dan scraping
4. Tambahkan CI check untuk `docker compose config`, build frontend, dan syntax Laravel

