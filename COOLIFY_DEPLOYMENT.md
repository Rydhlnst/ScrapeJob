# Panduan Deployment ScrapeJob di VPS dengan Coolify

Panduan ini menjelaskan langkah demi langkah untuk mendeploy monorepo **ScrapeJob** ke VPS menggunakan **Coolify** berbasis Docker Compose.

---

## 1. Prasyarat Sebelum Deploy

1.  **VPS dengan Coolify**: Pastikan Coolify sudah terinstal dan berjalan di VPS Anda.
2.  **DNS Records**: Arahkan subdomain Anda ke IP Address VPS Anda di penyedia DNS (misal: Cloudflare):
    *   `jobs.example.com` (A Record -> IP VPS) untuk Frontend.
    *   `api.example.com` (A Record -> IP VPS) untuk Backend API.
3.  **Repository Terhubung**: Sambungkan akun GitHub/GitLab Anda ke Coolify.

---

## 2. Membuat Resources di Coolify

1.  Buka dashboard Coolify Anda.
2.  Pilih atau buat **Project** baru, lalu buat **Environment** baru (misal: `production`).
3.  Klik **New Resource** -> Pilih **Docker Compose**.
4.  Pilih **Git Repository** Anda, lalu pilih branch (misal: `main` atau `master`).
5.  Pada kolom **Compose File Path**, arahkan ke: `./docker-compose.coolify.yml`.
    *(Atau jika Anda ingin menyalin manual, pilih opsi isi kosong lalu tempel konten dari file `docker-compose.coolify.yml`).*
6.  Klik **Save**. Coolify akan menganalisis file compose dan mendeteksi service-service yang dideklarasikan.

---

## 3. Konfigurasi Domain (FQDN) di Dashboard Coolify

Coolify mendeteksi service web (`frontend` dan `backend`) dan memproses SSL secara otomatis. Atur domain untuk masing-masing service di halaman konfigurasi Coolify:

1.  **Frontend (Next.js)**:
    *   Cari service bernama `frontend`.
    *   Isi kolom **Domains** dengan URL lengkap menggunakan `https`:
        `https://jobs.example.com` (tanpa port, Coolify otomatis mengarahkan ke port internal `3000`).
2.  **Backend (Laravel)**:
    *   Cari service bernama `backend`.
    *   Isi kolom **Domains** dengan URL lengkap:
        `https://api.example.com` (Coolify otomatis mengarahkan ke port internal `80`).
3.  **Service Lainnya (`queue`, `scheduler`, `db`, `redis`)**:
    *   Biarkan kolom domain kosong karena service ini tidak membutuhkan eksposur publik (hanya diakses via jaringan internal Docker).

---

## 4. Konfigurasi Environment Variables di Coolify

Buka tab **Environment Variables** di dashboard project Coolify Anda, lalu tambahkan variabel-variabel berikut (pastikan tipenya diatur untuk **Build-Time** dan **Runtime** sesuai kebutuhan):

| Nama Variabel | Tipe (Build / Runtime) | Keterangan | Contoh Nilai |
| :--- | :--- | :--- | :--- |
| `APP_KEY` | Runtime | Key Laravel untuk enkripsi | `base64:random_generated_key...` |
| `POSTGRES_DB` | Runtime | Nama database PostgreSQL | `job_platform` |
| `POSTGRES_USER` | Runtime | Username PostgreSQL | `scrapejob` |
| `POSTGRES_PASSWORD`| Runtime | Password PostgreSQL | `password_aman_anda` |
| `SCRAPER_INTERNAL_API_TOKEN` | Build & Runtime | Token komunikasi Laravel & Scraper | `token_random_panjang_dan_aman` |
| `SANCTUM_STATEFUL_DOMAINS` | Runtime | Domain frontend tanpa protokol | `jobs.example.com` |
| `AI_CLEANUP_ENABLED` | Runtime | Aktifkan pembersihan data lowongan otomatis | `true` |
| `AI_PROVIDER` | Runtime | Pilihan Provider AI (`deepseek` atau `ollama`) | `deepseek` atau `ollama` |
| `DEEPSEEK_API_KEY` | Runtime | API Key DeepSeek (jika `AI_PROVIDER=deepseek`) | `sk-deepseek-...` |
| `OLLAMA_BASE_URL` | Runtime | URL Endpoint API Ollama (jika `AI_PROVIDER=ollama`) | `http://vps-ip:11434/v1` atau URL Cloud |
| `OLLAMA_API_KEY` | Runtime | API Key Ollama (jika diperlukan) | `ollama` (default jika kosong) |
| `OLLAMA_MODEL` | Runtime | Nama Model Ollama yang akan digunakan | `llama3` atau `mistral` |

*Catatan: Anda dapat membuat `APP_KEY` secara lokal terlebih dahulu dengan menjalankan perintah `php artisan key:generate --show` di komputer lokal Anda.*

---

## 5. Deployment Pertama

Setelah domain dan environment variables terkonfigurasi:

1.  Klik tombol **Deploy** di pojok kanan atas dashboard Coolify Anda.
2.  Coolify akan melakukan clone repository, membangun image Docker dari [Dockerfile](file:///d:/Projects/Freelance/ScrapeJob/Dockerfile) (Next.js) dan [Dockerfile](file:///d:/Projects/Freelance/ScrapeJob/backend/Dockerfile) (Laravel), dan menyalakan semua container.
3.  Pantau logs build untuk memastikan proses kompilasi berjalan sukses.

---

## 6. Inisialisasi Database (Langkah Wajib Setelah Container Aktif)

Karena opsi `RUN_MIGRATIONS` disetel ke `false` di konfigurasi produksi untuk menghindari race condition, Anda harus menjalankan migrasi database dan seeding awal secara manual setelah container berstatus `Running`:

1.  Di Coolify, klik service `backend`.
2.  Buka tab **Terminal** (atau gunakan console container).
3.  Jalankan perintah berikut secara berurutan:
    ```bash
    # 1. Jalankan Migrasi Database
    php artisan migrate --force

    # 2. Jalankan Seeder Role & Permission
    php artisan db:seed --class=RolePermissionSeeder --force

    # 3. Jalankan Seeder Akun Admin Default
    php artisan db:seed --class=AdminUserSeeder --force
    ```

Setelah langkah di atas selesai, Anda dapat login ke panel admin di `https://jobs.example.com/admin` dengan kredensial default:
*   **Email**: `admin@example.com`
*   **Password**: `password`

---

## 7. Pemantauan & Skala Kerja (Scaling)

*   **Log Antrean (Queue Logs)**: Untuk memantau hasil scraping background, buka tab logs pada service `queue`.
*   **Log Penjadwalan (Scheduler Logs)**: Buka logs service `scheduler` untuk melihat trigger otomatis scraping setiap 8 jam.
*   **Backup Database**: Anda dapat memanfaatkan fitur **Backup** bawaan di dashboard database postgres Coolify untuk melakukan pencadangan harian otomatis.
