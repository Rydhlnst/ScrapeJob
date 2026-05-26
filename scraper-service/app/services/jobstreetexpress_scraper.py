from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import json
import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text


class JobstreetExpressScraper:
    BASE_URL = "https://id.jobstreetexpress.com"
    LIST_URLS = [
        "https://id.jobstreetexpress.com/lowongan-Full-time",
        "https://id.jobstreetexpress.com/lowongan-Daily-worker",
        "https://id.jobstreetexpress.com/lowongan-Part-time?sp=trending_job_type",
    ]

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
        seen: set[str] = set()

        for list_url in self.LIST_URLS:
            try:
                response = self._http.get(list_url, timeout=max(self.settings.page_timeout_seconds, 20))
                response.raise_for_status()
            except Exception:
                continue

            soup = BeautifulSoup(response.text, "html.parser")
            cards = soup.select("a[data-automation='job-card-title']") or soup.select("a[href*='/job/']")

            for card in cards:
                href = (card.get("href") or "").strip()
                if not href:
                    continue

                link = urljoin(self.BASE_URL, href)
                if link in seen:
                    continue
                seen.add(link)

                title = clean_text(card.get_text(" ", strip=True))
                if not title:
                    continue

                wrapper = card.find_parent("article") or card.find_parent("div")
                company = self._extract_company(wrapper) or "Jobstreet Express"
                location = self._extract_location(wrapper)
                employment_type = self._derive_type_from_url(list_url)
                if not location:
                    detail = self._extract_detail_fields(link)
                    location = detail.get("location") or location
                    company = detail.get("company") or company

                jobs.append(
                    normalize_job_payload(
                        source=self.settings.source,
                        scraped_at_iso=scraped_at,
                        role_keyword=",".join(self.settings.roles),
                        source_url=link,
                        title=title,
                        company=company,
                        location=location,
                        salary=None,
                        employment_type=employment_type,
                        description=None,
                        description_summary=None,
                        posted_date=None,
                        raw={"source": "jobstreetexpress", "query_url": list_url},
                    )
                )

        return jobs

    def _extract_company(self, wrapper) -> Optional[str]:
        if wrapper is None:
            return None
        candidates = [
            "[data-automation='job-card-company']",
            "[data-automation='job-company-name']",
            "[class*='company']",
        ]
        for selector in candidates:
            node = wrapper.select_one(selector)
            if node:
                value = clean_text(node.get_text(" ", strip=True))
                if value:
                    return value
        return None

    def _extract_location(self, wrapper) -> Optional[str]:
        if wrapper is None:
            return None
        candidates = [
            "[data-automation='job-card-location']",
            "[data-automation='job-location']",
            "[class*='location']",
        ]
        for selector in candidates:
            node = wrapper.select_one(selector)
            if node:
                value = clean_text(node.get_text(" ", strip=True))
                normalized = self._normalize_location(value)
                if normalized:
                    return normalized
        return None

    def _derive_type_from_url(self, url: str) -> Optional[str]:
        lowered = url.lower()
        if "part-time" in lowered:
            return "Part Time"
        if "daily-worker" in lowered:
            return "Daily Worker"
        if "full-time" in lowered:
            return "Full Time"
        return None

    def _extract_detail_fields(self, job_url: str) -> Dict[str, Optional[str]]:
        try:
            response = self._http.get(job_url, timeout=max(self.settings.detail_timeout_seconds, 20))
            response.raise_for_status()
        except Exception:
            return {"location": None, "company": None}

        soup = BeautifulSoup(response.text, "html.parser")

        location = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-location']",
                "[data-automation='job-location']",
                "span[data-automation='jobAdLocation']",
                "[class*='location']",
            ],
        )
        company = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-company']",
                "[data-automation='job-company-name']",
                "a[data-automation='company-link']",
                "[class*='company']",
            ],
        )

        if location and company:
            return {"location": location, "company": company}

        for script in soup.select("script[type='application/ld+json']"):
            raw = (script.string or script.get_text() or "").strip()
            if not raw:
                continue
            try:
                payload = json.loads(raw)
            except Exception:
                continue

            objects = payload if isinstance(payload, list) else [payload]
            for obj in objects:
                if not isinstance(obj, dict):
                    continue
                if obj.get("@type") != "JobPosting":
                    continue

                if not company:
                    org = obj.get("hiringOrganization")
                    if isinstance(org, dict):
                        company = clean_text(str(org.get("name") or "").strip()) or company

                if not location:
                    job_loc = obj.get("jobLocation")
                    if isinstance(job_loc, dict):
                        address = job_loc.get("address")
                        if isinstance(address, dict):
                            location = clean_text(str(address.get("addressLocality") or "").strip()) or location
                break

        return {"location": self._normalize_location(location), "company": company}

    def _pick_text(self, soup: BeautifulSoup, selectors: List[str]) -> Optional[str]:
        for selector in selectors:
            node = soup.select_one(selector)
            if node:
                value = clean_text(node.get_text(" ", strip=True))
                if value:
                    return value
        return None

    def _normalize_location(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None

        cleaned = clean_text(value).strip()
        lowered = cleaned.lower()
        blocked = {
            "di mana",
            "dimana",
            "where",
            "lokasi",
            "location",
            "semua lokasi",
            "all locations",
        }

        if lowered in blocked:
            return None
        if len(cleaned) <= 2:
            return None
        return cleaned
