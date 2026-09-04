from __future__ import annotations

import re
import secrets
from datetime import date, datetime, timedelta

from fastapi import HTTPException

from ..errors import AppError
from .. import db
from ..config import settings
from . import auth, mailer, verify
from .logs import log

WELCOME_COINS = 50
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

PASSWORD_MIN = 6
PASSWORD_MAX = 128
NAME_MAX = 80
EMAIL_MAX = 190


def check_password_shape(password: str) -> str:
    pw = password or ""
    if len(pw) < PASSWORD_MIN:
        raise HTTPException(status_code=400, detail=f"Mật khẩu cần ít nhất {PASSWORD_MIN} ký tự.")
    if len(pw) > PASSWORD_MAX:
        raise HTTPException(status_code=400, detail=f"Mật khẩu tối đa {PASSWORD_MAX} ký tự.")
    return pw


LEGACY_ADMIN_PASSWORD = "Admin@123"


def seed_admin() -> None:
    cfg = settings.get("admin", {})
    email = (cfg.get("email") or "").strip().lower()
    password = cfg.get("password") or ""
    name = cfg.get("name") or "Quản trị viên"
    if not email:
        return
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT id, role, pass_hash, pass_salt FROM users WHERE email = ?", (email,)
        ).fetchone()
        generated = ""
        if not password:
            if row and row["pass_hash"] and not auth.verify_password(
                LEGACY_ADMIN_PASSWORD, row["pass_hash"], row["pass_salt"]
            ):
                return
            password = generated = secrets.token_urlsafe(12)
        if row:
            if row["pass_hash"] and auth.verify_password(password, row["pass_hash"], row["pass_salt"]):
                if row["role"] != "admin":
                    conn.execute("UPDATE users SET role = 'admin', status = 'active' WHERE id = ?", (row["id"],))
                    conn.commit()
                return
            pass_hash, salt = auth.hash_password(password)
            conn.execute(
                "UPDATE users SET role = 'admin', pass_hash = ?, pass_salt = ?, status = 'active', "
                "token_version = token_version + 1 WHERE id = ?",
                (pass_hash, salt, row["id"]),
            )
        else:
            pass_hash, salt = auth.hash_password(password)
            conn.execute(
                "INSERT INTO users (id, name, email, pass_hash, pass_salt, provider, role) "
                "VALUES (?,?,?,?,?,?,?)",
                (new_id(), name, email, pass_hash, salt, "email", "admin"),
            )
        conn.commit()
        if generated:
            log(f"[VyLing] Mật khẩu admin mới cho {email}: {generated} — lưu lại ngay, chỉ hiện 1 lần.")
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
        "refCount": row["ref_count"] if "ref_count" in row.keys() else 0,
        "emailVerified": bool(row["email_verified"]) if "email_verified" in row.keys() else True,
        "emailOptout": bool(row["email_optout"]) if "email_optout" in row.keys() else False,
    }


def _by_email(conn, email: str):
    return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


REGISTER_MAX = 8
REGISTER_WINDOW_MIN = 60


def _register_rl(conn, ip: str) -> None:
    if not ip:
        return
    key = f"register|{ip}"
    now = datetime.now()
    row = conn.execute("SELECT fails, updated_at FROM login_attempts WHERE key = ?", (key,)).fetchone()
    n = 0
    if row and row["updated_at"] and now - datetime.fromisoformat(row["updated_at"]) < timedelta(minutes=REGISTER_WINDOW_MIN):
        n = row["fails"]
    if n >= REGISTER_MAX:
        raise AppError("RATE_LIMITED", "Bạn đã tạo quá nhiều tài khoản từ thiết bị này. Hãy thử lại sau.", 429)
    conn.execute(
        "INSERT INTO login_attempts (key, fails, locked_until, updated_at) VALUES (?,?,NULL,?) "
        "ON CONFLICT(key) DO UPDATE SET fails = ?, updated_at = ?",
        (key, n + 1, now.isoformat(), n + 1, now.isoformat()),
    )
    conn.commit()


REF_REWARD = 100


def _apply_referral(conn, new_uid: str, ref: str) -> None:
    ref = (ref or "").strip()
    if not ref or ref == new_uid:
        return
    inviter = conn.execute("SELECT id FROM users WHERE id = ? AND status = 'active'", (ref,)).fetchone()
    if not inviter:
        return
    conn.execute("UPDATE users SET coins = coins + ?, ref_count = ref_count + 1 WHERE id = ?", (REF_REWARD, ref))
    conn.execute("UPDATE users SET coins = coins + ?, ref_by = ? WHERE id = ?", (REF_REWARD, ref, new_uid))


