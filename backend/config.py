from __future__ import annotations

import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config.toml"
EXAMPLE_PATH = ROOT / "config.example.toml"

DEFAULTS: dict = {
    "app": {"name": "Hàn Quân", "native_language": "vie", "target_language": "kor", "public_url": ""},
    "llm": {"provider": "none", "api_key": "", "model": "", "models": [], "image_models": []},
    "wordimage": {"source": "ai"},
    "whisper": {"model": "small"},
    "network": {"proxy": ""},
    "security": {"expose_docs": True, "cors_origins": ["*"]},
    "quota": {"guest_per_day": 20, "user_per_day": 80, "plus_per_day": 250, "burst_per_minute": 12},
    "analytics": {"ga4_id": "", "google_site_verification": ""},
    "smtp": {"host": "", "port": 587, "user": "", "password": "", "sender": "", "sender_name": "VyLing"},
    "email": {"daily_reminder": True, "reminder_hour": 20},
    "admin": {"email": "admin@vyling.vn", "password": "", "name": "Quản trị viên"},
    "webrtc": {
        "stun_urls": ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        "turn_url": "",
        "turn_user": "",
        "turn_password": "",
    },
    "oauth": {
        "google_client_id": "",
        "google_client_secret": "",
        "facebook_app_id": "",
        "facebook_app_secret": "",
    },
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
