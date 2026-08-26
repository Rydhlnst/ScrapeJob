from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from app.config import get_settings
from app.services.api_client import LaravelApiClient
from app.services.glints_scraper import GlintsScraper
from app.services.jobstreet_scraper import JobstreetScraper
from app.services.jobstreetexpress_scraper import JobstreetExpressScraper
from app.services.kalibrr_scraper import KalibrrScraper
from app.services.lokerid_scraper import LokerIdScraper
from app.services.json_exporter import save_json
from app.utils.deduplicate import deduplicate_jobs
from app.utils.logger import get_logger


def build_payload(
    *,
    source: str,
    roles: List[str],
    filter_by: str,
    max_pages: int,
    max_days_ago: int | None,
    start_date: str | None,
    scraped_at: str,
    jobs: List[Dict[str, Any]],
    error: str | None = None,
) -> Dict[str, Any]:
    payload = {
        "source": source,
        "scraped_at": scraped_at,
        "total": len(jobs),
        "jobs": jobs,
        "meta": {
            "roles": roles,
            "filter": {
                "type": filter_by,
                "max_pages": max_pages,
                "max_days_ago": max_days_ago,
                "start_date": start_date,
            },
        },
    }
    if error:
        payload["error"] = error
    return payload


def select_scraper(source: str, settings):
    if source == "jobstreet":
        return JobstreetScraper(settings)
    if source in {"jobstreetexpress", "jobstreet-express", "jse"}:
        return JobstreetExpressScraper(settings)
    if source == "glints":
        return GlintsScraper(settings)
    if source == "kalibrr":
        return KalibrrScraper(settings)
    if source in {"lokerid", "loker.id"}:
        return LokerIdScraper(settings)
    raise ValueError(f"Unsupported source: {source}")


def main() -> int:
    settings = get_settings()
    logger = get_logger("scraper_main", log_file=settings.json_output_path.parent / "logs" / "scraper.log")
    try:
        scraped_at = datetime.now(ZoneInfo(settings.timezone_name)).isoformat(timespec="seconds")
    except ZoneInfoNotFoundError:
        logger.warning("Timezone %s not found, fallback to UTC", settings.timezone_name)
        scraped_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    logger.info("Start scrape source=%s roles=%s max_pages=%s", settings.source, settings.roles, settings.max_pages)
    scraper = select_scraper(settings.source, settings)
    raw_jobs = scraper.scrape()
    jobs = deduplicate_jobs(raw_jobs)
    scrape_error = None
    if not jobs:
        scrape_error = (
            "No jobs extracted. The source may have returned an empty page, "
            "blocked automated requests, or changed its HTML structure."
        )
        logger.error("%s source=%s", scrape_error, settings.source)

    payload = build_payload(
        source=settings.source,
        roles=settings.roles,
        filter_by=settings.filter_by,
        max_pages=settings.max_pages,
        max_days_ago=settings.max_days_ago,
        start_date=settings.start_date,
        scraped_at=scraped_at,
        jobs=jobs,
        error=scrape_error,
    )

    if settings.save_json:
        output_path = save_json(payload, settings.json_output_path)
        logger.info("JSON saved path=%s total=%s", output_path, len(jobs))

    if settings.send_to_laravel:
        if not settings.laravel_internal_api_token:
            logger.error("SEND_TO_LARAVEL=true but LARAVEL_INTERNAL_API_TOKEN empty")
            return 2

        api_payload = payload
        client = LaravelApiClient(
            import_url=settings.laravel_import_url,
            internal_token=settings.laravel_internal_api_token,
        )

        try:
            response = client.send_jobs(api_payload)
            logger.info("Laravel import response=%s", json.dumps(response, ensure_ascii=False))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed sending payload to Laravel: %s", exc)
            return 3

    logger.info("Done scrape source=%s total=%s", settings.source, len(jobs))
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