def register(name: str, email: str, password: str, ip: str = "", ref: str = "") -> dict:
    email = (email or "").strip().lower()
    if len(email) > EMAIL_MAX or not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Email không hợp lệ.")
    check_password_shape(password)
    name = (name or "").strip()[:NAME_MAX]
    conn = db.get_conn()
    try:
        _register_rl(conn, ip)
        if _by_email(conn, email):
            raise HTTPException(status_code=409, detail="Email này đã được đăng ký. Hãy đăng nhập.")
        pass_hash, salt = auth.hash_password(password)
        uid = new_id()
        conn.execute(
            "INSERT INTO users (id, name, email, pass_hash, pass_salt, provider, role, coins) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (uid, name or email.split("@")[0], email, pass_hash, salt, "email", "user", WELCOME_COINS),
        )
        _apply_referral(conn, uid, ref)
        conn.commit()
        row = dict(conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone())
    finally:
        conn.close()
    touch_streak(uid)
    try:
        request_verify(row)
    except Exception:
        pass
    return row


LOGIN_MAX_FAILS = 10
LOGIN_LOCK_MINUTES = 15


def _rl_check(conn, key: str) -> None:
    row = conn.execute("SELECT fails, locked_until, updated_at FROM login_attempts WHERE key = ?", (key,)).fetchone()
    if not row:
        return
    now = datetime.now()
    if row["locked_until"] and datetime.fromisoformat(row["locked_until"]) > now:
        raise AppError(
            "RATE_LIMITED",
            f"Đăng nhập sai quá nhiều lần. Hãy thử lại sau {LOGIN_LOCK_MINUTES} phút.",
            429,
        )


def _rl_fail(conn, key: str) -> None:
    now = datetime.now()
    row = conn.execute("SELECT fails, updated_at FROM login_attempts WHERE key = ?", (key,)).fetchone()
    fails = 1
    if row and row["updated_at"] and now - datetime.fromisoformat(row["updated_at"]) < timedelta(minutes=LOGIN_LOCK_MINUTES):
        fails = row["fails"] + 1
    locked = (now + timedelta(minutes=LOGIN_LOCK_MINUTES)).isoformat() if fails >= LOGIN_MAX_FAILS else None
    conn.execute(
        "INSERT INTO login_attempts (key, fails, locked_until, updated_at) VALUES (?,?,?,?) "
        "ON CONFLICT(key) DO UPDATE SET fails = ?, locked_until = ?, updated_at = ?",
        (key, 0 if locked else fails, locked, now.isoformat(), 0 if locked else fails, locked, now.isoformat()),
    )
    conn.commit()


def _rl_clear(conn, key: str) -> None:
    conn.execute("DELETE FROM login_attempts WHERE key = ?", (key,))
    conn.commit()


def login(email: str, password: str, ip: str = "") -> dict:
    email = (email or "").strip().lower()
    rl_key = f"{email}|{ip}"
    conn = db.get_conn()
    try:
        _rl_check(conn, rl_key)
        row = _by_email(conn, email)
        if not row or not row["pass_hash"] or not auth.verify_password(password, row["pass_hash"], row["pass_salt"]):
            _rl_fail(conn, rl_key)
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")
        if row["status"] != "active":
            raise AppError("ACCOUNT_LOCKED", "Tài khoản đã bị khoá.", 403)
        _rl_clear(conn, rl_key)
        row = dict(row)
    finally:
        conn.close()
    return reload(row["id"])


def reload(user_id: str) -> dict:
    conn = db.get_conn()
    try:
        return dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
    finally:
        conn.close()



CODE_MAX = 5
CODE_WINDOW_MIN = 15


def _code_rl(conn, email: str) -> None:
    key = f"code|{email}"
    now = datetime.now()
    row = conn.execute("SELECT fails, updated_at FROM login_attempts WHERE key = ?", (key,)).fetchone()
    n = 0
    if row and row["updated_at"] and now - datetime.fromisoformat(row["updated_at"]) < timedelta(minutes=CODE_WINDOW_MIN):
        n = row["fails"]
    if n >= CODE_MAX:
        raise AppError("RATE_LIMITED", "Bạn đã yêu cầu mã quá nhiều lần. Hãy thử lại sau ít phút.", 429)
    conn.execute(
        "INSERT INTO login_attempts (key, fails, locked_until, updated_at) VALUES (?,?,NULL,?) "
        "ON CONFLICT(key) DO UPDATE SET fails = ?, updated_at = ?",
        (key, n + 1, now.isoformat(), n + 1, now.isoformat()),
    )
    conn.commit()


