from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", override=False)


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_int(value: str | None, default: int) -> int:
    if value is None or value.strip() == "":
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _parse_roles(value: str | None, fallback: List[str]) -> List[str]:
    if not value:
        return fallback
    roles = [item.strip() for item in value.split(",")]
    roles = [item for item in roles if item]
    return roles or fallback


@dataclass(frozen=True)
class Settings:
    source: str
    roles: List[str]
    filter_by: str
    max_pages: int
    max_days_ago: Optional[int]
    start_date: Optional[str]
    headless: bool
    request_delay_min: float
    request_delay_max: float
    page_timeout_seconds: int
    detail_timeout_seconds: int
    save_json: bool
    json_output_path: Path
    send_to_laravel: bool
    laravel_api_base_url: str
    laravel_import_path: str
    laravel_internal_api_token: str
    timezone_name: str

    @property
    def laravel_import_url(self) -> str:
        base = self.laravel_api_base_url.rstrip("/")
        path = self.laravel_import_path
        if not path.startswith("/"):
            path = f"/{path}"
        return f"{base}{path}"


def get_settings() -> Settings:
    output_path = BASE_DIR / "output" / "jobs.json"

    return Settings(
        source=os.getenv("SOURCE", "jobstreet").strip().lower(),
        roles=_parse_roles(os.getenv("ROLES"), ["Data Analyst", "Data Engineer"]),
        filter_by=os.getenv("FILTER_BY", "pages").strip().lower(),
        max_pages=_parse_int(os.getenv("MAX_PAGES"), 1),
        max_days_ago=_parse_int(os.getenv("MAX_DAYS_AGO"), 30),
        start_date=(os.getenv("START_DATE") or "").strip() or None,
        headless=_parse_bool(os.getenv("HEADLESS"), True),
        request_delay_min=float(os.getenv("REQUEST_DELAY_MIN", "2")),
        request_delay_max=float(os.getenv("REQUEST_DELAY_MAX", "5")),
        page_timeout_seconds=_parse_int(os.getenv("PAGE_TIMEOUT_SECONDS"), 45),
        detail_timeout_seconds=_parse_int(os.getenv("DETAIL_TIMEOUT_SECONDS"), 45),
        save_json=_parse_bool(os.getenv("SAVE_JSON"), True),
        json_output_path=Path(os.getenv("JSON_OUTPUT_PATH", str(output_path))).resolve(),
        send_to_laravel=_parse_bool(os.getenv("SEND_TO_LARAVEL"), True),
        laravel_api_base_url=os.getenv("LARAVEL_API_BASE_URL", "http://localhost:8000/api").strip(),
        laravel_import_path=os.getenv("LARAVEL_IMPORT_PATH", "/internal/scraped-jobs/import").strip(),
        laravel_internal_api_token=os.getenv("LARAVEL_INTERNAL_API_TOKEN", "").strip(),
        timezone_name=os.getenv("SCRAPER_TIMEZONE", "Asia/Jakarta").strip(),
    )
