from __future__ import annotations

from datetime import date, timedelta

from .. import db

RANGES = (7, 30, 90)
SUM_METRICS = ("lessons", "reviews", "xp", "minutes")
METRICS = ("active", "signups") + SUM_METRICS


def _clamp(days: int) -> int:
    return days if days in RANGES else 30


def _iso(d: date) -> str:
    return d.isoformat()


def _window(conn, start: date, end: date) -> dict[str, int]:
    a, b = _iso(start), _iso(end)
    row = conn.execute(
        "SELECT COUNT(DISTINCT user_id) AS active, COALESCE(SUM(lessons),0) AS lessons, "
        "COALESCE(SUM(reviews),0) AS reviews, COALESCE(SUM(xp),0) AS xp, "
        "COALESCE(SUM(minutes),0) AS minutes FROM activity_log WHERE day BETWEEN ? AND ?",
        (a, b),
    ).fetchone()
    signups = conn.execute(
        "SELECT COUNT(*) FROM users WHERE date(created_at) BETWEEN ? AND ?", (a, b)
    ).fetchone()[0]
    out = {"active": int(row["active"] or 0), "signups": int(signups or 0)}
    for m in SUM_METRICS:
        out[m] = int(row[m] or 0)
    return out


def _pairs(conn, sql: str, args: tuple = ()) -> list[dict]:
    return [
        {"k": str(r[0] or "—"), "v": int(r[1] or 0)}
        for r in conn.execute(sql, args).fetchall()
    ]


def _mix(conn, start: date, end: date) -> dict:
    a, b = _iso(start), _iso(end)
    total = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    plus = conn.execute("SELECT COUNT(*) FROM users WHERE is_plus = 1").fetchone()[0]
    return {
        "plan": [
            {"k": "Plus", "v": int(plus)},
            {"k": "Miễn phí", "v": max(0, int(total) - int(plus))},
        ],
        "provider": _pairs(
            conn,
            "SELECT provider, COUNT(*) FROM users WHERE date(created_at) BETWEEN ? AND ? "
            "GROUP BY provider ORDER BY 2 DESC",
            (a, b),
        ),
        "videoLang": _pairs(
            conn, "SELECT lang, COUNT(*) FROM catalog_videos GROUP BY lang ORDER BY 2 DESC"
        ),
        "feedback": _pairs(
            conn, "SELECT status, COUNT(*) FROM feedback GROUP BY status ORDER BY 2 DESC"
        ),
    }


def overview(days: int = 30) -> dict:
    n = _clamp(days)
    end = date.today()
    start = end - timedelta(days=n - 1)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=n - 1)

    labels = [_iso(start + timedelta(days=i)) for i in range(n)]
    points = {d: dict({"d": d}, **{m: 0 for m in METRICS}) for d in labels}

    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT day, COUNT(DISTINCT user_id) AS active, COALESCE(SUM(lessons),0) AS lessons, "
            "COALESCE(SUM(reviews),0) AS reviews, COALESCE(SUM(xp),0) AS xp, "
            "COALESCE(SUM(minutes),0) AS minutes FROM activity_log "
            "WHERE day BETWEEN ? AND ? GROUP BY day",
            (_iso(start), _iso(end)),
        ).fetchall()
        for r in rows:
            p = points.get(r["day"])
            if p is None:
                continue
            p["active"] = int(r["active"] or 0)
            for m in SUM_METRICS:
                p[m] = int(r[m] or 0)

        for r in conn.execute(
            "SELECT date(created_at) AS day, COUNT(*) AS n FROM users "
            "WHERE date(created_at) BETWEEN ? AND ? GROUP BY day",
            (_iso(start), _iso(end)),
        ).fetchall():
            p = points.get(r["day"])
            if p is not None:
                p["signups"] = int(r["n"] or 0)

        cur = _window(conn, start, end)
        prev = _window(conn, prev_start, prev_end)
        mix = _mix(conn, start, end)
    finally:
        conn.close()

    return {
        "days": n,
        "from": _iso(start),
        "to": _iso(end),
        "points": [points[d] for d in labels],
        "kpi": {m: {"value": cur[m], "prev": prev[m]} for m in METRICS},
        "mix": mix,
    }
