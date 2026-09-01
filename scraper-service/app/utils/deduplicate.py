from __future__ import annotations

from typing import Dict, List


def deduplicate_jobs(jobs: List[Dict]) -> List[Dict]:
    seen_external: set[str] = set()
    seen_url: set[str] = set()
    deduped: List[Dict] = []

    for job in jobs:
        external_id = str(job.get("external_job_id", "")).strip()
        source_url = str(job.get("source_url", "")).strip().lower()

        if external_id and external_id in seen_external:
            continue
        if source_url and source_url in seen_url:
            continue

        if external_id:
            seen_external.add(external_id)
        if source_url:
            seen_url.add(source_url)

        deduped.append(job)

    return deduped
