from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

ID_MONTHS = {
    "januari": 1,
    "februari": 2,
    "maret": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "agustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "desember": 12,
}


def parse_posted_date(text: str | None, timezone_name: str = "Asia/Jakarta") -> Optional[str]:
    if not text:
        return None

    raw = text.strip().lower()
    now = datetime.now(ZoneInfo(timezone_name))

    if "kemarin" in raw or "yesterday" in raw:
        return (now - timedelta(days=1)).date().isoformat()
    if "hari ini" in raw or "today" in raw or "just now" in raw:
        return now.date().isoformat()

    relative_match = re.search(
        r"(\d+)\s*(?:hari|day|days|d)\s*(?:yang lalu|ago)?",
        raw,
    )
    if relative_match:
        return (now - timedelta(days=int(relative_match.group(1)))).date().isoformat()

    if re.search(r"(?:jam|hour|hours|h|menit|minute|minutes|min)\s*(?:yang lalu|ago)?", raw):
        return now.date().isoformat()

    week_match = re.search(r"(\d+)\s*(?:minggu|week|weeks|w)\s*(?:yang lalu|ago)?", raw)
    if week_match:
        return (now - timedelta(weeks=int(week_match.group(1)))).date().isoformat()

    date_match = re.search(r"(\d{1,2})\s+([a-z]+)\s+(\d{4})", raw)
    if date_match:
        day = int(date_match.group(1))
        month_text = date_match.group(2)
        year = int(date_match.group(3))
        month = ID_MONTHS.get(month_text)
        if month:
            return datetime(year=year, month=month, day=day).date().isoformat()

    # fallback if format already yyyy-mm-dd
    iso_match = re.search(r"\d{4}-\d{2}-\d{2}", raw)
    if iso_match:
        return iso_match.group(0)

    return None


def is_date_allowed(
    posted_date: str | None,
    *,
    max_days_ago: int | None,
    start_date: str | None,
    timezone_name: str = "Asia/Jakarta",
) -> bool:
    """Apply inclusive date filters to a normalized posted date."""
    if not posted_date:
        return True

    try:
        posted = datetime.fromisoformat(posted_date[:10]).date()
    except ValueError:
        return True

    now = datetime.now(ZoneInfo(timezone_name)).date()
    lower_bound = None
    if max_days_ago is not None:
        lower_bound = now - timedelta(days=max(0, max_days_ago))

    if start_date:
        try:
            requested_start = datetime.fromisoformat(start_date[:10]).date()
            lower_bound = max(lower_bound, requested_start) if lower_bound else requested_start
        except ValueError:
            pass

    return lower_bound is None or posted >= lower_bound