def request_reset(email: str) -> None:
    email = (email or "").strip().lower()
    if not EMAIL_RE.match(email):
        return
    conn = db.get_conn()
    try:
        _code_rl(conn, email)
        row = _by_email(conn, email)
    finally:
        conn.close()
    if row and row["provider"] == "email" and row["pass_hash"]:
        code = verify.create_code(email, "reset")
        mailer.send_code(email, code, "reset")


VERIFY_REWARD = 50


def request_verify(user: dict) -> None:
    email = (user.get("email") or "").strip().lower()
    if not email or user.get("provider") != "email" or user.get("email_verified"):
        return
    conn = db.get_conn()
    try:
        _code_rl(conn, email)
    finally:
        conn.close()
    mailer.send_code(email, verify.create_code(email, "verify"), "verify")


def confirm_verify(user_id: str, code: str) -> dict:
    row = reload(user_id)
    if row.get("email_verified"):
        return row
    email = (row.get("email") or "").strip().lower()
    if not verify.check_code(email, "verify", code):
        raise AppError("BAD_CODE", "Mã xác minh không đúng hoặc đã hết hạn.", 400)
    conn = db.get_conn()
    try:
        conn.execute(
            "UPDATE users SET email_verified = 1, coins = coins + ? WHERE id = ?",
            (VERIFY_REWARD, user_id),
        )
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def set_email_optout(user_id: str, optout: bool) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET email_optout = ? WHERE id = ?", (1 if optout else 0, user_id))
        conn.commit()
    finally:
        conn.close()
    return reload(user_id)


def reset_password(email: str, code: str, new_password: str) -> None:
    email = (email or "").strip().lower()
    check_password_shape(new_password)
    if not verify.check_code(email, "reset", code):
        raise AppError("BAD_CODE", "Mã xác nhận không đúng hoặc đã hết hạn.", 400)
    conn = db.get_conn()
    try:
        row = _by_email(conn, email)
        if not row or row["provider"] != "email":
            raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản.")
        if row["status"] != "active":
            raise AppError("ACCOUNT_LOCKED", "Tài khoản đã bị khoá.", 403)
        pass_hash, salt = auth.hash_password(new_password)
        conn.execute(
            "UPDATE users SET pass_hash = ?, pass_salt = ?, token_version = token_version + 1 WHERE id = ?",
            (pass_hash, salt, row["id"]),
        )
        conn.commit()
    finally:
        conn.close()


def request_change(user: dict) -> None:
    if user.get("provider") != "email" or not user.get("email"):
        raise HTTPException(status_code=400, detail="Tài khoản này đăng nhập qua mạng xã hội, không có mật khẩu để đổi.")
    email = user["email"].strip().lower()
    conn = db.get_conn()
    try:
        _code_rl(conn, email)
    finally:
        conn.close()
    code = verify.create_code(email, "change")
    mailer.send_code(email, code, "change")


def change_password(user_id: str, current_password: str, code: str, new_password: str) -> dict:
    check_password_shape(new_password)
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản.")
        row = dict(row)
        if row["provider"] != "email" or not row["pass_hash"]:
            raise HTTPException(status_code=400, detail="Tài khoản này không có mật khẩu để đổi.")
        if not auth.verify_password(current_password or "", row["pass_hash"], row["pass_salt"]):
            raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng.")
        if not verify.check_code(row["email"].strip().lower(), "change", code):
            raise AppError("BAD_CODE", "Mã xác nhận không đúng hoặc đã hết hạn.", 400)
        pass_hash, salt = auth.hash_password(new_password)
        conn.execute(
            "UPDATE users SET pass_hash = ?, pass_salt = ?, token_version = token_version + 1 WHERE id = ?",
            (pass_hash, salt, user_id),
        )
        conn.commit()
        return dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
    finally:
        conn.close()


def upsert_oauth_user(provider: str, info: dict) -> dict:
    oauth_id = info.get("id")
    email = (info.get("email") or "").strip().lower()
    if not email:
        email = f"{provider}.{oauth_id}@vyling.local"
    email = email[:EMAIL_MAX]
    name = ((info.get("name") or "").strip() or email.split("@")[0])[:NAME_MAX]
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
                "INSERT INTO users (id, name, email, provider, role, avatar, coins, email_verified) "
                "VALUES (?,?,?,?,?,?,?,1)",
                (uid, name, email, provider, "user", avatar, WELCOME_COINS),
            )
            conn.commit()
    finally:
        conn.close()
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


