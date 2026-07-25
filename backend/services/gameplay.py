from __future__ import annotations

import json
import secrets
from datetime import date, datetime, timedelta

from fastapi import HTTPException

from ..errors import AppError
from .. import db
from . import accounts, catalog

DAILY_BONUS = 50
DAILY_BONUS_ID = "__daily_bonus__"


def period_key(period: str, today: date | None = None) -> str:
    today = today or date.today()
    if period == "weekly":
        y, w, _ = today.isocalendar()
        return f"{y}-W{w:02d}"
    if period == "monthly":
        return today.strftime("%Y-%m")
    return today.isoformat()


def owned(user_id: str) -> list[str]:
    conn = db.get_conn()
    try:
        rows = conn.execute("SELECT item_id FROM user_items WHERE user_id = ?", (user_id,)).fetchall()
    finally:
        conn.close()
    return [r["item_id"] for r in rows]


def garden(user_id: str) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM user_garden WHERE user_id = ? ORDER BY planted_at", (user_id,)
        ).fetchall()
    finally:
        conn.close()
    return [
        {"id": r["id"], "itemId": r["item_id"], "art": r["art"], "name": r["name"], "growth": r["growth"]}
        for r in rows
    ]


def paths(user_id: str) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM user_paths WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    finally:
        conn.close()
    out = []
    for r in rows:
        try:
            data = json.loads(r["data"])
        except Exception:
            data = {}
        out.append({"id": r["id"], "title": r["title"], **data})
    return out


def saved_videos(user_id: str) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM user_videos WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    finally:
        conn.close()
    return [
        {"id": r["video_id"], "title": r["title"], "channel": r["channel"], "level": r["level"],
         "dur": r["dur"], "topic": r["topic"], "tone": r["tone"],
         "lang": (r["lang"] if "lang" in r.keys() else "ko") or "ko"}
        for r in rows
    ]


def state(user: dict) -> dict:
    return {
        "user": accounts.public_user(user),
        "owned": owned(user["id"]),
        "garden": garden(user["id"]),
        "paths": paths(user["id"]),
        "savedVideos": saved_videos(user["id"]),
        "todayXp": today_xp(user["id"]),
        "goalBonusClaimed": goal_bonus_claimed(user["id"]),
    }


def today_xp(user_id: str) -> int:
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT xp FROM activity_log WHERE user_id = ? AND day = ?",
            (user_id, date.today().isoformat()),
        ).fetchone()
    finally:
        conn.close()
    return row["xp"] if row else 0


def buy(user: dict, item_id: str) -> dict:
    item = catalog.shop_item(item_id)
    if not item:
        raise AppError("NOT_FOUND", "Vật phẩm không tồn tại.", 404)
    if item["plus"] and not user["is_plus"]:
        raise AppError("PLUS_REQUIRED", "Vật phẩm này chỉ dành cho thành viên Plus.", 403)
    if item_id in owned(user["id"]):
        raise HTTPException(status_code=400, detail="Bạn đã sở hữu vật phẩm này.")
    if not accounts.spend_coins(user["id"], item["price"]):
        raise AppError("INSUFFICIENT_COINS", "Không đủ xu — hãy hoàn thành nhiệm vụ để kiếm thêm.")
    conn = db.get_conn()
    try:
        conn.execute("INSERT OR IGNORE INTO user_items (user_id, item_id) VALUES (?,?)", (user["id"], item_id))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "owned": owned(user["id"]), "user": accounts.public_user(accounts.reload(user["id"]))}


def plant(user: dict, item_id: str, art: str, name: str) -> dict:
    pid = "pl" + secrets.token_hex(6)
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO user_garden (id, user_id, item_id, art, name, growth) VALUES (?,?,?,?,?,8)",
            (pid, user["id"], item_id, art, name),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"])}


_GROWTH_STAGE_LANDING = {1: 30, 2: 55, 3: 80, 4: 100}


def _growth_stage(g: int) -> int:
    if g >= 100:
        return 4
    if g >= 70:
        return 3
    if g >= 40:
        return 2
    if g >= 20:
        return 1
    return 0


