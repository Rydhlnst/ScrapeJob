# Production Admin Dashboard QA Report

Date: 2026-08-28 (Asia/Jakarta)
Target: https://scrape.beres.io/admin
Browser: Playwright Chromium

## Overall result

Core staging checks PASS after deployment commit `bfecfe0`: the dashboard API returns `200`, `scrape.beres.io` resolves to `Lowonganku.com`, and public jobs render. The broader QA has two application follow-ups and one alias TLS finding listed below.

## Findings

### Resolved: dashboard API returns 404

- Rerun: `GET https://scrapejob.beres.io/api/admin/dashboard` returned `200`.
- `/admin/dashboard` rendered global and selected-website metrics.
- Browser console reported zero errors.

### Resolved: staging hostname does not resolve to the selected public website

- `scrape.beres.io` resolves to the `Lowonganku.com` website record.
- `GET /api/site-config` returned `200` with `Lowonganku.com` branding.
- The public landing page and the published Backend Laravel Developer job rendered successfully.
- Job metadata now includes `Lowonganku.com`.

### High: `www.scrape.beres.io` has a TLS deployment failure

- Playwright navigation failed before the application loaded with `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.
- This must be fixed in the Coolify/proxy/domain certificate configuration; it is not an application route error.
- Evidence: `www-scrape-tls-failure.png`.

### Medium: Lowonganku-specific copy remains in a multi-site admin view

- The job editor live-preview description states that HTML will appear on `lowonganku.com`.
- This should use the active website name/domain.

### Medium: repeated Tiptap warnings

- Six warnings reported duplicate extension names: `link` and `underline`.
- No JavaScript errors occurred on the tested job editor route, but the duplicate extensions can cause editor behavior conflicts.

### Low: new-page preview prefetches an invalid `/page` URL

- Opening `/admin/pages/new` caused a `404` request for `https://scrape.beres.io/page?_rsc=...`.
- The new-page form itself loaded, but its initial public preview link has no slug yet and should not prefetch an invalid route.

### Operational data finding: historical scraper failures are visible

- The failed status filter worked and returned only failed runs.
- Existing history contains jobstreet `NoneType ... len()` errors, older Python `IndentationError` failures, and “No verified live jobs extracted” results for some sources.
- No new scraper run was triggered.

### Current live source snapshot

- `glints`: active/allowed; latest visible run succeeded with 14/14 successful items.
- `jobstreetexpress`: active/allowed; latest visible run succeeded with 3/3 successful items.
- `jobstreet`: active/allowed; latest visible runs failed with `NoneType ... len()`.
- `lokerid`: active/allowed; latest visible runs failed because no verified live jobs were extracted.
- `kalibrr`: active/allowed; latest visible runs failed because no verified live jobs were extracted.

## Rerun evidence

- Desktop dashboard: `/admin/dashboard` rendered with `GET /api/admin/dashboard => 200`.
- Website registry: `/admin/websites` displayed `scrape.beres.io` and `www.scrape.beres.io` under `Lowonganku.com`.
- Public landing page: `/` rendered Lowonganku branding, categories, landing content, and jobs.
- Public job detail: `/jobs/backend-laravel-developer-nusantara-tech-jakarta` rendered with Lowonganku metadata.
- Scrape filters: `Failed` and `Success` both rendered the matching records and requested filtered log APIs with `200` responses.
- Job search: keyword filtering updated the URL and requested `GET /api/admin/jobs?keyword=... => 200`.
- Job source filter: `Glints` updated the URL, displayed only Glints rows, and requested `GET /api/admin/jobs?source=Glints... => 200`.
- Job editor/preview: existing draft loaded, website-specific fields and preview opened, with zero JavaScript errors.
- Raw-data status filters: duplicate/pending/approved/rejected/published requests all returned `200`; duplicate state rendered an empty-state correctly.
- Landing CMS: active-site landing content loaded with editable Hero fields and Save/Publish controls.
- New-page form: fields, editor, draft/publish controls loaded; no record was created.
- `www.scrape.beres.io`: application-level verification blocked by TLS error.
- Mobile dashboard: 390x844 rendered and the sidebar drawer opened successfully.
- No scraper run was triggered.

## Passed checks

- Initial unauthenticated `/admin` request redirected once to `/admin/login`.
- Admin login succeeded and routed to `/admin/dashboard`.
- Logout worked; post-logout dashboard access redirected to `/admin/login?next=%2Fadmin%2Fdashboard`.
- Read-only routes and their primary API requests returned successfully: jobs, raw data, scrape runs, CMS, pages, categories, locations, job sources, websites, general settings, users, API, notifications, and audit logs.
- Scrape run status filtering returned `Failed` records and issued `GET /api/admin/scrape-runs?status=failed`.
- Website switching changed the selected context from `KerjaResmi.com` to `Lowonganku.com`; the selected-site job data changed accordingly.
- Mobile layout hid the sidebar and the `Toggle Sidebar` control opened the mobile sidebar.
- English language toggle changed the admin sidebar copy and logout label.
- Temporary category: create, edit, delete passed; fixture removed.
- Temporary location: create, edit, delete passed; fixture removed.
- Temporary page: draft create/save and delete passed; fixture removed.
- Temporary API key: generate and delete passed; fixture removed.
- Temporary editor user: create, edit, delete passed; fixture removed.
- Public page inspection confirmed the admin website ID remained in local storage but the public page did not use it to select a public site.

