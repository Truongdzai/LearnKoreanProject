from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import Depends, Header, HTTPException

from ..errors import AppError
from .. import db

TOKEN_TTL = 60 * 60 * 24 * 30


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return digest.hex(), salt


def verify_password(password: str, pass_hash: str, salt: str) -> bool:
    calc, _ = hash_password(password, salt)
    return hmac.compare_digest(calc, pass_hash)


def _b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _unb64(text: str) -> bytes:
    pad = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + pad)


def make_token(user_id: str, role: str) -> str:
    payload = {"uid": user_id, "role": role, "exp": int(time.time()) + TOKEN_TTL}
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(db.get_secret().encode(), body.encode(), hashlib.sha256).digest()
    return body + "." + _b64(sig)


def read_token(token: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
    except ValueError:
        return None
    expected = hmac.new(db.get_secret().encode(), body.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(_unb64(sig), expected):
        return None
    try:
        payload = json.loads(_unb64(body))
    except Exception:
        return None
    if payload.get("exp", 0) < int(time.time()):
        return None
    return payload


def _load_user(user_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError("AUTH_REQUIRED", "Bạn cần đăng nhập.", 401)
    payload = read_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        raise AppError("AUTH_EXPIRED", "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.", 401)
    user = _load_user(payload["uid"])
    if not user:
        raise AppError("AUTH_EXPIRED", "Tài khoản không tồn tại.", 401)
    if user["status"] != "active":
        raise AppError("ACCOUNT_LOCKED", "Tài khoản đã bị khoá.", 403)
    return user


def get_optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    payload = read_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        return None
    return _load_user(payload["uid"])


def get_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise AppError("FORBIDDEN", "Chỉ quản trị viên mới được phép.", 403)
    return user
