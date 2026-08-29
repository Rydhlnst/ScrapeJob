from __future__ import annotations

import html as html_lib
import random
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import (
    is_valid_live_company,
    is_valid_live_job,
    matches_role_keyword,
    normalize_job_payload,
)
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date
from app.utils.logger import get_logger


class KarirScraper:
    BASE_URL = "https://karir.com"
    SEARCH_API = "https://gateway2-beta.karir.com/v2/search/opportunities"
    DETAIL_API = "https://gateway2-beta.karir.com/v1/opportunity/detail"
    PAGE_SIZE = 5

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.logger = get_logger("karir_scraper")
        try:
            self.scraped_at_iso = datetime.now(ZoneInfo(settings.timezone_name)).isoformat(timespec="seconds")
        except ZoneInfoNotFoundError:
            self.scraped_at_iso = datetime.utcnow().isoformat(timespec="seconds") + "Z"

        self._http = requests.Session()
        from app.utils.http_helper import configure_retry_session, get_random_user_agent
        configure_retry_session(self._http, settings.http_retries)
        self._http.headers.update({
            "User-Agent": get_random_user_agent(),
            "Accept": "application/json",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/",
        })
        if settings.proxy:
            self._http.proxies.update({"http": settings.proxy, "https": settings.proxy})

    def scrape(self) -> List[Dict[str, Any]]:
        jobs: List[Dict[str, Any]] = []
        seen_ids: set[int] = set()

        for role in self.settings.roles:
            for page in range(1, self.settings.max_pages + 1):
                opportunities = self._search(role, page)
                if not opportunities:
                    break

                for opportunity in opportunities:
                    opportunity_id = opportunity.get("id")
                    if not isinstance(opportunity_id, int) or opportunity_id in seen_ids:
                        continue
                    seen_ids.add(opportunity_id)

                    title = clean_text(str(opportunity.get("job_position") or ""))
                    company = clean_text(str(opportunity.get("company_name") or ""))
                    if not title or not is_valid_live_company(company):
                        continue
                    if not matches_role_keyword(role, title, str(opportunity.get("description") or "")):
                        continue

                    source_url = f"{self.BASE_URL}/opportunities/{opportunity_id}"
                    detail = self._detail(opportunity_id)
                    title = clean_text(str(detail.get("job_position") or title))
                    company = clean_text(str(detail.get("company_name") or company))
                    if not matches_role_keyword(role, title, str(detail.get("responsibilities") or "")):
                        continue
                    if not is_valid_live_job(
                        source=self.settings.source,
                        source_url=source_url,
                        title=title,
                        company=company,
                    ):
                        self.logger.warning("Skipping unverified Karir listing url=%s", source_url)
                        continue

                    posted_date = parse_posted_date(
                        str(detail.get("posted_at") or opportunity.get("posted_at") or ""),
                        self.settings.timezone_name,
                    )
                    description = self._html_to_text(
                        f"{detail.get('responsibilities') or ''} {detail.get('requirements') or ''}"
                    )
                    jobs.append(
                        normalize_job_payload(
                            source=self.settings.source,
                            scraped_at_iso=self.scraped_at_iso,
                            role_keyword=role,
                            source_url=source_url,
                            title=title,
                            company=company,
                            location=clean_text(str(detail.get("location") or opportunity.get("description") or "")) or None,
                            salary=self._salary(detail),
                            employment_type=clean_text(str(detail.get("job_type") or "")) or None,
                            description=description or None,
                            description_summary=self._html_to_text(str(detail.get("requirements") or "")) or None,
                            posted_date=posted_date,
                            raw={"source": "karir", "opportunity_id": opportunity_id, "page": page},
                        )
                    )
                    self._sleep_delay()

        return jobs

    def _search(self, role: str, page: int) -> List[Dict[str, Any]]:
        payload = {
            "keyword": role,
            "location_ids": [], "company_ids": [], "industry_ids": [],
            "job_function_ids": [], "degree_ids": [], "locale": "id",
            "limit": self.PAGE_SIZE,
            "offset": (page - 1) * self.PAGE_SIZE,
            "level": "", "min_employee": 0, "max_employee": 50,
            "is_opportunity": True, "sort_order": "newest",
            "is_recomendation": False, "is_preference": False,
            "is_choice_opportunity": False, "is_subscribe": False,
            "workplace": None,
        }
        try:
            response = self._http.post(
                self.SEARCH_API,
                json=payload,
                timeout=min(max(self.settings.page_timeout_seconds, 10), 20),
            )
            response.raise_for_status()
            data = response.json().get("data") or {}
            opportunities = data.get("opportunities") or []
            self.logger.info("Karir search role=%s page=%s opportunities=%s", role, page, len(opportunities))
            return opportunities if isinstance(opportunities, list) else []
        except (requests.RequestException, ValueError) as exc:
            self.logger.warning("Karir search failed role=%s page=%s: %s", role, page, exc)
            return []

    def _detail(self, opportunity_id: int) -> Dict[str, Any]:
        try:
            response = self._http.post(
                self.DETAIL_API,
                json={"opportunity_id": opportunity_id, "language": "id"},
                timeout=min(max(self.settings.detail_timeout_seconds, 10), 20),
            )
            response.raise_for_status()
            return response.json().get("data") or {}
        except (requests.RequestException, ValueError) as exc:
            self.logger.warning("Karir detail failed opportunity=%s: %s", opportunity_id, exc)
            return {}

    @staticmethod
    def _html_to_text(value: str) -> str:
        if not value:
            return ""
        decoded = html_lib.unescape(value)
        return clean_text(BeautifulSoup(decoded, "html.parser").get_text(" ", strip=True))

    @staticmethod
    def _salary(detail: Dict[str, Any]) -> Optional[str]:
        lower = detail.get("salary_lower")
        upper = detail.get("salary_upper")
        if lower and upper:
            return f"Rp {lower:,} - Rp {upper:,}".replace(",", ".")
        if lower:
            return f"Rp {lower:,}".replace(",", ".")
        if upper:
            return f"Rp {upper:,}".replace(",", ".")
        return None

    def _sleep_delay(self) -> None:
        min_s = min(self.settings.request_delay_min, self.settings.request_delay_max)
        max_s = max(self.settings.request_delay_min, self.settings.request_delay_max)
        time.sleep(random.uniform(min_s, max_s))
