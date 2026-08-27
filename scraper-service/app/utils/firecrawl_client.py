from __future__ import annotations

from typing import Any, Optional

import requests
from bs4 import BeautifulSoup

from app.config import Settings
from app.utils.cleaner import clean_text
from app.utils.logger import get_logger


class FirecrawlClient:
    """Small REST client used when native HTML is unavailable or unusable."""

    def __init__(self, settings: Settings, logger=None) -> None:
        self.settings = settings
        self.logger = logger or get_logger("firecrawl_client")

    @property
    def enabled(self) -> bool:
        return bool(self.settings.firecrawl_api_key)

    def scrape_html(self, url: str) -> Optional[str]:
        if not self.enabled:
            return None

        endpoint = f"{self.settings.firecrawl_api_url.rstrip('/')}/v2/scrape"
        payload = {
            "url": url,
            "formats": ["html", "links"],
            "onlyMainContent": False,
            "waitFor": self.settings.firecrawl_wait_for_ms,
            "blockAds": True,
            "proxy": "auto",
        }
        try:
            response = requests.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {self.settings.firecrawl_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=self.settings.firecrawl_timeout_seconds,
            )
            response.raise_for_status()
            body: Any = response.json()
            data = body.get("data", body) if isinstance(body, dict) else {}
            html = None
            if isinstance(data, dict):
                html = data.get("html") or data.get("rawHtml")
            if isinstance(html, str) and html.strip():
                self.logger.info("Firecrawl fallback fetched url=%s bytes=%s", url, len(html))
                return html
            self.logger.warning("Firecrawl returned no HTML for %s", url)
        except (requests.RequestException, ValueError) as exc:
            self.logger.warning("Firecrawl fallback failed for %s: %s", url, exc)

        return None

    def should_retry_html(self, html: str) -> bool:
        """Return True when native HTML is not trustworthy for extraction."""
        if not self.enabled:
            return False

        soup = BeautifulSoup(html, "html.parser")
        body_text = clean_text(soup.get_text(" ", strip=True)).lower()
        blocked_markers = (
            "access denied",
            "captcha",
            "cloudflare",
            "enable javascript",
            "just a moment",
            "robot check",
            "verify you are human",
        )
        if any(marker in body_text for marker in blocked_markers):
            return True

        heading = soup.select_one("h1")
        if heading is None:
            return True

        heading_text = clean_text(heading.get_text(" ", strip=True)).lower()
        blocked_headings = {
            "404",
            "error 404",
            "access denied",
            "just a moment",
            "page not found",
            "robot check",
            "verify you are human",
        }
        return heading_text in blocked_headings
