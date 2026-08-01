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

CREATE TABLE IF NOT EXISTS translation_cache_native (
    lang        TEXT NOT NULL,
    native      TEXT NOT NULL,
    ko          TEXT NOT NULL,
    txt         TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (lang, native, ko)
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
    equipped_bg    TEXT,
    goal           TEXT,
    status         TEXT NOT NULL DEFAULT 'active',
    token_version  INTEGER NOT NULL DEFAULT 0,
    ref_by         TEXT,
    ref_count      INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT DEFAULT (datetime('now','localtime')),
    last_active    TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp);

CREATE TABLE IF NOT EXISTS login_attempts (
    key          TEXT PRIMARY KEY,
    fails        INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    updated_at   TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage (
    subject    TEXT NOT NULL,
    day        TEXT NOT NULL,
    used       INTEGER NOT NULL DEFAULT 0,
    minute_key TEXT,
    minute_n   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT,
    PRIMARY KEY (subject, day)
);

CREATE TABLE IF NOT EXISTS verify_codes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL,
    purpose    TEXT NOT NULL,
    code_hash  TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_verify_email ON verify_codes(email, purpose);

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
    videos   INTEGER NOT NULL DEFAULT 0,
    reviews  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS user_plans (
    user_id    TEXT NOT NULL,
    plan_id    TEXT NOT NULL,
    data       TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, plan_id)
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
    active   INTEGER NOT NULL DEFAULT 1,
    custom   INTEGER NOT NULL DEFAULT 0
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
    active   INTEGER NOT NULL DEFAULT 1,
    custom   INTEGER NOT NULL DEFAULT 0
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

CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT,
    name       TEXT,
    kind       TEXT NOT NULL DEFAULT 'idea',
    message    TEXT NOT NULL,
    page       TEXT,
    status     TEXT NOT NULL DEFAULT 'new',
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, created_at);

CREATE TABLE IF NOT EXISTS email_log (
    user_id TEXT NOT NULL,
    kind    TEXT NOT NULL,
    day     TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, kind, day)
);

CREATE TABLE IF NOT EXISTS league_members (
    week    TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tier    INTEGER NOT NULL DEFAULT 0,
    settled INTEGER NOT NULL DEFAULT 0,
    rank    INTEGER,
    xp      INTEGER NOT NULL DEFAULT 0,
    result  TEXT,
    reward  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (week, user_id)
);
CREATE INDEX IF NOT EXISTS idx_league_week ON league_members(week, tier);

CREATE TABLE IF NOT EXISTS duels (
    id         TEXT PRIMARY KEY,
    a_id       TEXT NOT NULL,
    b_id       TEXT,
    start_day  TEXT,
    end_day    TEXT,
    status     TEXT NOT NULL DEFAULT 'open',
    winner     TEXT,
    a_xp       INTEGER NOT NULL DEFAULT 0,
    b_xp       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_duels_a ON duels(a_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_b ON duels(b_id, status);

CREATE TABLE IF NOT EXISTS admin_audit (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id   TEXT NOT NULL,
    admin_name TEXT,
    action     TEXT NOT NULL,
    target     TEXT,
    detail     TEXT,
    ip         TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON admin_audit(created_at DESC);
"""

def ensure_dirs() -> None:
    for d in (DATA_DIR, MEDIA_DIR, BACKUP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
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
    if "equipped_bg" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN equipped_bg TEXT")
    if "goal" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN goal TEXT")
    if "token_version" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0")
    if "ref_by" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN ref_by TEXT")
    if "ref_count" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN ref_count INTEGER NOT NULL DEFAULT 0")
    if "league_tier" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN league_tier INTEGER NOT NULL DEFAULT 0")
    if "email_verified" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0")
        conn.execute("UPDATE users SET email_verified = 1 WHERE provider != 'email' AND email IS NOT NULL")
    if "email_optout" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN email_optout INTEGER NOT NULL DEFAULT 0")
    vcols = {r["name"] for r in conn.execute("PRAGMA table_info(catalog_videos)").fetchall()}
    if "lang" not in vcols:
        conn.execute("ALTER TABLE catalog_videos ADD COLUMN lang TEXT NOT NULL DEFAULT 'ko'")
    if "custom" not in vcols:
        conn.execute("ALTER TABLE catalog_videos ADD COLUMN custom INTEGER NOT NULL DEFAULT 0")
    scols = {r["name"] for r in conn.execute("PRAGMA table_info(catalog_shop)").fetchall()}
    if "custom" not in scols:
        conn.execute("ALTER TABLE catalog_shop ADD COLUMN custom INTEGER NOT NULL DEFAULT 0")
    uvcols = {r["name"] for r in conn.execute("PRAGMA table_info(user_videos)").fetchall()}
    if "lang" not in uvcols:
        conn.execute("ALTER TABLE user_videos ADD COLUMN lang TEXT NOT NULL DEFAULT 'ko'")
    acols = {r["name"] for r in conn.execute("PRAGMA table_info(activity_log)").fetchall()}
    if "videos" not in acols:
        conn.execute("ALTER TABLE activity_log ADD COLUMN videos INTEGER NOT NULL DEFAULT 0")
    if "reviews" not in acols:
        conn.execute("ALTER TABLE activity_log ADD COLUMN reviews INTEGER NOT NULL DEFAULT 0")


def init_db() -> None:
    ensure_dirs()
    conn = get_conn()
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.executescript(SCHEMA)
        _migrate(conn)
        conn.commit()
    finally:
        conn.close()
    get_secret()