## Deliberately skipped

- Live scraper execution.
- Publishing/unpublishing, rejecting, or deleting existing jobs.
- Editing existing published landing content, branding, domain records, or real settings.
- Testing production domain configuration changes.

## Evidence

- `admin-dashboard-blocker.png`: dashboard API 404 state.
- `public-staging-job-404.png`: published admin job unavailable on the staging public hostname.
- `public-staging-bare-live.png`: current staging landing page on `scrape.beres.io`.
- `www-scrape-tls-failure.png`: current TLS failure on the `www` alias.
- Playwright snapshots, console logs, and network evidence were captured by the Playwright browser session.

## Recommended fixes

1. Replace hardcoded `lowonganku.com` text in the job editor with the active website configuration.
2. Remove duplicate Tiptap `link` and `underline` extensions.
3. Re-run controlled publication-isolation tests with dedicated test data before enabling another public domain.

## Live Playwright QA rerun — 28 August 2026

Target: `https://scrape.beres.io` using the configured staging hostname. This rerun was read-only except for login/logout and reversible website-selector changes. No scraper was started and no existing records were edited or deleted.

### Progress score

- Strict feature pass rate: **93.3% (28/30 checks passed)**.
- Partial: Landing CMS route loads and Hero fields can be edited, but only the Hero section was exposed in the live UI during this run; the expected broader section set was not visible.
- Failed: `https://www.scrape.beres.io` cannot be tested at application level because the alias returns `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.
- This is a tested-feature score, not a claim that all scraper sources are healthy.

### Feature matrix

| Area | Result | Evidence |
|---|---|---|
| Admin redirect and login | PASS | `/admin` redirected once to `/admin/login`; login reached `/admin/dashboard`. |
| Logout and session protection | PASS | Logout returned to `/admin/login`; authenticated dashboard APIs returned `200` after login. |
| Dashboard global metrics | PASS | Master metrics rendered; `/api/admin/dashboard` returned `200`. |
| Dashboard selected-site metrics | PASS | Lowonganku.com and DaftarKerja.id metrics changed with the selector. |
| Website switching | PASS | Selector changed site context and persisted through the admin session. |
| Public isolation from admin selection | PASS | After selecting DaftarKerja.id in admin, public `scrape.beres.io` still rendered Lowonganku.com. |
| Jobs list | PASS | Draft list loaded with 50 items and job links. |
| Jobs search | PASS | Keyword search reduced rows to matching Data Analyst jobs. |
| Job editor | PASS | Existing draft opened with website-specific fields, category, article blocks, and save/publish controls. |
| Job preview | PASS | Existing draft preview rendered with `Job Preview | Lowonganku.com`. |
| Raw-data review | PASS | Queue and status view loaded without an API error. |
| Scrape-run list | PASS | Runs and log table loaded from `/api/admin/scrape-runs` with `200`. |
| Success filter | PASS | Only Success rows appeared after selecting the filter. |
| Failed filter | PASS | Failed rows appeared with source error messages. |
| Pages | PASS | Page list and create-page form loaded; no production page was created. |
| Categories | PASS | Website-scoped category list loaded. |
| Locations | PASS | Location list and CRUD controls loaded. |
| Job sources | PASS | Five configured sources loaded with active/allowed state. |
| Website registry and aliases | PASS | `scrape.beres.io` and `www.scrape.beres.io` are registered under Lowonganku.com. |
| General settings | PASS | Branding and behavior fields loaded for the selected website. |
| Users and roles | PASS | User list loaded. |
| API settings | PASS | AI configuration and API-key area loaded; no secret values were recorded. |
| Notifications | PASS | Trigger and recipient settings loaded. |
| Audit log | PASS | Audit entries and previous reversible QA activity loaded. |
| Public home | PASS | Lowonganku branding, landing content, categories, and jobs rendered. |
| Public jobs list | PASS | Jobs, filters, and job links rendered. |
| Public job detail | PASS | Description, metadata, source, and SEO title rendered. |
| Public blog/contact/user login | PASS | Routes loaded with dynamic titles and expected content. |
| Mobile dashboard | PASS | 390x844 rendered without horizontal overflow; sidebar drawer opened. |
| Dynamic tab names | PASS | Route titles include the current site name, e.g. `Dashboard | Lowonganku.com`, `Jobs | Lowonganku.com`, and `Contact | Lowonganku.com`. |
| `www` public alias | FAIL | TLS handshake failed before the application loaded. |
| Landing CMS section coverage | PARTIAL | Hero editor loaded; broader landing sections were not exposed in the live UI. |

### Current scraper-source health

The latest visible completed run for each configured source was healthy for **2/5 sources (40%)**:

- Healthy: `glints`, `jobstreetexpress`.
- Failing: `jobstreet` (`NoneType ... len()`), `lokerid` (no verified live jobs), `kalibrr` (no verified live jobs).

No new scraper run was triggered during QA, so this is based on existing production history.

### New evidence

- `live-rerun-dashboard.png`
- `live-rerun-home.png`
- `live-rerun-mobile.png`
- `live-www-tls-failure.png`

### Recommended next actions

1. Fix the `www.scrape.beres.io` certificate/domain attachment in Coolify, then rerun the alias check.
2. Expose and verify all intended Landing CMS sections beyond Hero.
3. Fix the three failing scraper source handlers before treating scraper operations as production-ready.
