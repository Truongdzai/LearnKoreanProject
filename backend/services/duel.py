from __future__ import annotations

import secrets
from datetime import date, timedelta

from .. import db
from ..errors import AppError
from . import accounts

DAYS = 7
WIN_REWARD = 200
DRAW_REWARD = 100
OPEN_TTL_DAYS = 3


def _code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(6))


def _xp(conn, user_id: str, start: str, end: str) -> int:
    row = conn.execute(
        "SELECT COALESCE(SUM(xp),0) AS xp FROM activity_log WHERE user_id = ? AND day BETWEEN ? AND ?",
        (user_id, start, end),
    ).fetchone()
    return row["xp"] if row else 0


def _person(conn, user_id: str | None) -> dict | None:
    if not user_id:
        return None
    r = conn.execute(
        "SELECT id, name, avatar, equipped_frame, streak FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    if not r:
        return None
    return {"id": r["id"], "name": r["name"], "avatar": r["avatar"], "frame": r["equipped_frame"], "streak": r["streak"]}


def _finish(conn, row) -> None:
    a_xp = _xp(conn, row["a_id"], row["start_day"], row["end_day"])
    b_xp = _xp(conn, row["b_id"], row["start_day"], row["end_day"])
    winner = None if a_xp == b_xp else (row["a_id"] if a_xp > b_xp else row["b_id"])
    conn.execute(
        "UPDATE duels SET status = 'done', winner = ?, a_xp = ?, b_xp = ? WHERE id = ?",
        (winner, a_xp, b_xp, row["id"]),
    )
    conn.commit()
    if winner:
        accounts.add_xp_coins(winner, coins=WIN_REWARD)
    else:
        accounts.add_xp_coins(row["a_id"], coins=DRAW_REWARD)
        accounts.add_xp_coins(row["b_id"], coins=DRAW_REWARD)


def close_expired(conn) -> list[str]:
    rows = conn.execute(
        "SELECT * FROM duels WHERE status = 'active' AND end_day < ?", (date.today().isoformat(),)
    ).fetchall()
    for row in rows:
        _finish(conn, row)
    return [r["id"] for r in rows]


def _view(conn, row, me: str) -> dict:
    a_xp = row["a_xp"]
    b_xp = row["b_xp"]
    if row["status"] == "active":
        a_xp = _xp(conn, row["a_id"], row["start_day"], row["end_day"])
        b_xp = _xp(conn, row["b_id"], row["start_day"], row["end_day"])
    mine, theirs = (a_xp, b_xp) if me == row["a_id"] else (b_xp, a_xp)
    other = row["b_id"] if me == row["a_id"] else row["a_id"]
    left = 0
    if row["end_day"]:
        left = max(0, (date.fromisoformat(row["end_day"]) - date.today()).days + 1)
    return {
        "id": row["id"],
        "status": row["status"],
        "startDay": row["start_day"],
        "endDay": row["end_day"],
        "daysLeft": left,
        "myXp": mine,
        "theirXp": theirs,
        "opponent": _person(conn, other),
        "iWin": row["status"] == "done" and row["winner"] == me,
        "draw": row["status"] == "done" and not row["winner"],
        "reward": WIN_REWARD,
    }


def state(user: dict) -> dict:
    me = user["id"]
    conn = db.get_conn()
    try:
        today = date.today().isoformat()
        for row in conn.execute(
            "SELECT * FROM duels WHERE status = 'active' AND (a_id = ? OR b_id = ?) AND end_day < ?",
            (me, me, today),
        ).fetchall():
            _finish(conn, row)
        conn.execute(
            "DELETE FROM duels WHERE status = 'open' AND date(created_at) < date('now','localtime',?)",
            (f"-{OPEN_TTL_DAYS} day",),
        )
        conn.commit()

        active = conn.execute(
            "SELECT * FROM duels WHERE status = 'active' AND (a_id = ? OR b_id = ?) ORDER BY start_day DESC LIMIT 1",
            (me, me),
        ).fetchone()
        invite = conn.execute(
            "SELECT * FROM duels WHERE status = 'open' AND a_id = ? ORDER BY created_at DESC LIMIT 1", (me,)
        ).fetchone()
        history = conn.execute(
            "SELECT * FROM duels WHERE status = 'done' AND (a_id = ? OR b_id = ?) ORDER BY end_day DESC LIMIT 5",
            (me, me),
        ).fetchall()
        return {
            "active": _view(conn, active, me) if active else None,
            "inviteCode": invite["id"] if invite else None,
            "history": [_view(conn, r, me) for r in history],
            "days": DAYS,
            "reward": WIN_REWARD,
        }
    finally:
        conn.close()


def create(user: dict) -> dict:
    me = user["id"]
    conn = db.get_conn()
    try:
        busy = conn.execute(
            "SELECT 1 FROM duels WHERE status = 'active' AND (a_id = ? OR b_id = ?)", (me, me)
        ).fetchone()
        if busy:
            raise AppError("DUEL_BUSY", "Bạn đang có một thử thách chưa kết thúc.", 400)
        old = conn.execute(
            "SELECT id FROM duels WHERE status = 'open' AND a_id = ?", (me,)
        ).fetchone()
        if old:
            return {"code": old["id"]}
        code = _code()
        while conn.execute("SELECT 1 FROM duels WHERE id = ?", (code,)).fetchone():
            code = _code()
        conn.execute("INSERT INTO duels (id, a_id) VALUES (?,?)", (code, me))
        conn.commit()
        return {"code": code}
    finally:
        conn.close()


def cancel(user: dict) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM duels WHERE status = 'open' AND a_id = ?", (user["id"],))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def join(user: dict, code: str) -> dict:
    me = user["id"]
    code = (code or "").strip().upper()
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT * FROM duels WHERE id = ?", (code,)).fetchone()
        if not row or row["status"] != "open":
            raise AppError("DUEL_NOT_FOUND", "Lời mời không tồn tại hoặc đã hết hạn.", 404)
        if row["a_id"] == me:
            raise AppError("DUEL_SELF", "Đây là lời mời của chính bạn — hãy gửi cho bạn bè.", 400)
        busy = conn.execute(
            "SELECT 1 FROM duels WHERE status = 'active' AND (a_id = ? OR b_id = ?)", (me, me)
        ).fetchone()
        if busy:
            raise AppError("DUEL_BUSY", "Bạn đang có một thử thách chưa kết thúc.", 400)
        start = date.today()
        conn.execute(
            "UPDATE duels SET b_id = ?, start_day = ?, end_day = ?, status = 'active' WHERE id = ?",
            (me, start.isoformat(), (start + timedelta(days=DAYS - 1)).isoformat(), code),
        )
        conn.commit()
    finally:
        conn.close()
    return state(user)
