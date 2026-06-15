from __future__ import annotations

import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config.toml"
EXAMPLE_PATH = ROOT / "config.example.toml"

DEFAULTS: dict = {
    "app": {"name": "Hàn Quân", "native_language": "vie", "target_language": "kor"},
    "llm": {"provider": "none", "api_key": "", "model": ""},
    "anki": {"url": "http://127.0.0.1:8765", "deck": "TiengHan", "note_type": "HanQuan"},
    "whisper": {"model": "small"},
}

def _merge(base: dict, over: dict) -> dict:
    out = dict(base)
    for key, value in over.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _merge(out[key], value)
        else:
            out[key] = value
    return out

def load() -> dict:
    path = CONFIG_PATH if CONFIG_PATH.exists() else (EXAMPLE_PATH if EXAMPLE_PATH.exists() else None)
    if not path:
        return DEFAULTS
    try:
        with open(path, "rb") as f:
            return _merge(DEFAULTS, tomllib.load(f))
    except Exception:
        return DEFAULTS

settings = load()

DATA_DIR = ROOT / "data"
MEDIA_DIR = DATA_DIR / "media"
BACKUP_DIR = DATA_DIR / "backups"
DB_PATH = DATA_DIR / "hanquan.db"
