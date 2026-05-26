from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text


class KalibrrScraper:
    BASE_URL = "https://www.kalibrr.com"
    LIST_URL = "https://www.kalibrr.com/job-board/te"

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

        jobs: List[Dict] = []
        for role in self.settings.roles:
            jobs.extend(self._scrape_role(role, scraped_at))

        return jobs

    def _scrape_role(self, role: str, scraped_at: str) -> List[Dict]:
        query = quote_plus(role.strip())
        candidate_urls = [
            self.LIST_URL,
            f"{self.LIST_URL}?text={query}",
            f"{self.LIST_URL}?keyword={query}",
            f"{self.BASE_URL}/job-board/te/{query}",
        ]

        soup: Optional[BeautifulSoup] = None
        active_url = candidate_urls[0]
        for candidate_url in candidate_urls:
            try:
                response = self._http.get(candidate_url, timeout=max(self.settings.page_timeout_seconds, 20))
                response.raise_for_status()
                parsed = BeautifulSoup(response.text, "html.parser")
                if parsed.select("a.kalibrr-job-list-card") or parsed.select("a[href*='/c/']"):
                    soup = parsed
                    active_url = candidate_url
                    break
                if soup is None:
                    soup = parsed
                    active_url = candidate_url
            except Exception:
                continue

        if soup is None:
            return []

        cards = soup.select("a.kalibrr-job-list-card") or soup.select("a[href*='/c/']")

        results: List[Dict] = []
        seen: set[str] = set()
        for card in cards:
            href = (card.get("href") or "").strip()
            if not href:
                continue
            link = href if href.startswith("http") else f"{self.BASE_URL}{href}"
            if link in seen:
                continue
            seen.add(link)

            title_node = card.select_one("h3") or card.select_one("[class*='title']")
            company_node = card.select_one("h4") or card.select_one("[class*='company']")
            location_node = card.select_one("[class*='location']")

            title = clean_text(title_node.get_text(" ", strip=True)) if title_node else ""
            company = clean_text(company_node.get_text(" ", strip=True)) if company_node else "Kalibrr"
            location = clean_text(location_node.get_text(" ", strip=True)) if location_node else None

            if not title:
                continue

            results.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=role,
                    source_url=link,
                    title=title,
                    company=company,
                    location=location,
                    salary=None,
                    employment_type=None,
                    description=None,
                    description_summary=None,
                    posted_date=None,
                    raw={"source": "kalibrr", "query_url": active_url},
                )
            )

        return results
