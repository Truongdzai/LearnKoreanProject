from __future__ import annotations

import json
from datetime import datetime

from .. import db
from . import accounts



def _rows(conn, sql: str, *args) -> list[dict]:
    return [dict(r) for r in conn.execute(sql, args).fetchall()]


def export_user(user_id: str) -> dict:
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return {}
        account = {
            k: v for k, v in dict(row).items()
            if k not in ("pass_hash", "pass_salt", "token_version")
        }
        data = {
            "xuatLuc": datetime.now().isoformat(timespec="seconds"),
            "nguon": "VyLing",
            "taiKhoan": account,
            "theTuVung": _rows(conn, "SELECT * FROM srs_cards WHERE user_id = ? ORDER BY id", user_id),
            "lichSuOnTap": _rows(conn, "SELECT * FROM srs_reviews WHERE user_id = ? ORDER BY id", user_id),
            "nhatKyHocTap": _rows(conn, "SELECT * FROM activity_log WHERE user_id = ? ORDER BY day", user_id),
            "loTrinh": [
                {**p, "data": json.loads(p["data"] or "{}")}
                for p in _rows(conn, "SELECT * FROM user_plans WHERE user_id = ?", user_id)
            ],
            "videoDaLuu": _rows(conn, "SELECT * FROM user_videos WHERE user_id = ?", user_id),
            "khoaHocTuVideo": _rows(conn, "SELECT * FROM user_paths WHERE user_id = ?", user_id),
            "vatPham": _rows(conn, "SELECT * FROM user_items WHERE user_id = ?", user_id),
            "vuonCay": _rows(conn, "SELECT * FROM user_garden WHERE user_id = ?", user_id),
            "nhiemVu": _rows(conn, "SELECT * FROM quest_progress WHERE user_id = ?", user_id),
            "quaTang": _rows(conn, "SELECT * FROM coin_gifts WHERE user_id = ?", user_id),
            "giaiDau": _rows(conn, "SELECT * FROM league_members WHERE user_id = ? ORDER BY week", user_id),
            "thuThach": _rows(conn, "SELECT * FROM duels WHERE a_id = ? OR b_id = ?", user_id, user_id),
            "gopY": _rows(conn, "SELECT * FROM feedback WHERE user_id = ?", user_id),
            "thuDaNhan": _rows(conn, "SELECT * FROM email_log WHERE user_id = ? ORDER BY day", user_id),
        }
        data["taiKhoan"]["capDo"] = accounts.level_for(row["xp"])
        return data
    finally:
        conn.close()
