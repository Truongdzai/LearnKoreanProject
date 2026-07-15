from __future__ import annotations

import re
import secrets
from datetime import date, timedelta

from fastapi import HTTPException

from .. import db
from ..config import settings
from . import auth

WELCOME_COINS = 50
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def seed_admin() -> None:
    cfg = settings.get("admin", {})
    email = (cfg.get("email") or "").strip().lower()
    password = cfg.get("password") or ""
    name = cfg.get("name") or "Quản trị viên"
    if not email or not password:
        return
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT id, role FROM users WHERE email = ?", (email,)).fetchone()
        pass_hash, salt = auth.hash_password(password)
        if row:
            conn.execute(
                "UPDATE users SET role = 'admin', pass_hash = ?, pass_salt = ?, status = 'active' WHERE id = ?",
                (pass_hash, salt, row["id"]),
            )
        else:
            conn.execute(
                "INSERT INTO users (id, name, email, pass_hash, pass_salt, provider, role) "
                "VALUES (?,?,?,?,?,?,?)",
                (new_id(), name, email, pass_hash, salt, "email", "admin"),
            )
        conn.commit()
    finally:
        conn.close()


def level_for(xp: int) -> int:
    return 1 + max(0, xp) // 500


def new_id() -> str:
    return "u" + secrets.token_hex(8)


def plus_active(row: dict) -> bool:
    if not row.get("is_plus"):
        return False
    until = row.get("plus_until")
    if not until:
        return True
    return str(until)[:10] >= date.today().isoformat()


def public_user(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "provider": row["provider"],
        "role": row["role"],
        "avatar": row["avatar"],
        "isPlus": plus_active(row),
        "plusUntil": row.get("plus_until"),
        "coins": row["coins"],
        "xp": row["xp"],
        "level": level_for(row["xp"]),
        "streak": row["streak"],
        "equippedFrame": row["equipped_frame"],
        "equippedPet": row["equipped_pet"] if "equipped_pet" in row.keys() else None,
        "equippedBg": row["equipped_bg"] if "equipped_bg" in row.keys() else None,
        "goal": row["goal"] if "goal" in row.keys() else None,
    }


def _by_email(conn, email: str):
    return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def register(name: str, email: str, password: str) -> dict:
    email = (email or "").strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Email không hợp lệ.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu cần ít nhất 6 ký tự.")
    conn = db.get_conn()
    try:
        if _by_email(conn, email):
            raise HTTPException(status_code=409, detail="Email này đã được đăng ký. Hãy đăng nhập.")
        pass_hash, salt = auth.hash_password(password)
        uid = new_id()
        conn.execute(
            "INSERT INTO users (id, name, email, pass_hash, pass_salt, provider, role, coins) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (uid, (name or "").strip() or email.split("@")[0], email, pass_hash, salt, "email", "user", WELCOME_COINS),
        )
        conn.commit()
        row = dict(conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone())
    finally:
        conn.close()
    touch_streak(uid)
    return row


def login(email: str, password: str) -> dict:
    email = (email or "").strip().lower()
    conn = db.get_conn()
    try:
        row = _by_email(conn, email)
        if not row or not row["pass_hash"]:
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")
        if not auth.verify_password(password, row["pass_hash"], row["pass_salt"]):
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")
        if row["status"] != "active":
            raise HTTPException(status_code=403, detail="Tài khoản đã bị khoá.")
        row = dict(row)
    finally:
        conn.close()
    touch_streak(row["id"])
    return reload(row["id"])


def reload(user_id: str) -> dict:
    conn = db.get_conn()
    try:
        return dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
    finally:
        conn.close()


def upsert_oauth_user(provider: str, info: dict) -> dict:
    oauth_id = info.get("id")
    email = (info.get("email") or "").strip().lower()
    if not email:
        email = f"{provider}.{oauth_id}@vyling.local"
    name = (info.get("name") or "").strip() or email.split("@")[0]
    avatar = info.get("avatar")
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if row:
            uid = row["id"]
            if avatar and not row["avatar"]:
                conn.execute("UPDATE users SET avatar = ? WHERE id = ?", (avatar, uid))
            if row["status"] != "active":
                raise HTTPException(status_code=403, detail="Tài khoản đã bị khoá.")
            conn.commit()
        else:
            uid = new_id()
            conn.execute(
                "INSERT INTO users (id, name, email, provider, role, avatar, coins) VALUES (?,?,?,?,?,?,?)",
                (uid, name, email, provider, "user", avatar, WELCOME_COINS),
            )
            conn.commit()
    finally:
        conn.close()
    touch_streak(uid)
    return reload(uid)


