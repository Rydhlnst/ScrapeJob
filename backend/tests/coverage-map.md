# Test Coverage Map - Phase 1 Laravel API

| ID Skenario | Deskripsi | Target | Status |
|---|---|---|---|
| AC-01 | Login valid mengembalikan token + user payload | `routes/api.php#POST /api/auth/login` | OK Covered |
| AC-02 | Login invalid ditolak dengan 401 | `routes/api.php#POST /api/auth/login` | OK Covered |
| AC-03 | Endpoint `me` mengembalikan user terautentikasi | `routes/api.php#GET /api/auth/me` | OK Covered |
| AC-04 | Logout mencabut token aktif | `routes/api.php#POST /api/auth/logout` | OK Covered |
| AC-05 | Public jobs hanya menampilkan status published | `app/Http/Controllers/Api/Public/JobController.php#index` | OK Covered |
| AC-06 | Detail public job unpublished mengembalikan 404 | `app/Http/Controllers/Api/Public/JobController.php#show` | OK Covered |
| AC-07 | Admin jobs membutuhkan auth sanctum | `routes/api.php#GET /api/admin/jobs` | OK Covered |
| AC-08 | Admin jobs membutuhkan permission `view jobs` | `routes/api.php#GET /api/admin/jobs` | OK Covered |
| AC-09 | Workflow publish/unpublish mengubah status + published_at | `app/Http/Controllers/Api/Admin/JobController.php#publish/unpublish` | OK Covered |
| AC-10 | Trigger scrape ditolak jika `scraping_allowed=false` | `app/Http/Controllers/Api/Admin/ScrapeRunController.php#run` | OK Covered |
| AC-11 | Trigger scrape placeholder membuat scrape run + log | `app/Http/Controllers/Api/Admin/ScrapeRunController.php#run` | OK Covered |

## Success Index
- Total skenario PRD (Phase 1 subset yang dites): 11
- Ter-cover: 11
- Success Index: 100%

## Not Covered Yet
- Rate limit assertions spesifik (login/scrape-run) belum diuji kuantitatif.
- CRUD lengkap categories/job-sources belum dibuat test dedicated.
- Filter/sort/pagination detail untuk public/admin jobs belum dites menyeluruh.
