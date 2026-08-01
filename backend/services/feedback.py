from __future__ import annotations

from fastapi import HTTPException

from ..errors import AppError
from .. import db

KINDS = {"bug", "idea"}
MAX_LEN = 2000
STATUSES = {"new", "seen", "done"}


def add(user: dict | None, kind: str, message: str, page: str = "") -> dict:
    kind = (kind or "idea").strip()
    if kind not in KINDS:
        kind = "idea"
    message = (message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Hãy nhập nội dung phản hồi.")
    if len(message) > MAX_LEN:
        raise HTTPException(status_code=400, detail=f"Phản hồi tối đa {MAX_LEN} ký tự.")
    conn = db.get_conn()
    try:
        owner = user["id"] if user else None
        n = conn.execute(
            "SELECT COUNT(*) FROM feedback WHERE date(created_at) = date('now','localtime') "
            "AND (user_id = ? OR (? IS NULL AND user_id IS NULL))",
            (owner, owner),
        ).fetchone()[0]
        if n >= 20:
            raise AppError("RATE_LIMITED", "Bạn đã gửi nhiều phản hồi hôm nay, hãy quay lại ngày mai nhé.", 429)
        conn.execute(
            "INSERT INTO feedback (user_id, name, kind, message, page) VALUES (?,?,?,?,?)",
            (owner, user["name"] if user else "Khách", kind, message, (page or "")[:100]),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


def admin_list(status: str = "", page: int = 1, page_size: int = 20) -> dict:
    page = max(1, page)
    page_size = min(100, max(1, page_size))
    where, args = "", []
    if status and status in STATUSES:
        where = "WHERE status = ?"
        args.append(status)
    conn = db.get_conn()
    try:
        total = conn.execute(f"SELECT COUNT(*) FROM feedback {where}", args).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM feedback {where} ORDER BY id DESC LIMIT ? OFFSET ?",
            (*args, page_size, (page - 1) * page_size),
        ).fetchall()
    finally:
        conn.close()
    return {
        "total": total,
        "items": [
            {"id": r["id"], "userId": r["user_id"], "name": r["name"], "kind": r["kind"],
             "message": r["message"], "page": r["page"], "status": r["status"], "createdAt": r["created_at"]}
            for r in rows
        ],
    }


def set_status(fb_id: int, status: str) -> dict:
    if status not in STATUSES:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ.")
    conn = db.get_conn()
    try:
        conn.execute("UPDATE feedback SET status = ? WHERE id = ?", (status, fb_id))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


def remove(fb_id: int) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM feedback WHERE id = ?", (fb_id,))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


def count_new() -> int:
    conn = db.get_conn()
    try:
        return conn.execute("SELECT COUNT(*) FROM feedback WHERE status = 'new'").fetchone()[0]
    finally:
        conn.close()
