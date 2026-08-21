from __future__ import annotations

from datetime import date, datetime

from .. import db
from ..config import settings
from ..errors import AppError

COST = {
    "transcript": 3,
    "tutor": 2,
    "writing": 5,
    "speaking": 2,
    "pronounce": 2,
    "explain": 1,
    "level": 1,
    "define": 1,
    "profile": 2,
    "lingo": 2,
    "encoach": 2,
}

LABEL = {
    "transcript": "tạo bài học từ video mới",
    "tutor": "hỏi gia sư AI",
    "writing": "chấm bài viết",
    "speaking": "luyện nói với AI",
    "pronounce": "chấm phát âm",
    "explain": "giải thích ngữ pháp",
    "level": "ước lượng trình độ bài học",
    "define": "tra từ sâu",
    "profile": "dựng hồ sơ đầy đủ các nghĩa của một từ",
    "lingo": "làm mới Hot Lingo",
    "encoach": "chấm câu bạn tự nói hoặc tự viết",
}


def _cfg() -> dict:
    return settings.get("quota", {}) or {}


def limit_for(user: dict | None) -> int:
    c = _cfg()
    if not user:
        return int(c.get("guest_per_day", 20))
    if user.get("isPlus") or user.get("plus_until"):
        return int(c.get("plus_per_day", 250))
    return int(c.get("user_per_day", 80))


def _subject(user: dict | None, ip: str) -> str:
    if user:
        return f"u:{user['id']}"
    return f"ip:{ip or 'unknown'}"


def status(user: dict | None, ip: str = "") -> dict:
    subject = _subject(user, ip)
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM ai_usage WHERE subject=? AND day=?", (subject, today)
        ).fetchone()
        used = row["used"] if row else 0
    finally:
        conn.close()
    limit = limit_for(user)
    return {"used": used, "limit": limit, "left": max(0, limit - used), "authed": bool(user)}


def consume(kind: str, user: dict | None, ip: str = "") -> dict:
    cost = COST.get(kind, 1)
    limit = limit_for(user)
    burst = int(_cfg().get("burst_per_minute", 12))
    subject = _subject(user, ip)
    now = datetime.now()
    today = date.today().isoformat()
    minute = now.strftime("%Y-%m-%dT%H:%M")

    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used, minute_key, minute_n FROM ai_usage WHERE subject=? AND day=?",
            (subject, today),
        ).fetchone()
        used = row["used"] if row else 0
        minute_n = row["minute_n"] if row and row["minute_key"] == minute else 0

        if used + cost > limit:
            raise AppError(
                "RATE_LIMITED",
                (
                    f"Bạn đã dùng hết lượt AI hôm nay ({used}/{limit} điểm). "
                    + (
                        "Đăng nhập để được nhiều lượt hơn, hoặc quay lại vào ngày mai nhé."
                        if not user
                        else "Hạn mức sẽ đặt lại vào ngày mai. Nâng cấp Plus để dùng nhiều hơn."
                    )
                ),
                429,
            )
        if minute_n + cost > burst:
            raise AppError(
                "RATE_LIMITED",
                "Bạn đang gửi quá nhanh. Chờ khoảng một phút rồi thử lại nhé.",
                429,
            )

        conn.execute(
            "INSERT INTO ai_usage (subject, day, used, minute_key, minute_n, updated_at) "
            "VALUES (?,?,?,?,?,?) "
            "ON CONFLICT(subject, day) DO UPDATE SET used=?, minute_key=?, minute_n=?, updated_at=?",
            (
                subject, today, used + cost, minute, minute_n + cost, now.isoformat(),
                used + cost, minute, minute_n + cost, now.isoformat(),
            ),
        )
        conn.execute("DELETE FROM ai_usage WHERE day < date('now','localtime','-7 day')")
        conn.commit()
    finally:
        conn.close()

    return {"used": used + cost, "limit": limit, "left": max(0, limit - used - cost)}


def client_ip(request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else ""


GUEST_LESSONS_PER_DAY = 1
FREE_VIDEOS = 20
FREE_EXAMS_PER_MONTH = 2


def guest_lesson_left(ip: str) -> int:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM guest_lessons WHERE ip = ? AND day = ?", (ip or "unknown", today)
        ).fetchone()
    finally:
        conn.close()
    return max(0, GUEST_LESSONS_PER_DAY - (row["used"] if row else 0))


def take_guest_lesson(ip: str) -> None:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM guest_lessons WHERE ip = ? AND day = ?", (ip or "unknown", today)
        ).fetchone()
        used = row["used"] if row else 0
        if used >= GUEST_LESSONS_PER_DAY:
            raise AppError(
                "SIGNUP_REQUIRED",
                "Bạn đã học xong bài dùng thử hôm nay. Đăng ký miễn phí để học tiếp và lưu tiến độ.",
                403,
            )
        conn.execute(
            "INSERT INTO guest_lessons (ip, day, used) VALUES (?,?,1) "
            "ON CONFLICT(ip, day) DO UPDATE SET used = used + 1",
            (ip or "unknown", today),
        )
        conn.commit()
    finally:
        conn.close()


def is_plus(user: dict | None) -> bool:
    return bool(user and (user.get("isPlus") or user.get("is_plus") or user.get("plus_until")))


def exam_status(user: dict | None, kind: str) -> dict:
    if is_plus(user):
        return {"left": -1, "limit": -1, "used": 0, "plus": True}
    if not user:
        return {"left": 0, "limit": FREE_EXAMS_PER_MONTH, "used": 0, "plus": False}
    month = date.today().strftime("%Y-%m")
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM exam_takes WHERE user_id = ? AND month = ? AND kind = ?",
            (user["id"], month, kind),
        ).fetchone()
    finally:
        conn.close()
    used = row["used"] if row else 0
    return {"left": max(0, FREE_EXAMS_PER_MONTH - used), "limit": FREE_EXAMS_PER_MONTH,
            "used": used, "plus": False}


def take_exam(user: dict, kind: str) -> dict:
    if is_plus(user):
        return {"ok": True, "left": -1}
    month = date.today().strftime("%Y-%m")
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM exam_takes WHERE user_id = ? AND month = ? AND kind = ?",
            (user["id"], month, kind),
        ).fetchone()
        used = row["used"] if row else 0
        if used >= FREE_EXAMS_PER_MONTH:
            raise AppError(
                "PLUS_REQUIRED",
                f"Gói Miễn phí làm được {FREE_EXAMS_PER_MONTH} đề đầy đủ mỗi tháng. "
                "Nâng cấp Plus để luyện đề không giới hạn.",
                403,
            )
        conn.execute(
            "INSERT INTO exam_takes (user_id, month, kind, used) VALUES (?,?,?,1) "
            "ON CONFLICT(user_id, month, kind) DO UPDATE SET used = used + 1",
            (user["id"], month, kind),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "left": max(0, FREE_EXAMS_PER_MONTH - used - 1)}
