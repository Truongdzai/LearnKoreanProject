from __future__ import annotations

from datetime import date, datetime, timedelta

from .. import db
from . import accounts

TIERS = [
    {"id": 0, "name": "Đồng", "emoji": "🥉", "color": "#b06c3a"},
    {"id": 1, "name": "Bạc", "emoji": "🥈", "color": "#8b97a8"},
    {"id": 2, "name": "Vàng", "emoji": "🥇", "color": "#d9a520"},
    {"id": 3, "name": "Bạch Kim", "emoji": "💎", "color": "#37b6a8"},
    {"id": 4, "name": "Kim Cương", "emoji": "👑", "color": "#7c6cf5"},
]
TOP_N = 3
BOTTOM_N = 3
MIN_FOR_DROP = 10
REWARDS = [300, 200, 100]


def tier_info(tier: int) -> dict:
    return TIERS[max(0, min(len(TIERS) - 1, int(tier or 0)))]


def week_key(d: date | None = None) -> str:
    d = d or date.today()
    y, w, _ = d.isocalendar()
    return f"{y}-W{w:02d}"


def week_range(key: str) -> tuple[str, str]:
    year, wk = key.split("-W")
    monday = date.fromisocalendar(int(year), int(wk), 1)
    return monday.isoformat(), (monday + timedelta(days=6)).isoformat()


def prev_week(key: str) -> str:
    monday, _ = week_range(key)
    return week_key(date.fromisoformat(monday) - timedelta(days=7))


def week_ends_at(key: str) -> str:
    _, sunday = week_range(key)
    return (datetime.fromisoformat(sunday) + timedelta(days=1)).isoformat()


def _xp_between(conn, user_ids: list[str], start: str, end: str) -> dict[str, int]:
    if not user_ids:
        return {}
    marks = ",".join("?" * len(user_ids))
    rows = conn.execute(
        f"SELECT user_id, COALESCE(SUM(xp),0) AS xp FROM activity_log "
        f"WHERE user_id IN ({marks}) AND day BETWEEN ? AND ? GROUP BY user_id",
        (*user_ids, start, end),
    ).fetchall()
    return {r["user_id"]: r["xp"] for r in rows}


def touch(user_id: str, tier: int) -> None:
    try:
        conn = db.get_conn()
        try:
            conn.execute(
                "INSERT OR IGNORE INTO league_members (week, user_id, tier) VALUES (?,?,?)",
                (week_key(), user_id, int(tier or 0)),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception:
        pass


def _settle_week(conn, user_id: str, row) -> dict | None:
    week, tier = row["week"], int(row["tier"])
    start, end = week_range(week)
    members = [
        r["user_id"] for r in conn.execute(
            "SELECT m.user_id FROM league_members m JOIN users u ON u.id = m.user_id "
            "WHERE m.week = ? AND m.tier = ? AND u.status = 'active' AND u.role != 'admin'",
            (week, tier),
        ).fetchall()
    ]
    xps = _xp_between(conn, members, start, end)
    ranked = sorted(members, key=lambda u: (-xps.get(u, 0), u))
    rank = ranked.index(user_id) + 1 if user_id in ranked else len(ranked) + 1
    my_xp = xps.get(user_id, 0)

    result, reward, new_tier = "stay", 0, tier
    if rank <= TOP_N and my_xp > 0:
        reward = REWARDS[rank - 1]
        if tier < len(TIERS) - 1:
            result, new_tier = "up", tier + 1
    elif len(ranked) >= MIN_FOR_DROP and rank > len(ranked) - BOTTOM_N and tier > 0:
        result, new_tier = "down", tier - 1

    conn.execute(
        "UPDATE league_members SET settled = 1, rank = ?, xp = ?, result = ?, reward = ? "
        "WHERE week = ? AND user_id = ?",
        (rank, my_xp, result, reward, week, user_id),
    )
    conn.execute("UPDATE users SET league_tier = ? WHERE id = ?", (new_tier, user_id))
    conn.commit()
    if reward:
        accounts.add_xp_coins(user_id, coins=reward)
    return {
        "week": week,
        "rank": rank,
        "of": len(ranked),
        "xp": my_xp,
        "result": result,
        "reward": reward,
        "fromTier": tier_info(tier),
        "toTier": tier_info(new_tier),
    }


def standings(user: dict) -> dict:
    now = week_key()
    conn = db.get_conn()
    try:
        last = None
        pending = conn.execute(
            "SELECT week, tier FROM league_members WHERE user_id = ? AND settled = 0 AND week < ? "
            "ORDER BY week",
            (user["id"], now),
        ).fetchall()
        for row in pending:
            last = _settle_week(conn, user["id"], row) or last

        tier = int(conn.execute(
            "SELECT league_tier FROM users WHERE id = ?", (user["id"],)
        ).fetchone()["league_tier"] or 0)
        conn.execute(
            "INSERT INTO league_members (week, user_id, tier) VALUES (?,?,?) "
            "ON CONFLICT(week, user_id) DO UPDATE SET tier = excluded.tier",
            (now, user["id"], tier),
        )
        conn.commit()

        rows = conn.execute(
            "SELECT m.user_id, u.name, u.avatar, u.equipped_frame, u.streak, u.is_plus, u.plus_until "
            "FROM league_members m JOIN users u ON u.id = m.user_id "
            "WHERE m.week = ? AND m.tier = ? AND u.status = 'active' AND u.role != 'admin'",
            (now, tier),
        ).fetchall()
        start, end = week_range(now)
        xps = _xp_between(conn, [r["user_id"] for r in rows], start, end)
    finally:
        conn.close()

    ordered = sorted(rows, key=lambda r: (-xps.get(r["user_id"], 0), r["name"].lower()))
    entries = [
        {
            "rank": i + 1,
            "id": r["user_id"],
            "name": r["name"],
            "avatar": r["avatar"],
            "frame": r["equipped_frame"],
            "streak": r["streak"],
            "isPlus": accounts.plus_active(dict(r)),
            "xp": xps.get(r["user_id"], 0),
            "me": r["user_id"] == user["id"],
            "zone": "up" if i < TOP_N and tier < len(TIERS) - 1
            else ("down" if len(ordered) >= MIN_FOR_DROP and i >= len(ordered) - BOTTOM_N and tier > 0 else ""),
        }
        for i, r in enumerate(ordered)
    ]
    return {
        "week": now,
        "endsAt": week_ends_at(now),
        "tier": tier_info(tier),
        "tiers": TIERS,
        "promote": TOP_N,
        "relegate": BOTTOM_N if len(entries) >= MIN_FOR_DROP and tier > 0 else 0,
        "rewards": REWARDS,
        "entries": entries,
        "lastResult": last,
    }
