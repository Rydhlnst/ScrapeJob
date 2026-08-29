from __future__ import annotations

import json
import sys
import time
import traceback
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
from app.services.karir_scraper import KarirScraper
from app.services.json_exporter import save_json
from app.utils.deduplicate import deduplicate_jobs
from app.utils.date_parser import is_date_allowed
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
    if source == "karir":
        return KarirScraper(settings)
    raise ValueError(f"Unsupported source: {source}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    settings = get_settings()
    logger = get_logger("scraper_main", log_file=settings.json_output_path.parent / "logs" / "scraper.log")
    try:
        scraped_at = datetime.now(ZoneInfo(settings.timezone_name)).isoformat(timespec="seconds")
    except ZoneInfoNotFoundError:
        logger.warning("Timezone %s not found, fallback to UTC", settings.timezone_name)
        scraped_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    logger.info(
        "Start scrape source=%s roles=%s max_pages=%s attempts=%s",
        settings.source,
        settings.roles,
        settings.max_pages,
        settings.scrape_attempts,
    )
    raw_jobs: List[Dict[str, Any]] = []
    scraper_error: str | None = None
    scrape_error: str | None = None
    for attempt in range(1, settings.scrape_attempts + 1):
        try:
            raw_jobs = select_scraper(settings.source, settings).scrape()
            scraper_error = None
        except Exception as exc:  # noqa: BLE001
            frame = next(
                (
                    line.strip()
                    for line in reversed(traceback.format_exc().splitlines())
                    if line.strip().startswith("File ")
                ),
                None,
            )
            location = f" ({frame})" if frame else ""
            scraper_error = f"{type(exc).__name__}: {exc}{location}"
            logger.exception("Scrape attempt failed attempt=%s/%s", attempt, settings.scrape_attempts)

            # Retrying a deterministic programming/data-shape error cannot
            # recover it and only obscures the original failure.
            if isinstance(exc, (TypeError, AttributeError, KeyError)):
                break

        if raw_jobs:
            break

        if attempt < settings.scrape_attempts:
            logger.warning("No jobs returned; retrying scrape attempt=%s/%s", attempt + 1, settings.scrape_attempts)
            time.sleep(min(2 ** (attempt - 1), 8))

    jobs = deduplicate_jobs(raw_jobs)
    before_date_filter = len(jobs)
    jobs = [
        job for job in jobs
        if is_date_allowed(
            job.get("posted_at"),
            max_days_ago=settings.max_days_ago,
            start_date=settings.start_date,
            timezone_name=settings.timezone_name,
        )
    ]
    if before_date_filter != len(jobs):
        logger.info(
            "Date filter removed jobs source=%s removed=%s remaining=%s",
            settings.source,
            before_date_filter - len(jobs),
            len(jobs),
        )
    if not jobs and scraper_error:
        scrape_error = f"Scraper failed after {settings.scrape_attempts} attempt(s): {scraper_error}"
    elif not jobs:
        scrape_error = (
            "No verified live jobs extracted. The source returned no usable job links, "
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
