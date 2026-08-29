from __future__ import annotations

import json
import re
import random
import time
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from bs4 import BeautifulSoup
from playwright.sync_api import Browser, TimeoutError as PlaywrightTimeout, sync_playwright

from app.config import Settings
from app.schemas.job_schema import is_valid_live_company, is_valid_live_job, matches_role_keyword, normalize_job_payload
from app.utils.cleaner import clean_text
from app.utils.date_parser import parse_posted_date
from app.utils.logger import get_logger


class KalibrrScraper:
    BASE_URL = "https://www.kalibrr.com"
    LIST_URL = "https://www.kalibrr.com/home/te"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.logger = get_logger("kalibrr_scraper")
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
        browser: Browser | None = None
        playwright = None
        try:
            playwright = sync_playwright().start()
            browser = self._create_browser(playwright)
        except Exception as exc:  # noqa: BLE001
            self.logger.warning("Browser startup failed; continuing with HTTP only: %s", exc)

        try:
            for role in self.settings.roles:
                jobs.extend(self._scrape_role(role, scraped_at, browser))
        finally:
            if browser is not None:
                browser.close()
            if playwright is not None:
                playwright.stop()

        return jobs

    def _scrape_role(
        self,
        role: str,
        scraped_at: str,
        browser: Browser | None = None,
    ) -> List[Dict]:
        query = quote_plus(role.strip())
        candidate_urls = [
            f"{self.LIST_URL}?text={query}",
            f"{self.LIST_URL}?keyword={query}",
            f"{self.BASE_URL}/home/te?search={query}",
            self.LIST_URL,
        ]

        soup: Optional[BeautifulSoup] = None
        active_url = candidate_urls[0]
        for candidate_url in candidate_urls:
            try:
                response = self._http.get(candidate_url, timeout=min(max(self.settings.page_timeout_seconds, 10), 20))
                response.raise_for_status()
                parsed = BeautifulSoup(response.text, "html.parser")
                candidate_cards = self._listing_cards(parsed)
                if candidate_cards and self._has_matching_listing(candidate_cards, role):
                    soup = parsed
                    active_url = candidate_url
                    break
                if soup is None and candidate_cards:
                    soup = parsed
                    active_url = candidate_url
            except requests.RequestException as exc:
                self.logger.warning("Listing request failed for %s: %s", candidate_url, exc)
                continue

        if soup is None:
            soup = BeautifulSoup("", "html.parser")

        cards = self._listing_cards(soup)
        if not cards or not self._has_matching_listing(cards, role):
            self.logger.info("Falling back to browser-rendered Kalibrr listing")
        if (not cards or not self._has_matching_listing(cards, role)) and browser is not None:
            for candidate_url in candidate_urls:
                rendered_html = self._render_page(browser, candidate_url)
                if not rendered_html:
                    continue
                candidate_soup = BeautifulSoup(rendered_html, "html.parser")
                candidate_cards = self._listing_cards(candidate_soup)
                if candidate_cards and self._has_matching_listing(candidate_cards, role):
                    soup = candidate_soup
                    cards = candidate_cards
                    active_url = candidate_url
                    break
        self.logger.info("Listing fetched from %s: cards=%s", active_url, len(cards))

        results: List[Dict] = []
        seen: set[str] = set()
        for card in cards:
            href = (card.get("href") or "").strip()
            if not href:
                continue
            if not self._is_job_href(href):
                continue
            link = href if href.startswith("http") else f"{self.BASE_URL}{href}"
            if link in seen:
                continue
            seen.add(link)

            title_node = card.select_one("h2, h3") or card.select_one("[class*='title']")
            card_container = card.find_parent(
                "div",
                class_=lambda classes: classes and "k-group" in classes,
            )
            company_node = card.select_one("[data-testid*='company'], [class*='company']") or (
                card_container.select_one("a[href*='action=Company%20Name']")
                if card_container
                else None
            )
            company_node = company_node or (
                card_container.select_one("span a.k-text-subdued")
                if card_container
                else None
            )
            location_node = card.select_one("[class*='location']")

            title = clean_text(title_node.get_text(" ", strip=True)) if title_node else clean_text(card.get_text(" ", strip=True))
            company = clean_text(company_node.get_text(" ", strip=True)) if company_node else None
            location = clean_text(location_node.get_text(" ", strip=True)) if location_node else None

            if not title:
                continue
            if not matches_role_keyword(role, title, href):
                self.logger.info("Skipping Kalibrr card outside requested role url=%s", link)
                continue

            detail = self._scrape_detail_page(link, browser=browser)
            title = detail.get("title") or title
            detail_company = detail.get("company") if is_valid_live_company(detail.get("company")) else None
            company = detail_company or company
            if not matches_role_keyword(role, title, detail.get("description")):
                self.logger.info("Skipping Kalibrr listing outside requested role url=%s", link)
                continue
            if not is_valid_live_job(
                source=self.settings.source,
                source_url=link,
                title=title,
                company=company,
            ):
                self.logger.warning("Skipping unverified Kalibrr listing url=%s", link)
                continue

            results.append(
                normalize_job_payload(
                    source=self.settings.source,
                    scraped_at_iso=scraped_at,
                    role_keyword=role,
                    source_url=link,
                    title=title,
                    company=company,
                    location=detail.get("location") or location,
                    salary=detail.get("salary"),
                    employment_type=detail.get("employment_type"),
                    description=detail.get("description"),
                    description_summary=None,
                    posted_date=detail.get("posted_date"),
                    raw={
                        "source": "kalibrr",
                        "query_url": active_url,
                        "detail_fetched": bool(detail.get("description") or detail.get("company") or detail.get("location")),
                    },
                )
            )
            self._sleep_delay()

        return results

    @staticmethod
    def _is_job_href(href: str) -> bool:
        return bool(
            re.search(r"/c/[^/]+/jobs/[^/?#]+(?:/|$)", href)
            or re.search(r"/jobs/[^/?#]+(?:/|$)", href)
        )

    def _listing_cards(self, soup: BeautifulSoup):
        candidates = soup.select(
            "a.kalibrr-job-list-card, a[href*='/c/'][href*='/jobs/'], a[href*='/jobs/']"
        )
        return [card for card in candidates if self._is_job_href((card.get("href") or "").strip())]

    @staticmethod
    def _has_matching_listing(cards, role: str) -> bool:
        for card in cards:
            href = (card.get("href") or "").strip()
            title_node = card.select_one("h2, h3") or card.select_one("[class*='title']")
            title = clean_text(title_node.get_text(" ", strip=True)) if title_node else clean_text(card.get_text(" ", strip=True))
            if title and matches_role_keyword(role, title, href):
                return True
        return False

    def _create_browser(self, playwright):
        return playwright.chromium.launch(
            headless=self.settings.headless,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
        )

    def _render_page(self, browser: Browser, url: str, *, detail: bool = False) -> Optional[str]:
        from app.utils.http_helper import get_random_user_agent

        page = browser.new_page(locale="id-ID", user_agent=get_random_user_agent())
        try:
            timeout_seconds = (
                min(max(self.settings.detail_timeout_seconds, 3), 8)
                if detail
                else min(max(self.settings.page_timeout_seconds, 10), 20)
            )
            page.goto(
                url,
                wait_until="commit" if detail else "domcontentloaded",
                timeout=timeout_seconds * 1000,
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

    def _scrape_detail_page(
        self,
        job_url: str,
        browser: Browser | None = None,
    ) -> Dict[str, Optional[str]]:
        detail: Dict[str, Optional[str]] = {
            "title": None,
            "company": None,
            "location": None,
            "salary": None,
            "employment_type": None,
            "description": None,
            "posted_date": None,
        }

        rendered_html = self._render_page(browser, job_url, detail=True) if browser is not None else None
        if rendered_html:
            soup = BeautifulSoup(rendered_html, "html.parser")
        else:
            try:
                response = self._http.get(job_url, timeout=min(max(self.settings.detail_timeout_seconds, 10), 15))
                response.raise_for_status()
            except requests.RequestException as exc:
                self.logger.warning("Detail request failed for %s: %s", job_url, exc)
                return detail
            soup = BeautifulSoup(response.text, "html.parser")
        detail["title"] = self._pick_text(soup, ["h1", "[class*='title']"])
        detail["company"] = self._pick_text(soup, ["[class*='company']", "a[href*='/company/']"])
        detail["location"] = self._pick_text(soup, ["[class*='location']", "[data-testid*='location']"])
        detail["salary"] = self._pick_text(soup, ["[class*='salary']", "[data-testid*='salary']"])
        detail["employment_type"] = self._pick_text(soup, ["[class*='job-type']", "[class*='employment']"])
        description_node = (
            soup.select_one("[class*='description']")
            or soup.select_one("[data-testid*='description']")
            or soup.select_one("article")
        )
        detail["description"] = (
            clean_text(description_node.get_text("\n", strip=True)) if description_node else None
        )
        detail["posted_date"] = parse_posted_date(
            self._pick_text(soup, ["time", "[class*='date']"]),
            self.settings.timezone_name,
        )

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

                detail["title"] = detail["title"] or clean_text(str(obj.get("title") or "").strip()) or None
                org = obj.get("hiringOrganization")
                if not detail["company"] and isinstance(org, dict):
                    detail["company"] = clean_text(str(org.get("name") or "").strip()) or None
                if not detail["location"]:
                    job_loc = obj.get("jobLocation")
                    if isinstance(job_loc, dict):
                        address = job_loc.get("address")
                        if isinstance(address, dict):
                            detail["location"] = clean_text(str(address.get("addressLocality") or "").strip()) or None
                detail["employment_type"] = (
                    detail["employment_type"]
                    or clean_text(str(obj.get("employmentType") or "").strip())
                    or None
                )
                detail["description"] = detail["description"] or clean_text(str(obj.get("description") or "").strip()) or None
                detail["posted_date"] = detail["posted_date"] or parse_posted_date(
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
                                detail["salary"] = clean_text(f"{salary_value} {unit or ''}") or None
                break

        return detail

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
