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
    "together": {"api_key": "", "model": ""},
    "cloudflare": {"account_id": "", "api_token": ""},
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

_ENV_SECRETS = {
    ("llm", "api_key"): "VYLING_LLM_API_KEY",
    ("together", "api_key"): "VYLING_TOGETHER_API_KEY",
    ("cloudflare", "api_token"): "VYLING_CLOUDFLARE_API_TOKEN",
    ("admin", "password"): "VYLING_ADMIN_PASSWORD",
    ("smtp", "password"): "VYLING_SMTP_PASSWORD",
    ("oauth", "google_client_secret"): "VYLING_GOOGLE_CLIENT_SECRET",
    ("oauth", "facebook_app_secret"): "VYLING_FACEBOOK_APP_SECRET",
}


def _apply_env(cfg: dict) -> dict:
    """Nạp bí mật từ biến môi trường, ưu tiên hơn file.

    Khi chạy trên máy thì config.toml là đủ. Nhưng khi chạy trong container
    (Cloudflare Sandbox) thì config.toml KHÔNG nằm trong image — cố ý, để khoá
    API không bị đóng gói vào image. Không có lối này thì `wrangler secret`
    dừng ở Worker và tiến trình Python không bao giờ thấy khoá: web chạy nhưng
    mọi tính năng cần AI đều tắt câm, kể cả dịch phụ đề.
    """
    import os

    for (section, key), var in _ENV_SECRETS.items():
        val = os.environ.get(var, "").strip()
        if val:
            cfg.setdefault(section, {})[key] = val
    return cfg


def load() -> dict:
    path = CONFIG_PATH if CONFIG_PATH.exists() else (EXAMPLE_PATH if EXAMPLE_PATH.exists() else None)
    if not path:
        return _apply_env(dict(DEFAULTS))
    try:
        with open(path, "rb") as f:
            return _apply_env(_merge(DEFAULTS, tomllib.load(f)))
    except Exception:
        return _apply_env(dict(DEFAULTS))

settings = load()

DATA_DIR = ROOT / "data"
MEDIA_DIR = DATA_DIR / "media"
BACKUP_DIR = DATA_DIR / "backups"
DB_PATH = DATA_DIR / "hanquan.db"
