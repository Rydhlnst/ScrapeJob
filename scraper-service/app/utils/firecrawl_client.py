from __future__ import annotations

from typing import Any, Optional

import requests

from app.config import Settings
from app.utils.logger import get_logger


class FirecrawlClient:
    """Small REST client used only after the native scraper fallbacks fail."""

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
            html = data.get("html") or data.get("rawHtml") if isinstance(data, dict) else None
            if isinstance(html, str) and html.strip():
                self.logger.info("Firecrawl fallback fetched url=%s bytes=%s", url, len(html))
                return html
            self.logger.warning("Firecrawl returned no HTML for %s", url)
        except (requests.RequestException, ValueError) as exc:
            self.logger.warning("Firecrawl fallback failed for %s: %s", url, exc)

        return None
