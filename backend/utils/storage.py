import json
from pathlib import Path
from typing import Any


def read_json(path: Path, default: Any):
    if not path.exists():
        return default
    try:
        with open(path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except json.JSONDecodeError:
        return default


def write_json(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
