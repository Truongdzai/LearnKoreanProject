from __future__ import annotations

import sqlite3
import secrets
from pathlib import Path

from .config import DB_PATH, DATA_DIR, MEDIA_DIR, BACKUP_DIR

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS study_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  TEXT DEFAULT (datetime('now', 'localtime')),
    activity    TEXT,
    detail      TEXT
);

CREATE TABLE IF NOT EXISTS translation_cache (
    ko          TEXT PRIMARY KEY,
    vi          TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS srs_cards (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT NOT NULL DEFAULT 'local',
    front         TEXT NOT NULL,
    back          TEXT,
    source        TEXT,
    reps          INTEGER NOT NULL DEFAULT 0,
    ivl           INTEGER NOT NULL DEFAULT 0,
    ease          REAL    NOT NULL DEFAULT 2.5,
    due           TEXT    NOT NULL DEFAULT (date('now','localtime')),
    created_at    TEXT DEFAULT (datetime('now','localtime')),
    last_reviewed TEXT
);
CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_cards(user_id, due);
CREATE INDEX IF NOT EXISTS idx_srs_front ON srs_cards(user_id, front);

CREATE TABLE IF NOT EXISTS srs_reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id     INTEGER NOT NULL,
    user_id     TEXT NOT NULL DEFAULT 'local',
    rating      INTEGER NOT NULL,
    reviewed_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS users (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    email          TEXT UNIQUE,
    phone          TEXT UNIQUE,
    pass_hash      TEXT,
    pass_salt      TEXT,
    provider       TEXT NOT NULL DEFAULT 'email',
    role           TEXT NOT NULL DEFAULT 'user',
    avatar         TEXT,
    is_plus        INTEGER NOT NULL DEFAULT 0,
    coins          INTEGER NOT NULL DEFAULT 0,
    xp             INTEGER NOT NULL DEFAULT 0,
    streak         INTEGER NOT NULL DEFAULT 0,
    equipped_frame TEXT,
    status         TEXT NOT NULL DEFAULT 'active',
    created_at     TEXT DEFAULT (datetime('now','localtime')),
    last_active    TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp);

CREATE TABLE IF NOT EXISTS user_items (
    user_id    TEXT NOT NULL,
    item_id    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_garden (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    item_id    TEXT,
    art        TEXT NOT NULL,
    name       TEXT NOT NULL,
    growth     INTEGER NOT NULL DEFAULT 8,
    planted_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_garden_user ON user_garden(user_id);

CREATE TABLE IF NOT EXISTS user_paths (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    title      TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_paths_user ON user_paths(user_id);

CREATE TABLE IF NOT EXISTS user_videos (
    user_id    TEXT NOT NULL,
    video_id   TEXT NOT NULL,
    title      TEXT,
    channel    TEXT,
    level      TEXT,
    dur        TEXT,
    topic      TEXT,
    tone       TEXT,
    lang       TEXT NOT NULL DEFAULT 'ko',
    created_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_uvideos_user ON user_videos(user_id);

CREATE TABLE IF NOT EXISTS quest_progress (
    user_id    TEXT NOT NULL,
    quest_id   TEXT NOT NULL,
    period_key TEXT NOT NULL,
    progress   INTEGER NOT NULL DEFAULT 0,
    claimed    INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, quest_id, period_key)
);

CREATE TABLE IF NOT EXISTS activity_log (
    user_id  TEXT NOT NULL,
    day      TEXT NOT NULL,
    minutes  INTEGER NOT NULL DEFAULT 0,
    words    INTEGER NOT NULL DEFAULT 0,
    xp       INTEGER NOT NULL DEFAULT 0,
    lessons  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS catalog_videos (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    channel  TEXT,
    level    TEXT,
    dur      TEXT,
    topic    TEXT,
    tone     TEXT,
    lang     TEXT NOT NULL DEFAULT 'ko',
    sort     INTEGER NOT NULL DEFAULT 0,
    active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS catalog_quests (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    descr    TEXT,
    period   TEXT NOT NULL DEFAULT 'daily',
    metric   TEXT NOT NULL DEFAULT 'lesson',
    reward   INTEGER NOT NULL DEFAULT 0,
    target   INTEGER NOT NULL DEFAULT 1,
    plus     INTEGER NOT NULL DEFAULT 0,
    sort     INTEGER NOT NULL DEFAULT 0,
    active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS catalog_shop (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    descr    TEXT,
    price    INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'seed',
    art      TEXT NOT NULL,
    plus     INTEGER NOT NULL DEFAULT 0,
    sort     INTEGER NOT NULL DEFAULT 0,
    active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS catalog_plans (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    tagline  TEXT,
    original TEXT,
    price    TEXT,
    unit     TEXT,
    note     TEXT,
    cta      TEXT,
    days     INTEGER NOT NULL DEFAULT 30,
    featured INTEGER NOT NULL DEFAULT 0,
    sort     INTEGER NOT NULL DEFAULT 0,
    active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS coin_gifts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      TEXT NOT NULL,
    coins        INTEGER NOT NULL DEFAULT 0,
    message      TEXT,
    acknowledged INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_gifts_user ON coin_gifts(user_id, acknowledged);

CREATE TABLE IF NOT EXISTS lesson_cache (
    video_id   TEXT PRIMARY KEY,
    title      TEXT,
    channel    TEXT,
    source     TEXT,
    data       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS dict_cache (
    word       TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS speaker_cache (
    video_id   TEXT PRIMARY KEY,
    speakers   TEXT NOT NULL,
    names      TEXT,
    source     TEXT,
    updated_at TEXT DEFAULT (datetime('now','localtime'))
);
"""

def ensure_dirs() -> None:
    for d in (DATA_DIR, MEDIA_DIR, BACKUP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    # Wait (don't error) if another connection is mid-write — key under concurrency.
    conn.execute("PRAGMA busy_timeout=10000")
    return conn

def get_setting(key: str, default: str | None = None) -> str | None:
    conn = get_conn()
    try:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default
    finally:
        conn.close()

def set_setting(key: str, value: str) -> None:
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?,?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value),
        )
        conn.commit()
    finally:
        conn.close()

def get_secret() -> str:
    secret = get_setting("auth_secret")
    if not secret:
        secret = secrets.token_hex(32)
        set_setting("auth_secret", secret)
    return secret

def _migrate(conn: sqlite3.Connection) -> None:
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "plus_until" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN plus_until TEXT")
    if "equipped_pet" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN equipped_pet TEXT")
    vcols = {r["name"] for r in conn.execute("PRAGMA table_info(catalog_videos)").fetchall()}
    if "lang" not in vcols:
        conn.execute("ALTER TABLE catalog_videos ADD COLUMN lang TEXT NOT NULL DEFAULT 'ko'")
    uvcols = {r["name"] for r in conn.execute("PRAGMA table_info(user_videos)").fetchall()}
    if "lang" not in uvcols:
        conn.execute("ALTER TABLE user_videos ADD COLUMN lang TEXT NOT NULL DEFAULT 'ko'")


def init_db() -> None:
    ensure_dirs()
    conn = get_conn()
    try:
        # WAL = concurrent reads + one writer (many users at once without locking up).
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.executescript(SCHEMA)
        _migrate(conn)
        conn.commit()
    finally:
        conn.close()
    get_secret()