def water(user: dict, plant_id: str) -> dict:
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT growth FROM user_garden WHERE id = ? AND user_id = ?",
            (plant_id, user["id"]),
        ).fetchone()
        if row is not None:
            nxt = _GROWTH_STAGE_LANDING[min(4, _growth_stage(row["growth"]) + 1)]
            conn.execute(
                "UPDATE user_garden SET growth = ? WHERE id = ? AND user_id = ?",
                (nxt, plant_id, user["id"]),
            )
            conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"])}


def remove_plant(user: dict, plant_id: str) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM user_garden WHERE id = ? AND user_id = ?", (plant_id, user["id"]))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"])}


def add_path(user: dict, title: str, data: dict) -> dict:
    pid = "pa" + secrets.token_hex(6)
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO user_paths (id, user_id, title, data) VALUES (?,?,?,?)",
            (pid, user["id"], title, json.dumps(data, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "paths": paths(user["id"])}


def save_video(user: dict, v: dict) -> dict:
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO user_videos (user_id, video_id, title, channel, level, dur, topic, tone, lang) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            (user["id"], v.get("id"), v.get("title"), v.get("channel"), v.get("level"),
             v.get("dur"), v.get("topic"), v.get("tone"), v.get("lang") or "ko"),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "savedVideos": saved_videos(user["id"])}


def remove_video(user: dict, video_id: str) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM user_videos WHERE user_id = ? AND video_id = ?", (user["id"], video_id))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "savedVideos": saved_videos(user["id"])}


def _progress_for(conn, user_id: str, quest: dict) -> int:
    if quest["metric"] == "streak":
        row = conn.execute("SELECT streak FROM users WHERE id = ?", (user_id,)).fetchone()
        return min(quest["target"], row["streak"] if row else 0)
    if quest["metric"] == "login":
        month = date.today().strftime("%Y-%m")
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM activity_log WHERE user_id = ? AND day LIKE ?",
            (user_id, month + "%"),
        ).fetchone()
        return min(quest["target"], row["n"])
    pk = period_key(quest["period"])
    row = conn.execute(
        "SELECT progress FROM quest_progress WHERE user_id = ? AND quest_id = ? AND period_key = ?",
        (user_id, quest["id"], pk),
    ).fetchone()
    return row["progress"] if row else 0


def _claimed(conn, user_id: str, quest: dict) -> bool:
    pk = period_key(quest["period"])
    row = conn.execute(
        "SELECT claimed FROM quest_progress WHERE user_id = ? AND quest_id = ? AND period_key = ?",
        (user_id, quest["id"], pk),
    ).fetchone()
    return bool(row and row["claimed"])


def quests_for(user: dict) -> list[dict]:
    items = catalog.quests()
    conn = db.get_conn()
    try:
        out = []
        for q in items:
            progress = _progress_for(conn, user["id"], q)
            out.append({
                "id": q["id"], "title": q["title"], "desc": q["desc"], "period": q["period"],
                "reward": q["reward"], "target": q["target"], "plus": q["plus"],
                "progress": progress, "claimed": _claimed(conn, user["id"], q),
            })
    finally:
        conn.close()
    return out


def claim_quest(user: dict, quest_id: str) -> dict:
    quest = next((q for q in catalog.quests() if q["id"] == quest_id), None)
    if not quest:
        raise AppError("NOT_FOUND", "Nhiệm vụ không tồn tại.", 404)
    if quest["plus"] and not user["is_plus"]:
        raise AppError("PLUS_REQUIRED", "Nhiệm vụ này chỉ dành cho thành viên Plus.", 403)
    conn = db.get_conn()
    try:
        progress = _progress_for(conn, user["id"], quest)
        if progress < quest["target"]:
            raise HTTPException(status_code=400, detail="Bạn chưa hoàn thành nhiệm vụ này.")
        if _claimed(conn, user["id"], quest):
            raise AppError("ALREADY_CLAIMED", "Bạn đã nhận thưởng nhiệm vụ này rồi.", 409)
        pk = period_key(quest["period"])
        conn.execute(
            "INSERT INTO quest_progress (user_id, quest_id, period_key, progress, claimed) "
            "VALUES (?,?,?,?,1) ON CONFLICT(user_id, quest_id, period_key) "
            "DO UPDATE SET claimed = 1, progress = excluded.progress",
            (user["id"], quest["id"], pk, progress),
        )
        conn.commit()
    finally:
        conn.close()
    accounts.add_xp_coins(user["id"], coins=quest["reward"])
    return {"ok": True, "user": accounts.public_user(accounts.reload(user["id"]))}


