from __future__ import annotations

import json
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import quote_plus, urljoin, urlsplit, urlunsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from bs4 import BeautifulSoup
import requests
from playwright.sync_api import Browser, Page, Playwright, TimeoutError as PlaywrightTimeout, sync_playwright

from app.config import Settings
from app.schemas.job_schema import is_valid_live_job, normalize_job_payload
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date
from app.utils.firecrawl_client import FirecrawlClient
from app.utils.logger import get_logger


@dataclass
class ListingCard:
    source_url: str
    title: str
    company: str
    location: Optional[str]
    salary: Optional[str]
    posted_text: Optional[str]
    page: int
    role_slug: str


class JobstreetScraper:
    BASE_URL = "https://id.jobstreet.com"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.logger = get_logger("jobstreet_scraper")
        self._firecrawl = FirecrawlClient(settings, self.logger)
        try:
            self.scraped_at_iso = datetime.now(ZoneInfo(settings.timezone_name)).isoformat(timespec="seconds")
        except ZoneInfoNotFoundError:
            self.logger.warning("Timezone %s not found in JobstreetScraper, fallback to UTC", settings.timezone_name)
            self.scraped_at_iso = datetime.utcnow().isoformat(timespec="seconds") + "Z"
        self._playwright = None
        self._http = requests.Session()
        from app.utils.http_helper import configure_retry_session, get_random_user_agent
        configure_retry_session(self._http, self.settings.http_retries)
        self._http.headers.update({
            "User-Agent": get_random_user_agent(),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        if settings.proxy:
            self._http.proxies.update({
                "http": settings.proxy,
                "https": settings.proxy,
            })

    # ------------------------------------------------------------------ #
    # Public entry point
    # ------------------------------------------------------------------ #

    def scrape(self) -> List[Dict]:
        all_jobs: List[Dict] = []
        seen_urls: set[str] = set()

        with sync_playwright() as pw:
            browser = self._create_browser(pw)
            try:
                for role_keyword in self.settings.roles:
                    role_slug = role_keyword.strip().lower().replace(" ", "-")
                    role_jobs = self._scrape_role(
                        browser=browser,
                        role_keyword=role_keyword,
                        role_slug=role_slug,
                        seen_urls=seen_urls,
                    )
                    all_jobs.extend(role_jobs)
            finally:
                browser.close()

        return all_jobs

    # ------------------------------------------------------------------ #
    # Role-level scraping
    # ------------------------------------------------------------------ #

    def _scrape_role(
        self,
        *,
        browser: Browser,
        role_keyword: str,
        role_slug: str,
        seen_urls: set[str],
    ) -> List[Dict]:
        jobs: List[Dict] = []

        for page_num in range(1, self.settings.max_pages + 1):
            list_url = self._build_search_url(role_keyword=role_keyword, page=page_num)
            self.logger.info(
                "Scrape list page role=%s page=%s url=%s",
                role_keyword,
                page_num,
                list_url,
            )

            cards = self._scrape_list_page(
                browser=browser,
                list_url=list_url,
                page=page_num,
                role_slug=role_slug,
            )

            if not cards:
                self.logger.info(
                    "No cards found role=%s page=%s, stop pagination",
                    role_keyword,
                    page_num,
                )
                break

            for card in cards:
                if card.source_url in seen_urls:
                    continue
                seen_urls.add(card.source_url)

                detail = self._scrape_detail_page(browser=browser, source_url=card.source_url)
                posted_date = parse_posted_date(card.posted_text, self.settings.timezone_name)
                title = detail.get("title") or card.title
                company = detail.get("company") or card.company
                if not is_valid_live_job(
                    source=self.settings.source,
                    source_url=card.source_url,
                    title=title,
                    company=company,
                ):
                    self.logger.warning("Skipping unverified JobStreet listing url=%s", card.source_url)
                    continue

                jobs.append(
                    normalize_job_payload(
                        source=self.settings.source,
                        scraped_at_iso=self.scraped_at_iso,
                        role_keyword=role_keyword,
                        source_url=card.source_url,
                        title=title,
                        company=company,
                        location=detail.get("location") or card.location,
                        salary=detail.get("salary") or card.salary,
                        employment_type=detail.get("employment_type"),
                        description=detail.get("description"),
                        description_summary=None,
                        posted_date=posted_date,
                        raw={
                            "posted_text": card.posted_text,
                            "role_url": role_slug,
                            "page": card.page,
                        },
                    )
                )
                self._sleep_delay()

        return jobs

    # ------------------------------------------------------------------ #
    # URL builder
    # ------------------------------------------------------------------ #

    def _build_search_url(self, *, role_keyword: str, page: int) -> str:
        slug = quote_plus(role_keyword.strip().lower()).replace("+", "-")
        return f"{self.BASE_URL}/id/{slug}-jobs/in-Indonesia?page={page}"

    # ------------------------------------------------------------------ #
    # List page scraper
    # ------------------------------------------------------------------ #

    def _scrape_list_page(
        self,
        *,
        browser: Browser,
        list_url: str,
        page: int,
        role_slug: str,
    ) -> List[ListingCard]:
        keyword = role_slug.replace("-", " ")
        candidate_urls = [
            list_url,
            list_url.replace("/id/", "/", 1),
            f"{self.BASE_URL}/id/jobs?keywords={quote_plus(keyword)}&page={page}",
            f"{self.BASE_URL}/jobs?keywords={quote_plus(keyword)}&page={page}",
        ]

        html: Optional[str] = None
        from app.utils.http_helper import get_random_user_agent
        page_obj: Page = browser.new_page(user_agent=get_random_user_agent())
        listing_timeout_ms = max(10, min(self.settings.page_timeout_seconds, 20)) * 1000
        try:
            for candidate_url in candidate_urls:
                try:
                    page_obj.goto(candidate_url, wait_until="domcontentloaded", timeout=listing_timeout_ms)
                    page_obj.wait_for_timeout(1500)
                    page_obj.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page_obj.wait_for_timeout(1000)
                    page_obj.wait_for_selector(
                        "a[href*='/job/']",
                        timeout=listing_timeout_ms,
                    )
                    html = page_obj.content()
                    break
                except PlaywrightTimeout:
                    fallback_html = page_obj.content()
                    if "/job/" in fallback_html:
                        self.logger.warning("Selector timeout but job-like links found in HTML, using fallback parse: %s", candidate_url)
                        html = fallback_html
                        break
                    self.logger.warning("Timeout list page candidate: %s", candidate_url)
                    continue

            if html is None:
                self.logger.warning("Browser could not load list page; trying HTTP and Firecrawl fallbacks: %s", list_url)
        finally:
            page_obj.close()

        cards = self._extract_cards_from_html(html, page=page, role_slug=role_slug)
        if cards:
            return cards

        # Secondary fallback: request-based fetch (closer to your reference script approach)
        for candidate_url in candidate_urls:
            try:
                response = self._http.get(
                    candidate_url,
                    timeout=min(max(self.settings.page_timeout_seconds, 10), 20),
                )
                response.raise_for_status()
                request_cards = self._extract_cards_from_html(response.text, page=page, role_slug=role_slug)
                if request_cards:
                    self.logger.info("Recovered %s cards via requests fallback for %s", len(request_cards), candidate_url)
                    return request_cards
            except Exception as exc:  # noqa: BLE001
                self.logger.warning("Requests fallback failed for %s: %s", candidate_url, exc)

        for candidate_url in candidate_urls:
            firecrawl_html = self._firecrawl.scrape_html(candidate_url)
            if not firecrawl_html:
                continue
            firecrawl_cards = self._extract_cards_from_html(firecrawl_html, page=page, role_slug=role_slug)
            if firecrawl_cards:
                self.logger.info("Recovered %s cards via Firecrawl fallback for %s", len(firecrawl_cards), candidate_url)
                return firecrawl_cards

        return []

    def _extract_cards_from_html(self, html: Optional[str], *, page: int, role_slug: str) -> List[ListingCard]:
        if not html or not html.strip():
            return []

        soup = BeautifulSoup(html, "html.parser")
        card_nodes = (
            soup.select("article[data-automation='normalJob']")
            or soup.select("[data-automation='job-card']")
            or soup.select("article")
        )
        cards: List[ListingCard] = []

        for node in card_nodes:
            link_node = node.select_one("a[href*='/job/']") or node.select_one("a[href]")
            href = (link_node.get("href") if link_node else "") or ""
            if not href:
                continue

            source_url = self._canonical_job_url(urljoin(self.BASE_URL, href))

            title_node = (
                node.select_one("[data-automation='jobTitle']")
                or node.select_one("h3")
                or node.select_one("a")
            )
            title = clean_text(title_node.get_text(" ", strip=True)) if title_node else ""

            company_node = node.select_one("[data-automation='jobCompany']") or node.select_one("span")
            company = clean_text(company_node.get_text(" ", strip=True)) if company_node else ""

            if not title:
                continue
            location_node = (
                node.select_one("[data-automation='jobLocation']")
                or node.select_one("span[data-automation='jobListingLocation']")
            )
            salary_node = (
                node.select_one("[data-automation='jobSalary']")
                or node.select_one("span[data-automation='jobListingSalary']")
            )
            posted_node = node.select_one("[data-automation='jobListingDate']") or node.select_one("time")

            cards.append(
                ListingCard(
                    source_url=source_url,
                    title=title,
                    company=company,
                    location=clean_text(location_node.get_text(" ", strip=True)) if location_node else None,
                    salary=clean_text(salary_node.get_text(" ", strip=True)) if salary_node else None,
                    posted_text=clean_text(posted_node.get_text(" ", strip=True)) if posted_node else None,
                    page=page,
                    role_slug=role_slug,
                )
            )

        if cards:
            return cards

        # Link-level fallback when wrapper/card classes shift
        seen_urls: set[str] = set()
        for link_node in soup.select("a[href*='/job/']"):
            href = (link_node.get("href") or "").strip()
            if not href:
                continue
            source_url = self._canonical_job_url(urljoin(self.BASE_URL, href))
            if source_url in seen_urls:
                continue
            seen_urls.add(source_url)

            title = clean_text(link_node.get_text(" ", strip=True))
            if not title:
                continue

            parent = link_node.find_parent("article") or link_node.find_parent("div")
            company = ""
            location = None
            posted_text = None
            salary = None

            if parent is not None:
                company_node = parent.select_one("[data-automation='jobCompany']") or parent.select_one("span")
                company = clean_text(company_node.get_text(" ", strip=True)) if company_node else ""
                location_node = (
                    parent.select_one("[data-automation='jobLocation']")
                    or parent.select_one("span[data-automation='jobListingLocation']")
                )
                salary_node = (
                    parent.select_one("[data-automation='jobSalary']")
                    or parent.select_one("span[data-automation='jobListingSalary']")
                )
                posted_node = parent.select_one("[data-automation='jobListingDate']") or parent.select_one("time")
                location = clean_text(location_node.get_text(" ", strip=True)) if location_node else None
                salary = clean_text(salary_node.get_text(" ", strip=True)) if salary_node else None
                posted_text = clean_text(posted_node.get_text(" ", strip=True)) if posted_node else None

            cards.append(
                ListingCard(
                    source_url=source_url,
                    title=title,
                    company=company,
                    location=location,
                    salary=salary,
                    posted_text=posted_text,
                    page=page,
                    role_slug=role_slug,
                )
            )

        return cards

    # ------------------------------------------------------------------ #
    # Detail page scraper
    # ------------------------------------------------------------------ #

    def _scrape_detail_page(
        self,
        *,
        browser: Browser,
        source_url: str,
    ) -> Dict[str, Optional[str]]:
        detail: Dict[str, Optional[str]] = {
            "title": None,
            "company": None,
            "location": None,
            "salary": None,
            "employment_type": None,
            "description": None,
        }

        from app.utils.http_helper import get_random_user_agent
        page_obj: Page = browser.new_page(user_agent=get_random_user_agent())
        html: Optional[str] = None
        native_html: Optional[str] = None
        detail_timeout_ms = max(10, min(self.settings.detail_timeout_seconds, 15)) * 1000
        try:
            try:
                page_obj.goto(source_url, wait_until="domcontentloaded", timeout=detail_timeout_ms)
            except PlaywrightTimeout:
                self.logger.warning("Timeout loading detail page: %s", source_url)
                html = self._firecrawl.scrape_html(source_url)
                if not html:
                    return detail
            except Exception as exc:  # noqa: BLE001
                self.logger.warning("Detail navigation failed for %s: %s", source_url, exc)
                html = self._firecrawl.scrape_html(source_url)
                if not html:
                    return detail

            if html is None:
                try:
                    page_obj.wait_for_selector("body", timeout=detail_timeout_ms)
                    html = page_obj.content()
                    native_html = html
                except PlaywrightTimeout:
                    self.logger.warning("Timeout detail page: %s", source_url)
                    html = self._firecrawl.scrape_html(source_url)
                except Exception as exc:  # noqa: BLE001
                    self.logger.warning("Detail page content failed for %s: %s", source_url, exc)
                    html = self._firecrawl.scrape_html(source_url)
        finally:
            page_obj.close()

        if not html:
            return detail

        soup = BeautifulSoup(html, "html.parser")
        if native_html and self._firecrawl.should_retry_html(native_html):
            firecrawl_html = self._firecrawl.scrape_html(source_url)
            if firecrawl_html:
                soup = BeautifulSoup(firecrawl_html, "html.parser")

        title_node = soup.select_one("h1[data-automation='job-detail-title']") or soup.select_one("h1")
        company_node = (
            soup.select_one("[data-automation='advertiser-name']")
            or soup.select_one("a[data-automation='company-link']")
        )
        location_node = (
            soup.select_one("[data-automation='job-detail-location']")
            or soup.select_one("span[data-automation='job-detail-location']")
        )
        salary_node = (
            soup.select_one("[data-automation='job-detail-salary']")
            or soup.select_one("span[data-automation='job-detail-salary']")
        )
        description_node = (
            soup.select_one("[data-automation='jobAdDetails']")
            or soup.select_one("div[data-automation='jobDescription']")
        )

        detail["title"] = clean_text(title_node.get_text(" ", strip=True)) if title_node else None
        detail["company"] = clean_text(company_node.get_text(" ", strip=True)) if company_node else None
        detail["location"] = clean_text(location_node.get_text(" ", strip=True)) if location_node else None
        detail["salary"] = clean_text(salary_node.get_text(" ", strip=True)) if salary_node else None
        detail["employment_type"] = self._extract_employment_type(soup)
        detail["description"] = (
            clean_text(description_node.get_text("\n", strip=True)) if description_node else None
        )

        # JobStreet periodically changes data-automation attributes. JSON-LD is
        # a stable fallback for the core fields needed to validate a listing.
        json_ld_detail = self._extract_jobposting_json_ld(soup)
        detail["title"] = detail["title"] or json_ld_detail.get("title")
        detail["company"] = detail["company"] or json_ld_detail.get("company")
        detail["location"] = detail["location"] or json_ld_detail.get("location")
        detail["salary"] = detail["salary"] or json_ld_detail.get("salary")
        detail["employment_type"] = detail["employment_type"] or json_ld_detail.get("employment_type")
        detail["description"] = detail["description"] or json_ld_detail.get("description")

        return detail

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _extract_jobposting_json_ld(self, soup: BeautifulSoup) -> Dict[str, Optional[str]]:
        for script in soup.select("script[type='application/ld+json']"):
            raw = (script.string or script.get_text() or "").strip()
            if not raw:
                continue
            try:
                payload = json.loads(raw)
            except (TypeError, ValueError):
                continue

            objects = payload if isinstance(payload, list) else [payload]
            for obj in objects:
                if not isinstance(obj, dict) or obj.get("@type") != "JobPosting":
                    continue

                organization = obj.get("hiringOrganization")
                company = organization.get("name") if isinstance(organization, dict) else None
                location = obj.get("jobLocation")
                if isinstance(location, list):
                    location = location[0] if location else None
                address = location.get("address") if isinstance(location, dict) else None
                locality = address.get("addressLocality") if isinstance(address, dict) else None
                salary = obj.get("baseSalary")
                if isinstance(salary, dict):
                    salary_value = salary.get("value")
                    if isinstance(salary_value, dict):
                        salary_value = salary_value.get("value")
                    salary = f"{salary_value} {salary.get('currency', '')}" if salary_value else None

                return {
                    "title": clean_text(str(obj.get("title") or "")) or None,
                    "company": clean_text(str(company or "")) or None,
                    "location": clean_text(str(locality or "")) or None,
                    "salary": clean_text(str(salary or "")) or None,
                    "employment_type": clean_text(str(obj.get("employmentType") or "")) or None,
                    "description": clean_text(str(obj.get("description") or "")) or None,
                }

        return {
            "title": None,
            "company": None,
            "location": None,
            "salary": None,
            "employment_type": None,
            "description": None,
        }

    def _canonical_job_url(self, job_url: str) -> str:
        parsed = urlsplit(job_url)
        path = parsed.path
        if path.startswith("/id/job/"):
            path = path[3:]

        return urlunsplit((parsed.scheme, parsed.netloc, path, "", ""))

    def _extract_employment_type(self, soup: BeautifulSoup) -> Optional[str]:
        labels = soup.select("[data-automation='job-detail-work-type'], span, li")
        for node in labels:
            text = clean_text(node.get_text(" ", strip=True))
            if not text:
                continue
            if any(kw in text.lower() for kw in ["full time", "part time", "contract", "internship", "freelance"]):
                return text
        return None

    def _sleep_delay(self) -> None:
        min_s = min(self.settings.request_delay_min, self.settings.request_delay_max)
        max_s = max(self.settings.request_delay_min, self.settings.request_delay_max)
        time.sleep(random.uniform(min_s, max_s))

    def _create_browser(self, pw: Playwright) -> Browser:
        headless_env = os.getenv("HEADLESS")
        headless_enabled = (
            self.settings.headless
            if headless_env is None
            else headless_env.strip().lower() in {"1", "true", "yes", "on"}
        )

        self.logger.info("Launching Playwright Chromium browser")
        try:
            launch_args = {
                "headless": headless_enabled,
                "args": [
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--window-size=1920,1080",
                    "--lang=id-ID",
                ]
            }
            if self.settings.proxy:
                launch_args["proxy"] = {"server": self.settings.proxy}
            browser = pw.chromium.launch(**launch_args)
            self.logger.info("Playwright Chromium launched successfully")
            return browser
        except Exception as exc:
            message = (
                "Failed to launch Playwright Chromium.\n"
                "Possible causes:\n"
                "1. Chromium not installed — run: playwright install chromium\n"
                "2. Missing system deps on Linux — run: playwright install-deps chromium\n"
                "3. Insufficient permissions or sandboxing issues"
            )
            self.logger.exception(message)
            raise RuntimeError(message) from exc
