from __future__ import annotations

from datetime import date, timedelta

from .. import db

USER = "local"
MIN_EASE = 1.3
RATINGS = {1: "Lại", 2: "Khó", 3: "Tốt", 4: "Dễ"}

def _row(conn, card_id: int) -> dict | None:
    r = conn.execute("SELECT * FROM srs_cards WHERE id = ?", (card_id,)).fetchone()
    return dict(r) if r else None

def _lang_filter(lang: str) -> tuple[str, tuple]:
    if not lang or lang == "all":
        return "", ()
    return " AND lang = ?", (lang,)

def add_card(front: str, back: str = "", source: str = "", user_id: str = USER, lang: str = "") -> dict:
    lang = lang or db.guess_lang(front)
    conn = db.get_conn()
    try:
        existing = conn.execute(
            "SELECT * FROM srs_cards WHERE user_id = ? AND lang = ? AND front = ? LIMIT 1",
            (user_id, lang, front),
        ).fetchone()
        if existing:
            return dict(existing)
        cur = conn.execute(
            "INSERT INTO srs_cards (user_id, front, back, source, lang) VALUES (?,?,?,?,?)",
            (user_id, front, back, source, lang),
        )
        conn.commit()
        return _row(conn, cur.lastrowid)
    finally:
        conn.close()

def due_cards(user_id: str = USER, limit: int = 300, lang: str = "") -> list[dict]:
    where, args = _lang_filter(lang)
    conn = db.get_conn()
    try:
        today = date.today().isoformat()
        cur = conn.execute(
            f"SELECT * FROM srs_cards WHERE user_id = ? AND due <= ?{where} ORDER BY due, id LIMIT ?",
            (user_id, today, *args, limit),
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def all_cards(user_id: str = USER, limit: int = 2000, lang: str = "") -> list[dict]:
    where, args = _lang_filter(lang)
    conn = db.get_conn()
    try:
        cur = conn.execute(
            f"SELECT * FROM srs_cards WHERE user_id = ?{where} ORDER BY id LIMIT ?",
            (user_id, *args, limit),
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def lang_counts(user_id: str = USER) -> dict[str, int]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT lang, COUNT(*) AS n FROM srs_cards WHERE user_id = ? GROUP BY lang",
            (user_id,),
        ).fetchall()
        return {r["lang"]: r["n"] for r in rows}
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
        card = conn.execute(
            "SELECT * FROM srs_cards WHERE id = ? AND user_id = ?", (card_id, user_id)
        ).fetchone()
        if not card:
            raise ValueError("Không tìm thấy thẻ")
        card = dict(card)
        reps, ivl, ease = schedule(card["reps"], card["ivl"], card["ease"], rating)
        due = (date.today() + timedelta(days=ivl)).isoformat()
        conn.execute(
            "UPDATE srs_cards SET reps=?, ivl=?, ease=?, due=?, "
            "last_reviewed=datetime('now','localtime') WHERE id=? AND user_id=?",
            (reps, ivl, round(ease, 2), due, card_id, user_id),
        )
        conn.execute(
            "INSERT INTO srs_reviews (card_id, user_id, rating) VALUES (?,?,?)",
            (card_id, user_id, rating),
        )
        conn.commit()
        return _row(conn, card_id)
    finally:
        conn.close()

def stats(user_id: str = USER, lang: str = "") -> dict:
    where, args = _lang_filter(lang)
    conn = db.get_conn()
    try:
        today = date.today().isoformat()
        tomorrow = (date.today() + timedelta(days=1)).isoformat()

        card = conn.execute(
            "SELECT COUNT(*) AS total, "
            "SUM(CASE WHEN due <= ? THEN 1 ELSE 0 END) AS due, "
            "SUM(CASE WHEN reps = 0 THEN 1 ELSE 0 END) AS new, "
            "SUM(CASE WHEN reps >= 2 THEN 1 ELSE 0 END) AS learned "
            f"FROM srs_cards WHERE user_id = ?{where}",
            (today, user_id, *args),
        ).fetchone()

        joined = " AND c.lang = ?" if args else ""
        reviewed = conn.execute(
            "SELECT COUNT(*) FROM srs_reviews r JOIN srs_cards c ON c.id = r.card_id "
            f"WHERE r.user_id = ? AND r.reviewed_at >= ? AND r.reviewed_at < ?{joined}",
            (user_id, today, tomorrow, *args),
        ).fetchone()[0]

        return {
            "total": card["total"] or 0,
            "due": card["due"] or 0,
            "new": card["new"] or 0,
            "learned": card["learned"] or 0,
            "reviewed_today": reviewed,
        }
    finally:
        conn.close()