def daily_bonus(user: dict) -> dict:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT claimed FROM quest_progress WHERE user_id = ? AND quest_id = ? AND period_key = ?",
            (user["id"], DAILY_BONUS_ID, today),
        ).fetchone()
        if row and row["claimed"]:
            raise AppError("ALREADY_CLAIMED", "Hôm nay bạn đã nhận thưởng đăng nhập rồi.", 409)
        conn.execute(
            "INSERT INTO quest_progress (user_id, quest_id, period_key, progress, claimed) "
            "VALUES (?,?,?,1,1) ON CONFLICT(user_id, quest_id, period_key) DO UPDATE SET claimed = 1",
            (user["id"], DAILY_BONUS_ID, today),
        )
        conn.commit()
    finally:
        conn.close()
    user2 = accounts.add_xp_coins(user["id"], coins=DAILY_BONUS)
    return {"ok": True, "reward": DAILY_BONUS, "user": accounts.public_user(user2)}


def bonus_available(user_id: str) -> bool:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT claimed FROM quest_progress WHERE user_id = ? AND quest_id = ? AND period_key = ?",
            (user_id, DAILY_BONUS_ID, today),
        ).fetchone()
    finally:
        conn.close()
    return not (row and row["claimed"])


GOAL_BONUS_ID = "sys-goal-bonus"
GOAL_LEVELS = {30, 50, 100, 200}


def goal_bonus_claimed(user_id: str) -> bool:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT claimed FROM quest_progress WHERE user_id = ? AND quest_id = ? AND period_key = ?",
            (user_id, GOAL_BONUS_ID, today),
        ).fetchone()
    finally:
        conn.close()
    return bool(row and row["claimed"])


def goal_bonus(user: dict, goal: int) -> dict:
    if goal not in GOAL_LEVELS:
        raise HTTPException(status_code=400, detail="Mức mục tiêu không hợp lệ.")
    if today_xp(user["id"]) < goal:
        raise HTTPException(status_code=400, detail="Bạn chưa đạt mục tiêu hôm nay — cố thêm chút nữa nhé!")
    if goal_bonus_claimed(user["id"]):
        raise AppError("ALREADY_CLAIMED", "Hôm nay bạn đã nhận thưởng mục tiêu rồi. Hẹn mai nhé!", 409)
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO quest_progress (user_id, quest_id, period_key, progress, claimed) "
            "VALUES (?,?,?,1,1) ON CONFLICT(user_id, quest_id, period_key) DO UPDATE SET claimed = 1",
            (user["id"], GOAL_BONUS_ID, today),
        )
        conn.commit()
    finally:
        conn.close()
    reward = goal // 2
    user2 = accounts.add_xp_coins(user["id"], coins=reward)
    return {"ok": True, "reward": reward, "user": accounts.public_user(user2)}


_EVENT_XP = {"lesson": 30, "pronounce": 5, "review": 2, "video": 25, "word": 4, "login": 0, "toeic": 10, "grammar": 10}


