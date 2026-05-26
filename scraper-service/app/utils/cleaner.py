from __future__ import annotations

import re


def clean_text(value: str | None) -> str:
    if value is None:
        return ""
    cleaned = value.replace("\u00a0", " ")
    cleaned = re.sub(r"[\u0000-\u001f\u007f]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()
