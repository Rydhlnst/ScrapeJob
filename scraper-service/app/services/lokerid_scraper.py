from __future__ import annotations

import random
import time
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import json
import re

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date


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

                    detail = self._scrape_detail_page(link)

                    results.append(
                        normalize_job_payload(
                            source=self.settings.source,
                            scraped_at_iso=scraped_at,
                            role_keyword=role,
                            source_url=link,
                            title=detail.get("title") or title,
                            company=detail.get("company") or company_name,
                            location=detail.get("location") or location,
                            salary=detail.get("salary"),
                            employment_type=detail.get("employment_type"),
                            description=detail.get("description"),
                            description_summary=None,
                            posted_date=detail.get("posted_date"),
                            raw={
                                "source": "lokerid",
                                "query_url": url,
                                "via": "json-ld",
                                "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                            },
                        )
                    )
                    self._sleep_delay()

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

            detail = self._scrape_detail_page(link)

            results.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=role,
                    source_url=link,
                    title=detail.get("title") or title,
                    company=detail.get("company") or company,
                    location=detail.get("location") or location,
                    salary=detail.get("salary"),
                    employment_type=detail.get("employment_type"),
                    description=detail.get("description"),
                    description_summary=None,
                    posted_date=detail.get("posted_date"),
                    raw={
                        "source": "lokerid",
                        "query_url": url,
                        "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                    },
                )
            )
            self._sleep_delay()

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

                detail = self._scrape_detail_page(link)

                results.append(
                    normalize_job_payload(
                        source=self.settings.source,
                        scraped_at_iso=scraped_at,
                        role_keyword=role,
                        source_url=link,
                        title=detail.get("title") or title,
                        company=detail.get("company") or company,
                        location=detail.get("location") or location,
                        salary=detail.get("salary") or salary,
                        employment_type=detail.get("employment_type") or job_type,
                        description=detail.get("description"),
                        description_summary=None,
                        posted_date=detail.get("posted_date"),
                        raw={
                            "source": "lokerid",
                            "query_url": query_url,
                            "via": "remix-state",
                            "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                        },
                    )
                )
                self._sleep_delay()

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

    def _scrape_detail_page(self, job_url: str) -> Dict[str, Optional[str]]:
        detail: Dict[str, Optional[str]] = {
            "title": None,
            "company": None,
            "location": None,
            "salary": None,
            "employment_type": None,
            "description": None,
            "posted_date": None,
        }

        try:
            response = self._http.get(job_url, timeout=max(self.settings.detail_timeout_seconds, 20))
            response.raise_for_status()
        except Exception:
            return detail

        soup = BeautifulSoup(response.text, "html.parser")
        detail["title"] = self._pick_text(soup, ["h1", ".entry-title", "[class*='title']"])
        detail["company"] = self._pick_text(soup, [".company", "[class*='company']"])
        detail["location"] = self._pick_text(soup, [".location", "[class*='location']"])
        detail["salary"] = self._pick_text(soup, [".salary", "[class*='salary']"])
        detail["employment_type"] = self._pick_text(soup, [".job-type", "[class*='job-type']", "[class*='employment']"])
        description_node = (
            soup.select_one(".entry-content")
            or soup.select_one(".job-description")
            or soup.select_one("article")
        )
        detail["description"] = (
            clean_text(description_node.get_text("\n", strip=True)) if description_node else None
        )
        detail["posted_date"] = parse_posted_date(
            self._pick_text(soup, ["time", ".posted-date", "[class*='date']"]),
            self.settings.timezone_name,
        )

        json_ld_detail = self._extract_jobposting_json_ld(soup)
        detail["title"] = detail["title"] or json_ld_detail.get("title")
        detail["company"] = detail["company"] or json_ld_detail.get("company")
        detail["location"] = detail["location"] or json_ld_detail.get("location")
        detail["salary"] = detail["salary"] or json_ld_detail.get("salary")
        detail["employment_type"] = detail["employment_type"] or json_ld_detail.get("employment_type")
        detail["description"] = detail["description"] or json_ld_detail.get("description")
        detail["posted_date"] = detail["posted_date"] or json_ld_detail.get("posted_date")

        return detail

    def _extract_jobposting_json_ld(self, soup: BeautifulSoup) -> Dict[str, Optional[str]]:
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
                if not isinstance(obj, dict) or obj.get("@type") != "JobPosting":
                    continue

                company = None
                hiring_org = obj.get("hiringOrganization")
                if isinstance(hiring_org, dict):
                    company = clean_text(str(hiring_org.get("name") or "").strip()) or None

                location = None
                job_location = obj.get("jobLocation")
                if isinstance(job_location, dict):
                    address = job_location.get("address")
                    if isinstance(address, dict):
                        location = clean_text(str(address.get("addressLocality") or "").strip()) or None

                salary = None
                base_salary = obj.get("baseSalary")
                if isinstance(base_salary, dict):
                    value = base_salary.get("value")
                    if isinstance(value, dict):
                        salary_value = value.get("value")
                        unit = value.get("unitText")
                        if salary_value:
                            salary = clean_text(f"{salary_value} {unit or ''}") or None

                return {
                    "title": clean_text(str(obj.get("title") or "").strip()) or None,
                    "company": company,
                    "location": location,
                    "salary": salary,
                    "employment_type": clean_text(str(obj.get("employmentType") or "").strip()) or None,
                    "description": clean_text(str(obj.get("description") or "").strip()) or None,
                    "posted_date": parse_posted_date(
                        str(obj.get("datePosted") or "").strip(),
                        self.settings.timezone_name,
                    ),
                }

        return {
            "title": None,
            "company": None,
            "location": None,
            "salary": None,
            "employment_type": None,
            "description": None,
            "posted_date": None,
        }

    def _pick_text(self, soup: BeautifulSoup, selectors: List[str]) -> Optional[str]:
        for selector in selectors:
            node = soup.select_one(selector)
            if node:
                value = clean_text(node.get_text(" ", strip=True))
                if value:
                    return value
        return None

    def _sleep_delay(self) -> None:
        min_s = min(self.settings.request_delay_min, self.settings.request_delay_max)
        max_s = max(self.settings.request_delay_min, self.settings.request_delay_max)
        time.sleep(random.uniform(min_s, max_s))
