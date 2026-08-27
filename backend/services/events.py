from __future__ import annotations

import json
import random
import time
from datetime import date

from .. import db

MAX_BATCH = 40
MAX_NAME = 60
MAX_PROPS = 2000
KEEP_DAYS = 90

WINDOW_SEC = 60
MAX_PER_WINDOW = 120
MAX_SUBJECTS = 5000

_buckets: dict[str, tuple[float, int]] = {}


def _allow(subject: str, n: int) -> int:
    now = time.time()
    if len(_buckets) > MAX_SUBJECTS:
        cutoff = now - WINDOW_SEC
        for key in [k for k, (t, _) in _buckets.items() if t < cutoff]:
            _buckets.pop(key, None)
    start, used = _buckets.get(subject, (now, 0))
    if now - start >= WINDOW_SEC:
        start, used = now, 0
    room = max(0, MAX_PER_WINDOW - used)
    take = min(n, room)
    _buckets[subject] = (start, used + take)
    return take


def _clean(value) -> str:
    raw = json.dumps(value, ensure_ascii=False, default=str)
    return raw[:MAX_PROPS]


def record(items: list[dict], user_id: str | None = None, subject: str = "") -> dict:
    rows = []
    today = date.today().isoformat()
    for item in items[:MAX_BATCH]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("event") or item.get("kind") or "").strip()[:MAX_NAME]
        if not name:
            continue
        props = {k: v for k, v in item.items() if k not in {"event", "kind"}}
        rows.append((today, name, user_id, _clean(props)))
    rows = rows[: _allow(user_id or subject or "unknown", len(rows))]
    if not rows:
        return {"ok": True, "saved": 0}
    conn = db.get_conn()
    try:
        conn.executemany(
            "INSERT INTO app_events (day, name, user_id, props) VALUES (?,?,?,?)", rows
        )
        if random.random() < 0.02:
            conn.execute(
                "DELETE FROM app_events WHERE day < date('now', ?)", (f"-{KEEP_DAYS} days",)
            )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "saved": len(rows)}


def funnel(days: int = 30) -> dict:
    span = max(1, min(int(days or 30), 400))
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT name, COUNT(*) AS n, COUNT(DISTINCT user_id) AS users FROM app_events "
            "WHERE day >= date('now', ?) GROUP BY name ORDER BY n DESC",
            (f"-{span} days",),
        ).fetchall()
    finally:
        conn.close()
    return {"days": span, "events": [dict(r) for r in rows]}