def record_event(user: dict, etype: str, amount: int = 1, minutes: int = 0, words: int = 0) -> dict:
    amount = max(0, int(amount))
    minutes = max(0, int(minutes))
    today = date.today().isoformat()
    xp_gain = _EVENT_XP.get(etype, 0) * amount
    lessons = amount if etype == "lesson" else 0
    word_gain = words or (amount if etype == "word" else 0)
    videos = amount if etype == "video" else 0
    reviews = amount if etype == "review" else 0

    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO activity_log (user_id, day, minutes, words, xp, lessons, videos, reviews) "
            "VALUES (?,?,?,?,?,?,?,?) "
            "ON CONFLICT(user_id, day) DO UPDATE SET minutes = minutes + ?, words = words + ?, "
            "xp = xp + ?, lessons = lessons + ?, videos = videos + ?, reviews = reviews + ?",
            (user["id"], today, minutes, word_gain, xp_gain, lessons, videos, reviews,
             minutes, word_gain, xp_gain, lessons, videos, reviews),
        )
        for q in catalog.quests():
            if q["metric"] == etype and q["metric"] not in {"streak", "login"}:
                pk = period_key(q["period"])
                conn.execute(
                    "INSERT INTO quest_progress (user_id, quest_id, period_key, progress) VALUES (?,?,?,?) "
                    "ON CONFLICT(user_id, quest_id, period_key) DO UPDATE SET progress = progress + ?, "
                    "updated_at = datetime('now','localtime')",
                    (user["id"], q["id"], pk, amount, amount),
                )
        conn.commit()
    finally:
        conn.close()
    if xp_gain:
        accounts.add_xp_coins(user["id"], xp=xp_gain)
    return {"ok": True, "user": accounts.public_user(accounts.reload(user["id"]))}


def activities(user_id: str) -> dict:
    today = date.today()
    days = [(today - timedelta(days=6 - i)) for i in range(7)]
    conn = db.get_conn()
    try:
        rows = {
            r["day"]: r
            for r in conn.execute(
                "SELECT * FROM activity_log WHERE user_id = ? AND day >= ?",
                (user_id, days[0].isoformat()),
            ).fetchall()
        }
        srs_total = conn.execute("SELECT COUNT(*) AS n FROM srs_cards WHERE user_id = ?", (user_id,)).fetchone()["n"]
    finally:
        conn.close()
    labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    minutes, words = [], []
    for d in days:
        r = rows.get(d.isoformat())
        minutes.append(r["minutes"] if r else 0)
        words.append(r["words"] if r else 0)
    today_idx = (today.weekday())
    return {
        "labels": labels,
        "minutes": minutes,
        "words": words,
        "todayIdx": today_idx,
        "totalMinutes": sum(minutes),
        "totalWords": sum(words),
        "srsTotal": srs_total,
    }


PLAN_DATA_MAX = 128 * 1024


def get_plan(user_id: str, plan_id: str) -> dict:
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT data, updated_at FROM user_plans WHERE user_id = ? AND plan_id = ?",
            (user_id, plan_id),
        ).fetchone()
    finally:
        conn.close()
    if not row:
        return {"ok": True, "data": None, "updatedAt": None}
    try:
        data = json.loads(row["data"])
    except Exception:
        data = None
    return {"ok": True, "data": data, "updatedAt": row["updated_at"]}


def set_plan(user_id: str, plan_id: str, data: dict) -> dict:
    raw = json.dumps(data, ensure_ascii=False)
    if len(raw.encode("utf-8")) > PLAN_DATA_MAX:
        raise AppError("VALIDATION", "Dữ liệu lộ trình quá lớn.", 422)
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO user_plans (user_id, plan_id, data) VALUES (?,?,?) "
            "ON CONFLICT(user_id, plan_id) DO UPDATE SET data = ?, "
            "updated_at = datetime('now','localtime')",
            (user_id, plan_id, raw, raw),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


def activity_days(user_id: str, since: str) -> dict:
    try:
        start = date.fromisoformat(since)
    except ValueError:
        raise AppError("VALIDATION", "Tham số since phải là ngày YYYY-MM-DD.", 422)
    floor = date.today() - timedelta(days=400)
    if start < floor:
        start = floor
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT day, minutes, words, lessons, videos, reviews FROM activity_log "
            "WHERE user_id = ? AND day >= ? ORDER BY day",
            (user_id, start.isoformat()),
        ).fetchall()
    finally:
        conn.close()
    return {
        "days": [
            {"day": r["day"], "minutes": r["minutes"], "words": r["words"],
             "lessons": r["lessons"], "videos": r["videos"], "reviews": r["reviews"]}
            for r in rows
        ]
    }
