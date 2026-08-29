from __future__ import annotations

import hashlib
import re
from typing import Any, Dict, Optional
from urllib.parse import urlsplit

from app.utils.cleaner import clean_text


_LIVE_SOURCE_HOSTS = {
    "glints": {"glints.com"},
    "jobstreet": {"id.jobstreet.com"},
    "jobstreetexpress": {"id.jora.com", "jobstreetexpress.com"},
    "kalibrr": {"kalibrr.com"},
    "karir": {"karir.com"},
}

_PLACEHOLDER_COMPANIES = {
    "",
    "unknown company",
    "glints",
    "jobstreet express",
    "kalibrr",
    "karir.com",
    "perusahaan dirahasiakan",
    "confidential",
}

_BLOCKED_TITLES = {
    "access denied",
    "just a moment",
    "page not found",
    "robot check",
    "verify you are human",
    "404",
    "error 404",
}


def is_valid_live_job(
    *,
    source: str,
    source_url: str,
    title: Optional[str],
    company: Optional[str],
) -> bool:
    """Reject records that are not demonstrably sourced from a live listing page."""
    parsed = urlsplit(source_url.strip())
    host = (parsed.hostname or "").lower().removeprefix("www.")
    path = parsed.path.lower()
    normalized_title = clean_text(title or "").strip().lower()
    source_name = source.lower()
    path_is_job_page = {
        "glints": "/opportunities/jobs/" in path,
        "jobstreet": "/job/" in path,
        "jobstreetexpress": "/job/" in path,
        "kalibrr": bool(
            re.search(r"/c/[^/]+/jobs/[^/?#]+", path)
            or re.search(r"/jobs/[^/?#]+", path)
        ),
        "karir": bool(re.fullmatch(r"/opportunities/\d+/?", path)),
    }.get(source_name, False)

    return bool(
        parsed.scheme == "https"
        and host in _LIVE_SOURCE_HOSTS.get(source_name, set())
        and path_is_job_page
        and normalized_title
        and normalized_title not in _BLOCKED_TITLES
        and is_valid_live_company(company)
    )


def is_valid_live_company(company: Optional[str]) -> bool:
    normalized_company = clean_text(company or "").strip().lower()
    return bool(
        normalized_company
        and normalized_company not in _PLACEHOLDER_COMPANIES
        and not normalized_company.startswith(("http://", "https://", "www."))
        and "linkedin.com/" not in normalized_company
    )


def matches_role_keyword(role: str, *texts: Optional[str]) -> bool:
    normalized_role = clean_text(role).lower().strip()
    normalized_role = re.sub(r"\banalist\b|\banalis\b", "analyst", normalized_role)
    if not normalized_role:
        return True

    haystack = clean_text(" ".join(text or "" for text in texts)).lower()
    haystack = re.sub(r"\banalist\b|\banalis\b", "analyst", haystack)
    if normalized_role in haystack:
        return True

    words = [word for word in normalized_role.split() if len(word) > 2]
    return bool(words) and all(word in haystack for word in words)


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
