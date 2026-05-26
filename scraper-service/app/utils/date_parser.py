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

    if "kemarin" in raw:
        return (now - timedelta(days=1)).date().isoformat()
    if "hari yang lalu" in raw:
        match = re.search(r"(\d+)\s*hari", raw)
        if match:
            days = int(match.group(1))
            return (now - timedelta(days=days)).date().isoformat()
    if "jam yang lalu" in raw:
        return now.date().isoformat()
    if "menit yang lalu" in raw:
        return now.date().isoformat()

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
