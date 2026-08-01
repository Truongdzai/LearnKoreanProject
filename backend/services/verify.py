from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from .. import db

CODE_TTL_MIN = 10
MAX_ATTEMPTS = 5


def _hash(code: str) -> str:
    return hashlib.sha256((code + db.get_secret()).encode()).hexdigest()


def create_code(email: str, purpose: str) -> str:
    email = (email or "").strip().lower()
    code = f"{secrets.randbelow(1_000_000):06d}"
    exp = (datetime.now() + timedelta(minutes=CODE_TTL_MIN)).isoformat()
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM verify_codes WHERE email = ? AND purpose = ?", (email, purpose))
        conn.execute(
            "INSERT INTO verify_codes (email, purpose, code_hash, expires_at) VALUES (?,?,?,?)",
            (email, purpose, _hash(code), exp),
        )
        conn.commit()
    finally:
        conn.close()
    return code


def check_code(email: str, purpose: str, code: str) -> bool:
    email = (email or "").strip().lower()
    code = (code or "").strip()
    if not code:
        return False
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT id, code_hash, expires_at, attempts FROM verify_codes "
            "WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1",
            (email, purpose),
        ).fetchone()
        if not row:
            return False
        if datetime.fromisoformat(row["expires_at"]) < datetime.now() or row["attempts"] >= MAX_ATTEMPTS:
            conn.execute("DELETE FROM verify_codes WHERE id = ?", (row["id"],))
            conn.commit()
            return False
        if not hmac.compare_digest(row["code_hash"], _hash(code)):
            conn.execute("UPDATE verify_codes SET attempts = attempts + 1 WHERE id = ?", (row["id"],))
            conn.commit()
            return False
        conn.execute("DELETE FROM verify_codes WHERE id = ?", (row["id"],))
        conn.commit()
        return True
    finally:
        conn.close()
