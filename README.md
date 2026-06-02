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
- `docker-compose.yml`: compose file lokal, tapi saat ini belum lengkap untuk frontend/backend

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

Repo ini mendukung beberapa driver Laravel, tetapi contoh env backend saat ini default ke MySQL:

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

> Penting: `docker-compose.yml` saat ini memakai PostgreSQL, tetapi `backend/.env.example` masih memakai MySQL. Pilih salah satu dan samakan konfigurasinya.

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

## Urutan Menjalankan Semua Service

Urutan paling aman untuk local development:

1. Nyalakan database
2. Nyalakan Redis
3. Jalankan backend Laravel
4. Jalankan queue worker dan scheduler
5. Jalankan frontend Next.js
6. Jalankan scraper jika ingin ingest data baru

## Build untuk Production

### Frontend

```bash
pnpm install
pnpm build
pnpm start
```

### Backend

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

### Scraper

Untuk server production, jalankan scraper sebagai worker terpisah / cron / container terpisah. Karena scraper memakai browser automation, service ini lebih aman dipisah dari web server utama.

## Rekomendasi Deployment

### Opsi yang direkomendasikan

- Frontend: Vercel atau VPS Node.js
- Backend: VPS / Laravel-friendly host / container service
- Database: managed MySQL/PostgreSQL
- Redis: managed Redis atau container terpisah
- Scraper: container/job worker terpisah

### Skema deployment yang sehat

- Frontend deploy terpisah dari backend
- Backend expose API via HTTPS
- Scraper kirim hasil ke backend via `SCRAPER_INTERNAL_API_TOKEN`
- Queue worker dan scheduler dijalankan sebagai process terpisah

### Process production minimum

Backend biasanya butuh process terpisah untuk:

- web app / PHP-FPM
- queue worker
- scheduler

## Status Docker Saat Ini

`docker-compose.yml` belum siap dipakai sebagai source of truth penuh karena:

- service `frontend` melakukan `build: .`, tetapi root project belum punya `Dockerfile`
- service `backend` melakukan `build: ./backend`, tetapi folder `backend` belum punya `Dockerfile`
- hanya `scraper-service/Dockerfile` yang saat ini tersedia

Artinya:

- scraper container sudah punya dasar image
- frontend dan backend masih lebih aman dijalankan manual sampai Dockerfile-nya dibuat

## Checklist Verifikasi Lokal

Sebelum dianggap berhasil jalan, cek hal berikut:

- frontend bisa dibuka di `http://localhost:3000`
- backend health check `http://localhost:8000/up` mengembalikan sukses
- endpoint `GET /api/jobs` bisa diakses
- login admin berhasil dengan akun seeded
- queue worker aktif
- scheduler aktif
- scraper bisa menulis `output/jobs.json`
- import internal scraper ke backend berhasil

## Temuan Review Singkat

Beberapa hal yang perlu diketahui sebelum deployment:

- `docker-compose.yml` belum sinkron dengan file Docker yang tersedia
- konfigurasi database belum konsisten antara Docker (`PostgreSQL`) dan env backend example (`MySQL`)
- README backend masih bawaan Laravel, jadi dokumentasi operasional memang sebaiknya dipusatkan di root README ini

## Saran Langkah Berikutnya

Kalau mau repo ini lebih siap untuk onboarding/deploy, langkah paling bernilai berikutnya adalah:

1. Tambahkan `Dockerfile` untuk frontend
2. Tambahkan `Dockerfile` untuk backend
3. Sinkronkan pilihan database antara `.env.example` dan `docker-compose.yml`
4. Tambahkan sample deployment untuk VPS atau Vercel + Laravel API
