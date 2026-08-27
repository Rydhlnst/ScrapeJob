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
