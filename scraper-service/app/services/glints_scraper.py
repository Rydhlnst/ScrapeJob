from __future__ import annotations

from datetime import datetime
from typing import Dict, List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text


class GlintsScraper:
    BASE_URL = "https://glints.com"
    LIST_URL = "https://glints.com/id/opportunities/jobs/explore"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._http = requests.Session()
        self._http.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        })

    def scrape(self) -> List[Dict]:
        try:
            scraped_at = datetime.now(ZoneInfo(self.settings.timezone_name)).isoformat(timespec="seconds")
        except ZoneInfoNotFoundError:
            scraped_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

        try:
            response = self._http.get(self.LIST_URL, timeout=max(self.settings.page_timeout_seconds, 20))
            response.raise_for_status()
        except Exception:
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.select("a[href*='/id/opportunities/jobs/']")

        jobs: List[Dict] = []
        seen: set[str] = set()
        for link in links:
            href = (link.get("href") or "").strip()
            if not href:
                continue
            url = href if href.startswith("http") else f"{self.BASE_URL}{href}"
            if url in seen:
                continue
            seen.add(url)

            label = clean_text(link.get("aria-label", "") or link.get_text(" ", strip=True))
            if not label:
                continue

            jobs.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=",".join(self.settings.roles),
                    source_url=url,
                    title=label,
                    company="Glints",
                    location=None,
                    salary=None,
                    employment_type=None,
                    description=None,
                    description_summary=None,
                    posted_date=None,
                    raw={"source": "glints", "url": url},
                )
            )

        return jobs
