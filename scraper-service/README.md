# Scraper Service

Python microservice for job scraping with JSON-first pipeline.

## Run

```bash
cd scraper-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app/main.py
```

When native HTTP and browser extraction return no jobs, the scraper can use
Firecrawl as a final fallback. Set `FIRECRAWL_API_KEY` in the runtime secret
store; leave it empty to disable the fallback.

Transient HTTP failures are retried up to `HTTP_RETRIES` times (default: 3),
and an empty scrape is retried up to `SCRAPE_ATTEMPTS` times (default: 2).

## Output

- Main output: `output/jobs.json`
- Log file: `output/logs/scraper.log`

## Data Flow

1. Scraper collects public job data from source pages.
2. Data normalized to JSON shape (`meta` + `data`).
3. Deduplicate by `external_id` and `source_url`.
4. Save local JSON (debug/development).
5. Optional send payload to Laravel internal endpoint.

## Guardrails

- No login bypass.
- No CAPTCHA bypass.
- No private candidate/user profile scraping.
- Add random delay to avoid aggressive traffic.
- Keep source attribution (`source_url`, `source`).
- Imported jobs are auto-published to Laravel and can appear on the public jobs page immediately.
