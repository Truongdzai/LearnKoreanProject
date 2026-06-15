from __future__ import annotations

import sqlite3
from pathlib import Path

from .config import DB_PATH, DATA_DIR, MEDIA_DIR, BACKUP_DIR

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS mined_cards (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at  TEXT DEFAULT (datetime('now', 'localtime')),
    source      TEXT,
    korean      TEXT NOT NULL,
    vietnamese  TEXT,
    note        TEXT,
    anki_id     INTEGER
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
"""

def ensure_dirs() -> None:
    for d in (DATA_DIR, MEDIA_DIR, BACKUP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    ensure_dirs()
    conn = get_conn()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
