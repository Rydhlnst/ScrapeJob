from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def save_json(payload: Dict[str, Any], file_path: Path) -> Path:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return file_path