def touch_streak(user_id: str) -> None:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT streak, last_active FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return
        today = date.today()
        last = row["last_active"]
        streak = row["streak"] or 0
        if last:
            try:
                last_day = date.fromisoformat(last[:10])
            except ValueError:
                last_day = None
            if last_day == today:
                return
            if last_day == today - timedelta(days=1):
                streak += 1
            else:
                streak = 1
        else:
            streak = 1
        conn.execute(
            "UPDATE users SET streak = ?, last_active = datetime('now','localtime') WHERE id = ?",
            (streak, user_id),
        )
        conn.commit()
    finally:
        conn.close()


def add_xp_coins(user_id: str, xp: int = 0, coins: int = 0) -> dict:
    conn = db.get_conn()
    try:
        conn.execute(
            "UPDATE users SET xp = MAX(0, xp + ?), coins = MAX(0, coins + ?) WHERE id = ?",
            (xp, coins, user_id),
        )
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def spend_coins(user_id: str, amount: int) -> bool:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT coins FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row or row["coins"] < amount:
            return False
        conn.execute("UPDATE users SET coins = coins - ? WHERE id = ?", (amount, user_id))
        conn.commit()
        return True
    finally:
        conn.close()


def set_plus(user_id: str, value: bool) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET is_plus = ?, plus_until = NULL WHERE id = ?", (1 if value else 0, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def admin_set_plus_until(user_id: str, until: str | None) -> dict:
    norm: str | None = None
    if until:
        try:
            norm = date.fromisoformat(str(until)[:10]).isoformat()
        except ValueError:
            raise HTTPException(status_code=400, detail="Ngày kết thúc không hợp lệ (định dạng YYYY-MM-DD).")
    conn = db.get_conn()
    try:
        if not conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        conn.execute("UPDATE users SET is_plus = 1, plus_until = ? WHERE id = ?", (norm, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def grant_plan(user_id: str, plan_id: str) -> dict:
    from . import catalog
    p = catalog.plan(plan_id)
    if not p:
        raise HTTPException(status_code=404, detail="Gói đăng ký không tồn tại.")
    days = int(p["days"] or 0)
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT is_plus, plus_until FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        until = None
        if days > 0:
            base = date.today()
            if row["is_plus"] and row["plus_until"]:
                try:
                    base = max(base, date.fromisoformat(str(row["plus_until"])[:10]))
                except ValueError:
                    pass
            until = (base + timedelta(days=days)).isoformat()
        conn.execute("UPDATE users SET is_plus = 1, plus_until = ? WHERE id = ?", (until, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def gift_coins(user_id: str, coins: int, message: str = "") -> dict:
    coins = int(coins)
    if coins <= 0:
        raise HTTPException(status_code=400, detail="Số xu tặng phải lớn hơn 0.")
    conn = db.get_conn()
    try:
        if not conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        conn.execute(
            "INSERT INTO coin_gifts (user_id, coins, message) VALUES (?,?,?)",
            (user_id, coins, (message or "").strip()),
        )
        conn.execute("UPDATE users SET coins = coins + ? WHERE id = ?", (coins, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def pending_gift(user_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT COALESCE(SUM(coins),0) AS coins, COUNT(*) AS n FROM coin_gifts "
            "WHERE user_id = ? AND acknowledged = 0",
            (user_id,),
        ).fetchone()
        msg = conn.execute(
            "SELECT message FROM coin_gifts WHERE user_id = ? AND acknowledged = 0 "
            "AND message != '' ORDER BY id DESC LIMIT 1",
            (user_id,),
        ).fetchone()
    finally:
        conn.close()
    if not row or row["n"] == 0:
        return None
    return {"coins": row["coins"], "message": msg["message"] if msg else ""}


def ack_gifts(user_id: str) -> None:
    conn = db.get_conn()
    try:
        conn.execute(
            "UPDATE coin_gifts SET acknowledged = 1 WHERE user_id = ? AND acknowledged = 0",
            (user_id,),
        )
        conn.commit()
    finally:
        conn.close()


GOALS = {"talk", "work", "travel", "exam"}


def set_goal(user_id: str, goal: str | None) -> dict:
    if goal and goal not in GOALS:
        raise HTTPException(status_code=400, detail="Mục tiêu không hợp lệ.")
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET goal = ? WHERE id = ?", (goal or None, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def equip_frame(user_id: str, frame: str | None) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET equipped_frame = ? WHERE id = ?", (frame, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def equip_pet(user_id: str, pet: str | None) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET equipped_pet = ? WHERE id = ?", (pet, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def equip_bg(user_id: str, bg: str | None) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET equipped_bg = ? WHERE id = ?", (bg, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


AVATAR_RE = re.compile(r"^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$")


def set_avatar(user_id: str, avatar: str | None) -> dict:
    if avatar is not None:
        if len(avatar) > 200_000 or not AVATAR_RE.match(avatar):
            raise HTTPException(status_code=400, detail="Ảnh không hợp lệ (PNG/JPG/WebP, tối đa ~150KB).")
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET avatar = ? WHERE id = ?", (avatar, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def leaderboard(current_id: str | None = None, limit: int = 50) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT id, name, avatar, xp, streak, is_plus, plus_until, equipped_frame, equipped_bg FROM users "
            "WHERE status = 'active' AND role != 'admin' ORDER BY xp DESC, streak DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()
    out = []
    for i, r in enumerate(rows):
        out.append({
            "rank": i + 1,
            "id": r["id"],
            "name": r["name"],
            "xp": r["xp"],
            "level": level_for(r["xp"]),
            "streak": r["streak"],
            "isPlus": plus_active(dict(r)),
            "frame": r["equipped_frame"],
            "bg": r["equipped_bg"],
            "avatar": r["avatar"],
            "me": r["id"] == current_id,
        })
    return out


_SORTS = {
    "recent": "created_at DESC",
    "oldest": "created_at ASC",
    "active": "last_active DESC",
    "coins": "coins DESC",
    "xp": "xp DESC",
    "name": "name COLLATE NOCASE ASC",
}


def admin_list_users(
    query: str = "",
    role: str = "",
    status: str = "",
    plus: str = "",
    sort: str = "recent",
    page: int = 1,
    page_size: int = 20,
) -> dict:
    where, params = [], []
    if query:
        like = f"%{query}%"
        where.append("(name LIKE ? OR email LIKE ? OR phone LIKE ?)")
        params += [like, like, like]
    if role in ("user", "admin"):
        where.append("role = ?")
        params.append(role)
    if status in ("active", "locked"):
        where.append("status = ?")
        params.append(status)
    if plus == "plus":
        where.append("is_plus = 1")
    elif plus == "free":
        where.append("is_plus = 0")
    clause = ("WHERE " + " AND ".join(where)) if where else ""
    order = _SORTS.get(sort, _SORTS["recent"])
    page = max(1, int(page))
    page_size = max(1, min(100, int(page_size)))
    offset = (page - 1) * page_size

    conn = db.get_conn()
    try:
        total = conn.execute(f"SELECT COUNT(*) AS n FROM users {clause}", params).fetchone()["n"]
        rows = conn.execute(
            f"SELECT * FROM users {clause} ORDER BY {order} LIMIT ? OFFSET ?",
            (*params, page_size, offset),
        ).fetchall()
    finally:
        conn.close()
    users = [
        {
            **public_user(dict(r)),
            "status": r["status"],
            "createdAt": r["created_at"],
            "lastActive": r["last_active"],
        }
        for r in rows
    ]
    return {"users": users, "total": total, "page": page, "pageSize": page_size}


def admin_update_user(user_id: str, fields: dict) -> dict:
    allowed = {"name", "role", "status", "is_plus", "coins", "xp", "streak"}
    sets, vals = [], []
    for k, v in fields.items():
        if k in allowed and v is not None:
            sets.append(f"{k} = ?")
            vals.append(int(v) if k in {"is_plus", "coins", "xp", "streak"} else v)
    if not sets:
        return reload(user_id)
    vals.append(user_id)
    conn = db.get_conn()
    try:
        if not conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        conn.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = ?", vals)
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def admin_delete_user(user_id: str) -> None:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        if row["role"] == "admin":
            raise HTTPException(status_code=400, detail="Không thể xoá tài khoản quản trị viên.")
        for table in ("user_items", "user_garden", "user_paths", "user_videos", "quest_progress", "activity_log", "coin_gifts"):
            conn.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()
