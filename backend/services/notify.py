from __future__ import annotations

import asyncio
import hashlib
import hmac
from datetime import date, datetime

from .. import db
from ..config import settings
from . import duel, mailer
from .logs import log

CHECK_MINUTES = 30


def _cfg() -> dict:
    return settings.get("email", {}) or {}


def reminder_enabled() -> bool:
    return bool(_cfg().get("daily_reminder", True))


def reminder_hour() -> int:
    return max(0, min(23, int(_cfg().get("reminder_hour", 20))))


def _base_url() -> str:
    return str((settings.get("app", {}) or {}).get("public_url", "") or "").rstrip("/")


def unsub_token(user_id: str) -> str:
    return hmac.new(db.get_secret().encode(), f"unsub:{user_id}".encode(), hashlib.sha256).hexdigest()[:24]


def check_unsub(user_id: str, token: str) -> bool:
    return hmac.compare_digest(unsub_token(user_id), (token or "").strip())


def _footer(user_id: str) -> str:
    base = _base_url()
    if not base:
        return "\n\n— VyLing\n"
    return (
        f"\n\nHọc tiếp tại: {base}/\n"
        f"Không muốn nhận thư nhắc học nữa? Bấm vào đây: "
        f"{base}/api/email/unsubscribe?u={user_id}&t={unsub_token(user_id)}\n\n— VyLing\n"
    )


def _already_sent(conn, user_id: str, kind: str, day: str) -> bool:
    return bool(conn.execute(
        "SELECT 1 FROM email_log WHERE user_id = ? AND kind = ? AND day = ?", (user_id, kind, day)
    ).fetchone())


def _mark_sent(conn, user_id: str, kind: str, day: str) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO email_log (user_id, kind, day) VALUES (?,?,?)", (user_id, kind, day)
    )
    conn.commit()


def _candidates(conn, today: str) -> list[dict]:
    rows = conn.execute(
        "SELECT u.id, u.name, u.email, u.streak FROM users u "
        "WHERE u.status = 'active' AND u.role != 'admin' AND u.email IS NOT NULL "
        "AND u.email_verified = 1 AND u.email_optout = 0 "
        "AND NOT EXISTS (SELECT 1 FROM activity_log a WHERE a.user_id = u.id AND a.day = ? AND a.xp > 0)",
        (today,),
    ).fetchall()
    return [dict(r) for r in rows]


def _due_cards(conn, user_id: str, today: str) -> int:
    return conn.execute(
        "SELECT COUNT(*) FROM srs_cards WHERE user_id = ? AND due <= ?", (user_id, today)
    ).fetchone()[0]


def _reminder_body(name: str, streak: int, due: int, user_id: str) -> tuple[str, str]:
    if streak > 0:
        subject = f"Giữ chuỗi {streak} ngày của bạn nhé!"
        first = (
            f"Chuỗi học của bạn đang là {streak} ngày. Hôm nay bạn chưa học buổi nào — "
            "chỉ cần 5 phút là chuỗi được giữ nguyên."
        )
    else:
        subject = "Học 5 phút hôm nay chứ?"
        first = "Hôm nay bạn chưa học buổi nào. Chỉ 5 phút là đủ để bắt đầu lại một chuỗi mới."
    lines = [f"Chào {name},", "", first]
    if due:
        lines += ["", f"Bạn đang có {due} thẻ từ đến hạn ôn — đây đúng là lúc não sắp quên chúng, ôn bây giờ là nhớ lâu nhất."]
    return subject, "\n".join(lines) + _footer(user_id)


def send_daily_reminders() -> int:
    if not reminder_enabled():
        return 0
    today = date.today().isoformat()
    sent = 0
    conn = db.get_conn()
    try:
        for u in _candidates(conn, today):
            if _already_sent(conn, u["id"], "daily", today):
                continue
            due = _due_cards(conn, u["id"], today)
            if not due and not (u["streak"] or 0):
                continue
            subject, body = _reminder_body(u["name"], u["streak"] or 0, due, u["id"])
            mailer.send_email(u["email"], f"VyLing — {subject}", body)
            _mark_sent(conn, u["id"], "daily", today)
            sent += 1
    finally:
        conn.close()
    return sent


def _duel_body(name: str, other: str, mine: int, theirs: int, user_id: str) -> tuple[str, str]:
    if mine > theirs:
        subject = "Bạn đã thắng thử thách!"
        head = f"Bạn thắng {other} với {mine} XP so với {theirs} XP. Phần thưởng {duel.WIN_REWARD} xu đã vào ví."
    elif mine < theirs:
        subject = "Thử thách đã kết thúc"
        head = f"{other} thắng lần này ({theirs} XP so với {mine} XP của bạn). Rủ lại một trận nữa nhé?"
    else:
        subject = "Thử thách kết thúc với tỉ số hoà"
        head = f"Bạn và {other} hoà nhau ở {mine} XP. Mỗi người nhận {duel.DRAW_REWARD} xu."
    return subject, f"Chào {name},\n\n{head}" + _footer(user_id)


def finish_duels_and_notify() -> int:
    today = date.today().isoformat()
    done = 0
    conn = db.get_conn()
    try:
        for duel_id in duel.close_expired(conn):
            done += 1
            fresh = conn.execute("SELECT * FROM duels WHERE id = ?", (duel_id,)).fetchone()
            for me, other in ((fresh["a_id"], fresh["b_id"]), (fresh["b_id"], fresh["a_id"])):
                u = conn.execute(
                    "SELECT id, name, email, email_verified, email_optout FROM users WHERE id = ?", (me,)
                ).fetchone()
                o = conn.execute("SELECT name FROM users WHERE id = ?", (other,)).fetchone()
                if not u or not o or not u["email"] or not u["email_verified"] or u["email_optout"]:
                    continue
                kind = f"duel:{fresh['id']}"
                if _already_sent(conn, me, kind, today):
                    continue
                mine = fresh["a_xp"] if me == fresh["a_id"] else fresh["b_xp"]
                theirs = fresh["b_xp"] if me == fresh["a_id"] else fresh["a_xp"]
                subject, body = _duel_body(u["name"], o["name"], mine, theirs, me)
                mailer.send_email(u["email"], f"VyLing — {subject}", body)
                _mark_sent(conn, me, kind, today)
    finally:
        conn.close()
    return done


def sweep() -> dict:
    out = {"duels": 0, "reminders": 0}
    try:
        out["duels"] = finish_duels_and_notify()
    except Exception as exc:
        log(f"[NOTIFY] Chốt thử thách lỗi: {exc}")
    now = datetime.now()
    if reminder_hour() <= now.hour < reminder_hour() + 2:
        try:
            out["reminders"] = send_daily_reminders()
        except Exception as exc:
            log(f"[NOTIFY] Gửi thư nhắc học lỗi: {exc}")
    return out


async def notify_loop() -> None:
    while True:
        await asyncio.sleep(CHECK_MINUTES * 60)
        sweep()
