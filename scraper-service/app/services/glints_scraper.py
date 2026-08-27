from __future__ import annotations

import json
import random
import time
from datetime import datetime
from typing import Dict, List, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.schemas.job_schema import normalize_job_payload
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date
from app.utils.logger import get_logger


class GlintsScraper:
    BASE_URL = "https://glints.com"
    LIST_URL = "https://glints.com/id/opportunities/jobs/explore"
    LIST_URLS = (
        LIST_URL,
        "https://glints.com/id/opportunities/jobs/explore?country=ID&locationName=All%20Cities%2FProvinces",
    )

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.logger = get_logger("glints_scraper")
        self._http = requests.Session()
        from app.utils.http_helper import get_random_user_agent
        self._http.headers.update({
            "User-Agent": get_random_user_agent(),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        if self.settings.proxy:
            self._http.proxies.update({
                "http": self.settings.proxy,
                "https": self.settings.proxy,
            })

    def scrape(self) -> List[Dict]:
        try:
            scraped_at = datetime.now(ZoneInfo(self.settings.timezone_name)).isoformat(timespec="seconds")
        except ZoneInfoNotFoundError:
            scraped_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

        response = None
        active_url = self.LIST_URL
        for candidate_url in self.LIST_URLS:
            try:
                candidate_response = self._http.get(
                    candidate_url,
                    timeout=min(max(self.settings.page_timeout_seconds, 10), 20),
                )
                candidate_response.raise_for_status()
                response = candidate_response
                active_url = candidate_url
                break
            except requests.RequestException as exc:
                self.logger.warning("Listing request failed for %s: %s", candidate_url, exc)

        if response is None:
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.select("a[href*='/id/opportunities/jobs/']")
        if not links:
            links = soup.select("a[href*='/opportunities/jobs/']")
        self.logger.info(
            "Listing fetched from %s: status=%s bytes=%s links=%s",
            active_url,
            response.status_code,
            len(response.text),
            len(links),
        )

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

            detail = self._scrape_detail_page(url)

            jobs.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=",".join(self.settings.roles),
                    source_url=url,
                    title=detail.get("title") or label,
                    company=detail.get("company") or "Glints",
                    location=detail.get("location"),
                    salary=detail.get("salary"),
                    employment_type=detail.get("employment_type"),
                    description=detail.get("description"),
                    description_summary=None,
                    posted_date=detail.get("posted_date"),
                    raw={
                        "source": "glints",
                        "url": url,
                        "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                    },
                )
            )
            self._sleep_delay()

        return jobs

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
            response = self._http.get(job_url, timeout=min(max(self.settings.detail_timeout_seconds, 10), 15))
            response.raise_for_status()
        except requests.RequestException as exc:
            self.logger.warning("Detail request failed for %s: %s", job_url, exc)
            return detail

        soup = BeautifulSoup(response.text, "html.parser")
        title_node = soup.select_one("h1")
        company_node = (
            soup.select_one("a[href*='/companies/']")
            or soup.select_one("[data-testid*='company']")
            or soup.select_one("[class*='company']")
        )
        location_node = (
            soup.select_one("[data-testid*='location']")
            or soup.select_one("[class*='location']")
        )
        salary_node = (
            soup.select_one("[data-testid*='salary']")
            or soup.select_one("[class*='salary']")
        )
        description_node = (
            soup.select_one("[data-testid*='job-description']")
            or soup.select_one("[class*='job-description']")
            or soup.select_one("section")
        )
        employment_type_node = (
            soup.select_one("[data-testid*='employment']")
            or soup.select_one("[class*='employment']")
            or soup.select_one("[class*='job-type']")
        )
        posted_node = soup.select_one("time")

        detail["title"] = clean_text(title_node.get_text(" ", strip=True)) if title_node else None
        detail["company"] = clean_text(company_node.get_text(" ", strip=True)) if company_node else None
        detail["location"] = clean_text(location_node.get_text(" ", strip=True)) if location_node else None
        detail["salary"] = clean_text(salary_node.get_text(" ", strip=True)) if salary_node else None
        detail["employment_type"] = (
            clean_text(employment_type_node.get_text(" ", strip=True)) if employment_type_node else None
        )
        detail["description"] = (
            clean_text(description_node.get_text("\n", strip=True)) if description_node else None
        )
        detail["posted_date"] = parse_posted_date(
            posted_node.get_text(" ", strip=True) if posted_node else None,
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
            raw = (script.string or script.get_text() or "").strip()
            if not raw:
                continue
            try:
                payload = json.loads(raw)
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

    def _sleep_delay(self) -> None:
        min_s = min(self.settings.request_delay_min, self.settings.request_delay_max)
        max_s = max(self.settings.request_delay_min, self.settings.request_delay_max)
        time.sleep(random.uniform(min_s, max_s))
