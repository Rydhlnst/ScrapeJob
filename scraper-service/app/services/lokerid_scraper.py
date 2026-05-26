from __future__ import annotations

from datetime import datetime
from typing import Dict, List
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import json
import re

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text


class LokerIdScraper:
    BASE_URL = "https://www.loker.id"

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
            f"{self.BASE_URL}/cari-lowongan-kerja?q={query}",
            f"{self.BASE_URL}/cari-lowongan-kerja?search={query}",
            f"{self.BASE_URL}/cari-lowongan-kerja?keyword={query}",
        ]

        soup = None
        url = candidate_urls[0]
        for candidate in candidate_urls:
            try:
                response = self._http.get(candidate, timeout=max(self.settings.page_timeout_seconds, 20))
                response.raise_for_status()
                candidate_soup = BeautifulSoup(response.text, "html.parser")
                # Stop at first page that has likely job links.
                if candidate_soup.select("a[href*='/lowongan-kerja/'], h3.entry-title a, h2.entry-title a"):
                    soup = candidate_soup
                    url = candidate
                    break
                # Keep first successful soup as fallback.
                if soup is None:
                    soup = candidate_soup
                    url = candidate
            except Exception:
                continue

        if soup is None:
            return []

        embedded_jobs = self._extract_jobs_from_embedded_state(soup, role, scraped_at, url)
        if embedded_jobs:
            return embedded_jobs

        links = soup.select(
            "h3.entry-title a, h2.entry-title a, a[href*='/lowongan-kerja/'], a[href*='/job/'], a[href$='.html']"
        )

        results: List[Dict] = []
        seen: set[str] = set()

        # Fallback from JSON-LD when card selectors don't match.
        if not links:
            for script in soup.select("script[type='application/ld+json']"):
                raw_text = (script.string or script.get_text() or "").strip()
                if not raw_text:
                    continue
                try:
                    payload = json.loads(raw_text)
                except Exception:
                    continue

                objects = payload if isinstance(payload, list) else [payload]
                for obj in objects:
                    if not isinstance(obj, dict):
                        continue
                    if obj.get("@type") != "JobPosting":
                        continue

                    title = clean_text(str(obj.get("title") or "").strip())
                    link = str(obj.get("url") or "").strip()
                    if not title or not link:
                        continue
                    if not link.startswith("http"):
                        link = f"{self.BASE_URL}{link}"
                    if link in seen:
                        continue
                    seen.add(link)

                    company_name = "Loker.id"
                    hiring_org = obj.get("hiringOrganization")
                    if isinstance(hiring_org, dict):
                        company_name = clean_text(str(hiring_org.get("name") or company_name))

                    location = None
                    job_location = obj.get("jobLocation")
                    if isinstance(job_location, dict):
                        address = job_location.get("address")
                        if isinstance(address, dict):
                            location = clean_text(str(address.get("addressLocality") or "")) or None

                    results.append(
                        normalize_job_payload(
                            source=self.settings.source,
                            scraped_at_iso=scraped_at,
                            role_keyword=role,
                            source_url=link,
                            title=title,
                            company=company_name,
                            location=location,
                            salary=None,
                            employment_type=None,
                            description=None,
                            description_summary=None,
                            posted_date=None,
                            raw={"source": "lokerid", "query_url": url, "via": "json-ld"},
                        )
                    )

            if results:
                return results

        for link_node in links:
            href = (link_node.get("href") or "").strip()
            if not href:
                continue
            link = href if href.startswith("http") else f"{self.BASE_URL}{href}"
            if link in seen:
                continue
            seen.add(link)

            title = clean_text(link_node.get_text(" ", strip=True))
            if not title:
                continue

            card = link_node.find_parent("article") or link_node.find_parent("div")
            company = "Loker.id"
            location = None
            if card is not None:
                company_node = card.select_one(".company") or card.select_one("[class*='company']")
                location_node = card.select_one(".location") or card.select_one("[class*='location']")
                if company_node:
                    company = clean_text(company_node.get_text(" ", strip=True))
                if location_node:
                    location = clean_text(location_node.get_text(" ", strip=True))

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
                    raw={"source": "lokerid", "query_url": url},
                )
            )

        return results

    def _extract_jobs_from_embedded_state(
        self,
        soup: BeautifulSoup,
        role: str,
        scraped_at: str,
        query_url: str,
    ) -> List[Dict]:
        for script in soup.find_all("script"):
            text = (script.string or script.get_text() or "").strip()
            if "window.__remixContext" not in text:
                continue

            match = re.search(r"window\.__remixContext\s*=\s*(\{.*\})\s*;", text, re.DOTALL)
            if not match:
                continue

            try:
                payload = json.loads(match.group(1))
            except Exception:
                continue

            candidates = self._find_job_like_objects(payload)
            if not candidates:
                continue

            results: List[Dict] = []
            seen: set[str] = set()
            for item in candidates:
                slug = str(item.get("slug") or "").strip()
                title = clean_text(str(item.get("title") or "").strip())
                company = clean_text(str(item.get("company_name") or "Loker.id").strip()) or "Loker.id"
                location = clean_text(str(item.get("location") or "").strip()) or None
                job_type = clean_text(str(item.get("job_type") or "").strip()) or None
                salary = clean_text(str(item.get("job_salary") or "").strip()) or None
                if not slug or not title:
                    continue

                link = f"{self.BASE_URL}/{slug}"
                if link in seen:
                    continue
                seen.add(link)

                results.append(
                    normalize_job_payload(
                        source=self.settings.source,
                        scraped_at_iso=scraped_at,
                        role_keyword=role,
                        source_url=link,
                        title=title,
                        company=company,
                        location=location,
                        salary=salary,
                        employment_type=job_type,
                        description=None,
                        description_summary=None,
                        posted_date=None,
                        raw={"source": "lokerid", "query_url": query_url, "via": "remix-state"},
                    )
                )

            if results:
                return results

        return []

    def _find_job_like_objects(self, node: object) -> List[dict]:
        found: List[dict] = []
        if isinstance(node, dict):
            if {"slug", "title", "company_name"}.issubset(node.keys()):
                found.append(node)
            for value in node.values():
                found.extend(self._find_job_like_objects(value))
        elif isinstance(node, list):
            for value in node:
                found.extend(self._find_job_like_objects(value))
        return found
