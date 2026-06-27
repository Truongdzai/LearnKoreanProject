from __future__ import annotations

from datetime import date, timedelta

from .. import db

USER = "local"
MIN_EASE = 1.3
RATINGS = {1: "Lại", 2: "Khó", 3: "Tốt", 4: "Dễ"}

def _row(conn, card_id: int) -> dict | None:
    r = conn.execute("SELECT * FROM srs_cards WHERE id = ?", (card_id,)).fetchone()
    return dict(r) if r else None

def add_card(front: str, back: str = "", source: str = "", user_id: str = USER) -> dict:
    conn = db.get_conn()
    try:
        existing = conn.execute(
            "SELECT * FROM srs_cards WHERE user_id = ? AND front = ? LIMIT 1",
            (user_id, front),
        ).fetchone()
        if existing:
            return dict(existing)
        cur = conn.execute(
            "INSERT INTO srs_cards (user_id, front, back, source) VALUES (?,?,?,?)",
            (user_id, front, back, source),
        )
        conn.commit()
        return _row(conn, cur.lastrowid)
    finally:
        conn.close()

def due_cards(user_id: str = USER, limit: int = 300) -> list[dict]:
    conn = db.get_conn()
    try:
        today = date.today().isoformat()
        cur = conn.execute(
            "SELECT * FROM srs_cards WHERE user_id = ? AND due <= ? ORDER BY due, id LIMIT ?",
            (user_id, today, limit),
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def all_cards(user_id: str = USER, limit: int = 2000) -> list[dict]:
    conn = db.get_conn()
    try:
        cur = conn.execute(
            "SELECT * FROM srs_cards WHERE user_id = ? ORDER BY id LIMIT ?",
            (user_id, limit),
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def schedule(reps: int, ivl: int, ease: float, rating: int) -> tuple[int, int, float]:
    if rating == 1:
        return 0, 0, max(MIN_EASE, ease - 0.20)
    if rating == 2:
        return reps + 1, max(1, round((ivl or 1) * 1.2)), max(MIN_EASE, ease - 0.15)
    if rating == 4:
        nivl = 4 if reps == 0 else max(1, round(ivl * ease * 1.3))
        return reps + 1, nivl, ease + 0.15
    if reps == 0:
        nivl = 1
    elif reps == 1:
        nivl = 6
    else:
        nivl = max(1, round(ivl * ease))
    return reps + 1, nivl, ease

def review(card_id: int, rating: int, user_id: str = USER) -> dict:
    conn = db.get_conn()
    try:
        card = _row(conn, card_id)
        if not card:
            raise ValueError("Không tìm thấy thẻ")
        reps, ivl, ease = schedule(card["reps"], card["ivl"], card["ease"], rating)
        due = (date.today() + timedelta(days=ivl)).isoformat()
        conn.execute(
            "UPDATE srs_cards SET reps=?, ivl=?, ease=?, due=?, "
            "last_reviewed=datetime('now','localtime') WHERE id=?",
            (reps, ivl, round(ease, 2), due, card_id),
        )
        conn.execute(
            "INSERT INTO srs_reviews (card_id, user_id, rating) VALUES (?,?,?)",
            (card_id, user_id, rating),
        )
        conn.commit()
        return _row(conn, card_id)
    finally:
        conn.close()

def stats(user_id: str = USER) -> dict:
    conn = db.get_conn()
    try:
        today = date.today().isoformat()

        def n(sql: str, *args) -> int:
            return conn.execute(sql, args).fetchone()[0]

        return {
            "total": n("SELECT COUNT(*) FROM srs_cards WHERE user_id=?", user_id),
            "due": n("SELECT COUNT(*) FROM srs_cards WHERE user_id=? AND due<=?", user_id, today),
            "new": n("SELECT COUNT(*) FROM srs_cards WHERE user_id=? AND reps=0", user_id),
            "learned": n("SELECT COUNT(*) FROM srs_cards WHERE user_id=? AND reps>=2", user_id),
            "reviewed_today": n(
                "SELECT COUNT(*) FROM srs_reviews WHERE user_id=? AND date(reviewed_at)=?",
                user_id, today,
            ),
        }
    finally:
        conn.close()
