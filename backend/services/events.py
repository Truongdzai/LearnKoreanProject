from __future__ import annotations

import json
import random
from datetime import date

from .. import db

MAX_BATCH = 40
MAX_NAME = 60
MAX_PROPS = 2000
KEEP_DAYS = 90


def _clean(value) -> str:
    raw = json.dumps(value, ensure_ascii=False, default=str)
    return raw[:MAX_PROPS]


def record(items: list[dict], user_id: str | None = None) -> dict:
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