def leaderboard(current_id: str | None = None, limit: int = 50, scope: str = "all") -> list[dict]:
    conn = db.get_conn()
    try:
        if scope == "week":
            monday = date.today() - timedelta(days=date.today().weekday())
            rows = conn.execute(
                "SELECT u.id, u.name, u.avatar, u.streak, u.is_plus, u.plus_until, "
                "u.equipped_frame, u.equipped_bg, u.xp AS total_xp, "
                "COALESCE(SUM(a.xp),0) AS xp "
                "FROM users u JOIN activity_log a ON a.user_id = u.id AND a.day >= ? "
                "WHERE u.status = 'active' AND u.role != 'admin' "
                "GROUP BY u.id HAVING SUM(a.xp) > 0 ORDER BY SUM(a.xp) DESC, u.streak DESC LIMIT ?",
                (monday.isoformat(), limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, name, avatar, xp, xp AS total_xp, streak, is_plus, plus_until, "
                "equipped_frame, equipped_bg FROM users "
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
            "level": level_for(r["total_xp"]),
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
    "active_asc": "last_active ASC",
    "coins": "coins DESC",
    "coins_asc": "coins ASC",
    "xp": "xp DESC",
    "xp_asc": "xp ASC",
    "streak": "streak DESC",
    "streak_asc": "streak ASC",
    "name": "name COLLATE NOCASE ASC",
    "name_desc": "name COLLATE NOCASE DESC",
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
    enums = {"role": {"user", "admin"}, "status": {"active", "locked"}}
    for key, valid in enums.items():
        if fields.get(key) is not None and fields[key] not in valid:
            raise HTTPException(status_code=400, detail=f"Giá trị {key} không hợp lệ.")
    sets, vals = [], []
    for k, v in fields.items():
        if k in allowed and v is not None:
            sets.append(f"{k} = ?")
            vals.append(int(v) if k in {"is_plus", "coins", "xp", "streak"} else str(v)[:NAME_MAX])
    if not sets:
        return reload(user_id)
    if fields.get("status") and fields["status"] != "active":
        sets.append("token_version = token_version + 1")
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


USER_TABLES = (
    "user_items", "user_garden", "user_paths", "user_videos", "quest_progress",
    "activity_log", "activity_lang", "coin_gifts", "srs_cards", "srs_reviews",
    "user_plans", "user_words", "exam_takes", "league_members", "email_log",
    "speak_room_members", "speak_room_msgs", "speak_queue",
)


def purge_user(user_id: str) -> None:
    conn = db.get_conn()
    try:
        for table in USER_TABLES:
            conn.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM duels WHERE a_id = ? OR b_id = ?", (user_id, user_id))
        conn.execute("DELETE FROM speak_rooms WHERE host_id = ?", (user_id,))
        conn.execute("DELETE FROM ai_usage WHERE subject = ?", (f"u:{user_id}",))
        conn.execute("UPDATE feedback SET user_id = NULL, name = 'Người dùng đã xoá' WHERE user_id = ?", (user_id,))
        conn.execute("UPDATE users SET ref_by = NULL WHERE ref_by = ?", (user_id,))
        row = conn.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
        if row and row["email"]:
            conn.execute("DELETE FROM verify_codes WHERE email = ?", (row["email"],))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()


def admin_delete_user(user_id: str) -> None:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        if row["role"] == "admin":
            raise HTTPException(status_code=400, detail="Không thể xoá tài khoản quản trị viên.")
    finally:
        conn.close()
    purge_user(user_id)


def delete_own_account(user: dict, password: str = "", confirm: str = "") -> None:
    row = reload(user["id"])
    if row["role"] == "admin":
        raise AppError("FORBIDDEN", "Tài khoản quản trị không tự xoá được. Hãy chuyển quyền trước.", 400)
    if row["provider"] == "email" and row["pass_hash"]:
        if not auth.verify_password(password or "", row["pass_hash"], row["pass_salt"]):
            raise AppError("BAD_PASSWORD", "Mật khẩu không đúng.", 400)
    elif (confirm or "").strip().upper() != "XOA":
        raise AppError("BAD_CONFIRM", "Hãy gõ XOA để xác nhận xoá tài khoản.", 400)
    purge_user(row["id"])
