from __future__ import annotations

from typing import Any, Dict

import requests


class LaravelApiClient:
    def __init__(self, *, import_url: str, internal_token: str, timeout_seconds: int = 30) -> None:
        self.import_url = import_url
        self.internal_token = internal_token
        self.timeout_seconds = timeout_seconds

    def send_jobs(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.internal_token}",
        }
        response = requests.post(
            self.import_url,
            json=payload,
            headers=headers,
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        return response.json()
