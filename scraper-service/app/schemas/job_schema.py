from __future__ import annotations

import hashlib
from typing import Any, Dict, Optional

from app.utils.cleaner import clean_text


def build_external_id(
    *,
    source: str,
    source_url: str,
    title: str,
    company: str,
    location: Optional[str],
) -> str:
    key = f"{source}|{source_url.strip().lower()}|{title.strip().lower()}|{company.strip().lower()}|{(location or '').strip().lower()}"
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:24]
    return f"{source}_{digest}"


def normalize_job_payload(
    *,
    source: str,
    scraped_at_iso: str,
    role_keyword: str,
    source_url: str,
    title: str,
    company: str,
    location: Optional[str],
    salary: Optional[str],
    employment_type: Optional[str],
    description: Optional[str],
    description_summary: Optional[str],
    posted_date: Optional[str],
    raw: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    normalized_source_url = source_url.strip()
    normalized_title = clean_text(title)
    normalized_company = clean_text(company)

    return {
        "external_job_id": build_external_id(
            source=source,
            source_url=normalized_source_url,
            title=normalized_title,
            company=normalized_company,
            location=location,
        ),
        "source_name": source,
        "title": normalized_title,
        "company_name": normalized_company,
        "location": clean_text(location) if location else None,
        "salary_min": None,
        "salary_max": None,
        "job_type": clean_text(employment_type) if employment_type else None,
        "work_arrangement": None,
        "description": clean_text(description) if description else None,
        "requirement": clean_text(description_summary) if description_summary else None,
        "source_url": normalized_source_url,
        "posted_at": posted_date,
        "scraped_at": scraped_at_iso,
        "raw": {
            "role_keyword": clean_text(role_keyword),
            **(raw or {}),
        },
    }
