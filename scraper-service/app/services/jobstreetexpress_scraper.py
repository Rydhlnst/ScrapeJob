from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import quote_plus, urljoin, urlsplit, urlunsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import json
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import Browser, TimeoutError as PlaywrightTimeout, sync_playwright

from app.config import Settings
from app.schemas.job_schema import is_valid_live_job, matches_role_keyword, normalize_job_payload
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date
from app.utils.firecrawl_client import FirecrawlClient
from app.utils.logger import get_logger


class JobstreetExpressScraper:
    # JobStreet Express has migrated to Jora Indonesia. The old hostname
    # redirects through an anti-bot layer before reaching the same listings.
    BASE_URL = "https://id.jora.com"
    LIST_URLS = [
        "https://id.jora.com/lowongan-Full-time",
        "https://id.jora.com/lowongan-Daily-worker",
        "https://id.jora.com/lowongan-Part-time?sp=trending_job_type",
    ]

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.logger = get_logger("jobstreetexpress_scraper")
        self._firecrawl = FirecrawlClient(settings, self.logger)
        self._http = requests.Session()
        from app.utils.http_helper import configure_retry_session, get_random_user_agent
        configure_retry_session(self._http, self.settings.http_retries)
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

        jobs: List[Dict] = []
        seen: set[str] = set()

        with sync_playwright() as playwright:
            browser = self._create_browser(playwright)
            try:
                for role in self.settings.roles:
                    role_slug = quote_plus(role.strip().lower()).replace("+", "-")
                    list_urls = [
                        f"{self.BASE_URL}/lowongan-{role_slug}-di-Indonesia",
                        *self.LIST_URLS,
                    ]

                    for list_url in list_urls:
                        self.logger.info("Scrape Jora listing role=%s url=%s", role, list_url)
                        self._scrape_listing(list_url, role, scraped_at, jobs, seen, browser)
            finally:
                browser.close()

        return jobs

    def _scrape_listing(
        self,
        list_url: str,
        role: str,
        scraped_at: str,
        jobs: List[Dict],
        seen: set[str],
        browser: Browser,
    ) -> None:
        soup = None
        try:
            response = self._http.get(list_url, timeout=min(max(self.settings.page_timeout_seconds, 10), 20))
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
        except requests.RequestException as exc:
            self.logger.warning("Listing request failed for %s: %s", list_url, exc)

        cards = soup.select("a[data-automation='job-card-title']") if soup else []
        cards = cards or (soup.select("a[href*='/job/']") if soup else [])
        if not cards:
            self.logger.info("Falling back to browser-rendered Jora listing for %s", list_url)
            rendered_html = self._render_page(browser, list_url)
            soup = BeautifulSoup(rendered_html, "html.parser") if rendered_html else None

        if not soup or not (soup.select("a[data-automation='job-card-title']") or soup.select("a[href*='/job/']")):
            self.logger.info("Falling back to Firecrawl for Jora listing %s", list_url)
            rendered_html = self._firecrawl.scrape_html(list_url)
            soup = BeautifulSoup(rendered_html, "html.parser") if rendered_html else soup

        if soup is None:
            return

        cards = soup.select("a[data-automation='job-card-title']") or soup.select("a[href*='/job/']")
        self.logger.info("Listing fetched from %s: cards=%s", list_url, len(cards))

        for card in cards:
            href = (card.get("href") or "").strip()
            if not href:
                continue

            link = self._canonical_job_url(urljoin(self.BASE_URL, href))
            if link in seen:
                continue
            seen.add(link)

            title = clean_text(card.get_text(" ", strip=True))
            if not title:
                continue

            if list_url in self.LIST_URLS and not matches_role_keyword(role, title):
                self.logger.info("Skipping broad Jora listing outside requested role url=%s", link)
                continue

            wrapper = card.find_parent("article") or card.find_parent("div")
            company = self._extract_company(wrapper)
            location = self._extract_location(wrapper)
            detail = self._extract_detail_fields(link, browser=browser)
            company = detail.get("company") or company
            location = detail.get("location") or location
            employment_type = detail.get("employment_type") or self._derive_type_from_url(list_url)
            title = detail.get("title") or title
            if not is_valid_live_job(
                source=self.settings.source,
                source_url=link,
                title=title,
                company=company,
            ):
                self.logger.warning("Skipping unverified JobStreet Express listing url=%s", link)
                continue

            jobs.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=",".join(self.settings.roles),
                    source_url=link,
                    title=title,
                    company=company,
                    location=location,
                    salary=detail.get("salary"),
                    employment_type=employment_type,
                    description=detail.get("description"),
                    description_summary=None,
                    posted_date=detail.get("posted_date"),
                    raw={
                        "source": "jobstreetexpress",
                        "query_url": list_url,
                        "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                    },
                )
            )

    def _canonical_job_url(self, job_url: str) -> str:
        parsed = urlsplit(job_url)
        return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))

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

    def _create_browser(self, playwright):
        return playwright.chromium.launch(
            headless=self.settings.headless,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
        )

    def _render_page(self, browser: Browser, url: str, *, detail: bool = False) -> Optional[str]:
        from app.utils.http_helper import get_random_user_agent
        page = browser.new_page(locale="id-ID", user_agent=get_random_user_agent())
        try:
            page.goto(
                url,
                wait_until="commit" if detail else "domcontentloaded",
                timeout=(min(max(self.settings.detail_timeout_seconds, 3), 8) if detail else min(max(self.settings.page_timeout_seconds, 10), 20)) * 1000,
            )
            page.wait_for_timeout(500 if detail else 2000)
            return page.content()
        except PlaywrightTimeout:
            self.logger.warning("Browser page timeout for %s", url)
            return None
        except Exception as exc:  # noqa: BLE001
            self.logger.warning("Browser page failed for %s: %s", url, exc)
            return None
        finally:
            page.close()

    def _extract_detail_fields(
        self,
        job_url: str,
        browser: Browser | None = None,
    ) -> Dict[str, Optional[str]]:
        detail: Dict[str, Optional[str]] = {
            "title": None,
            "location": None,
            "company": None,
            "salary": None,
            "employment_type": None,
            "description": None,
            "posted_date": None,
        }

        rendered_html = None
        native_html = None
        if browser is not None:
            rendered_html = self._render_page(browser, job_url, detail=True)

        if rendered_html:
            native_html = rendered_html
            soup = BeautifulSoup(rendered_html, "html.parser")
        else:
            try:
                response = self._http.get(job_url, timeout=min(max(self.settings.detail_timeout_seconds, 10), 15))
                response.raise_for_status()
            except requests.RequestException as exc:
                self.logger.warning("Detail request failed for %s: %s", job_url, exc)
                firecrawl_html = self._firecrawl.scrape_html(job_url)
                if not firecrawl_html:
                    return detail
                soup = BeautifulSoup(firecrawl_html, "html.parser")
            else:
                native_html = response.text
                soup = BeautifulSoup(response.text, "html.parser")

        if native_html and self._firecrawl.should_retry_html(native_html):
            firecrawl_html = self._firecrawl.scrape_html(job_url)
            if firecrawl_html:
                soup = BeautifulSoup(firecrawl_html, "html.parser")

        detail["title"] = self._pick_text(soup, ["h1", "[data-automation='job-detail-title']"])
        detail["location"] = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-location']",
                "[data-automation='job-location']",
                "span[data-automation='jobAdLocation']",
                "[class*='location']",
            ],
        )
        detail["company"] = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-company']",
                "[data-automation='job-company-name']",
                "a[data-automation='company-link']",
                "[class*='company']",
            ],
        )
        detail["salary"] = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-salary']",
                "[data-automation='job-salary']",
                "[class*='salary']",
            ],
        )
        detail["employment_type"] = self._pick_text(
            soup,
            [
                "[data-automation='job-detail-work-type']",
                "[data-automation='job-work-type']",
                "[class*='employment']",
                "[class*='job-type']",
            ],
        )
        description_node = (
            soup.select_one("[data-automation='jobAdDetails']")
            or soup.select_one("[data-automation='jobDescription']")
            or soup.select_one("[class*='description']")
            or soup.select_one("article")
        )
        detail["description"] = (
            clean_text(description_node.get_text("\n", strip=True)) if description_node else None
        )
        detail["posted_date"] = parse_posted_date(
            self._pick_text(soup, ["time", "[data-automation='jobListingDate']"]),
            self.settings.timezone_name,
        )

        if all(detail.values()):
            return detail

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

                if not detail["company"]:
                    org = obj.get("hiringOrganization")
                    if isinstance(org, dict):
                        detail["company"] = clean_text(str(org.get("name") or "").strip()) or detail["company"]

                if not detail["location"]:
                    job_loc = obj.get("jobLocation")
                    if isinstance(job_loc, dict):
                        address = job_loc.get("address")
                        if isinstance(address, dict):
                            detail["location"] = (
                                clean_text(str(address.get("addressLocality") or "").strip()) or detail["location"]
                            )
                if not detail["title"]:
                    detail["title"] = clean_text(str(obj.get("title") or "").strip()) or detail["title"]
                if not detail["employment_type"]:
                    detail["employment_type"] = (
                        clean_text(str(obj.get("employmentType") or "").strip()) or detail["employment_type"]
                    )
                if not detail["description"]:
                    detail["description"] = clean_text(str(obj.get("description") or "").strip()) or detail["description"]
                if not detail["posted_date"]:
                    detail["posted_date"] = parse_posted_date(
                        str(obj.get("datePosted") or "").strip(),
                        self.settings.timezone_name,
                    )
                if not detail["salary"]:
                    base_salary = obj.get("baseSalary")
                    if isinstance(base_salary, dict):
                        value = base_salary.get("value")
                        if isinstance(value, dict):
                            salary_value = value.get("value")
                            unit = value.get("unitText")
                            if salary_value:
                                detail["salary"] = clean_text(f"{salary_value} {unit or ''}") or detail["salary"]
                break

        detail["location"] = self._normalize_location(detail["location"])
        return detail

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
        if "begin typing for results" in lowered or lowered.startswith("di mana "):
            return None
        if len(cleaned) <= 2:
            return None
        return cleaned
