from __future__ import annotations

import asyncio
import sqlite3
from datetime import datetime
from pathlib import Path

from ..config import BACKUP_DIR, DB_PATH
from .logs import log

KEEP_LAST = 14
INTERVAL_HOURS = 24


def run_backup() -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = BACKUP_DIR / f"hanquan-{stamp}.db"
    src = sqlite3.connect(str(DB_PATH))
    try:
        dst = sqlite3.connect(str(dest))
        try:
            src.backup(dst)
        finally:
            dst.close()
    finally:
        src.close()
    _prune()
    return dest


def _prune() -> None:
    backups = sorted(BACKUP_DIR.glob("hanquan-*.db"))
    for old in backups[:-KEEP_LAST]:
        try:
            old.unlink()
        except OSError:
            pass


def verify_backup(path: Path) -> dict:
    conn = sqlite3.connect(str(path))
    try:
        ok = conn.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        cards = conn.execute("SELECT COUNT(*) FROM srs_cards").fetchone()[0]
        return {"ok": ok, "users": users, "cards": cards}
    finally:
        conn.close()


async def backup_loop() -> None:
    while True:
        try:
            run_backup()
        except Exception as exc:
            log(f"[VyLing] Sao lưu DB thất bại: {exc}")
        await asyncio.sleep(INTERVAL_HOURS * 3600)
