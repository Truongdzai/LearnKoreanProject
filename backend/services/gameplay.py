from __future__ import annotations

import json
import secrets
from datetime import date, datetime, timedelta

from fastapi import HTTPException

from ..errors import AppError
from .. import db
from . import accounts, catalog, league

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


WATER_PER_DAY = 1
WATER_PLUS_PER_DAY = 2
GROWTH_PER_WATER = 14


def owned(user_id: str) -> list[str]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT item_id FROM user_items WHERE user_id = ? AND qty > 0", (user_id,)
        ).fetchall()
    finally:
        conn.close()
    return [r["item_id"] for r in rows]


def seeds(user_id: str) -> dict[str, int]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT i.item_id AS item_id, i.qty AS qty FROM user_items i "
            "JOIN catalog_shop c ON c.id = i.item_id "
            "WHERE i.user_id = ? AND c.category = 'seed' AND i.qty > 0",
            (user_id,),
        ).fetchall()
    finally:
        conn.close()
    return {r["item_id"]: r["qty"] for r in rows}


def water_cap(user: dict) -> int:
    return WATER_PLUS_PER_DAY if user["is_plus"] else WATER_PER_DAY


def water_state(user: dict) -> dict:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used, bonus FROM user_water WHERE user_id = ? AND day = ?",
            (user["id"], today),
        ).fetchone()
    finally:
        conn.close()
    used = row["used"] if row else 0
    bonus = row["bonus"] if row else 0
    cap = water_cap(user) + bonus
    return {"left": max(0, cap - used), "max": cap, "used": used, "bonus": bonus}


def grant_water(user_id: str, n: int) -> None:
    if n <= 0:
        return
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO user_water (user_id, day, used, bonus) VALUES (?,?,0,?) "
            "ON CONFLICT(user_id, day) DO UPDATE SET bonus = bonus + ?",
            (user_id, today, n, n),
        )
        conn.commit()
    finally:
        conn.close()


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
        "seeds": seeds(user["id"]),
        "water": water_state(user),
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


MAX_SEED_BUY = 20


def buy(user: dict, item_id: str, qty: int = 1) -> dict:
    item = catalog.shop_item(item_id)
    if not item:
        raise AppError("NOT_FOUND", "Vật phẩm không tồn tại.", 404)
    if item["plus"] and not user["is_plus"]:
        raise AppError("PLUS_REQUIRED", "Vật phẩm này chỉ dành cho thành viên Plus.", 403)
    is_seed = item["category"] == "seed"
    qty = max(1, min(MAX_SEED_BUY, int(qty))) if is_seed else 1
    if not is_seed and item_id in owned(user["id"]):
        raise HTTPException(status_code=400, detail="Bạn đã sở hữu vật phẩm này.")
    if not accounts.spend_coins(user["id"], item["price"] * qty):
        raise AppError("INSUFFICIENT_COINS", "Không đủ xu — hãy hoàn thành nhiệm vụ để kiếm thêm.")
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO user_items (user_id, item_id, qty) VALUES (?,?,?) "
            "ON CONFLICT(user_id, item_id) DO UPDATE SET qty = qty + ?",
            (user["id"], item_id, qty, qty),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "owned": owned(user["id"]), "seeds": seeds(user["id"]),
            "user": accounts.public_user(accounts.reload(user["id"]))}


MAX_PLANTS = 40
MAX_PATHS = 40
MAX_PATH_CHARS = 40_000


def plant(user: dict, item_id: str, art: str, name: str) -> dict:
    item = catalog.shop_item(item_id)
    if not item or item["category"] != "seed":
        raise AppError("NOT_FOUND", "Hạt giống này không tồn tại.", 404)
    art, name = item["art"], item["name"]
    pid = "pl" + secrets.token_hex(6)
    conn = db.get_conn()
    try:
        grown = conn.execute(
            "SELECT COUNT(*) AS n FROM user_garden WHERE user_id = ?", (user["id"],)
        ).fetchone()["n"]
        if grown >= MAX_PLANTS:
            raise AppError(
                "GARDEN_FULL",
                f"Vườn chỉ chứa được {MAX_PLANTS} cây — nhổ bớt cây cũ rồi trồng tiếp nhé.",
            )
        row = conn.execute(
            "SELECT qty FROM user_items WHERE user_id = ? AND item_id = ?",
            (user["id"], item_id),
        ).fetchone()
        if not row or row["qty"] < 1:
            raise AppError("NO_SEED", "Bạn không còn hạt giống này — hãy mua thêm ở cửa hàng.")
        conn.execute(
            "UPDATE user_items SET qty = qty - 1 WHERE user_id = ? AND item_id = ?",
            (user["id"], item_id),
        )
        conn.execute(
            "DELETE FROM user_items WHERE user_id = ? AND item_id = ? AND qty <= 0",
            (user["id"], item_id),
        )
        conn.execute(
            "INSERT INTO user_garden (id, user_id, item_id, art, name, growth) VALUES (?,?,?,?,?,8)",
            (pid, user["id"], item_id, art, name),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"]), "owned": owned(user["id"]),
            "seeds": seeds(user["id"])}


def water(user: dict, plant_id: str) -> dict:
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT growth FROM user_garden WHERE id = ? AND user_id = ?",
            (plant_id, user["id"]),
        ).fetchone()
        if row is None:
            raise AppError("NOT_FOUND", "Không tìm thấy cây này trong vườn.", 404)
        if row["growth"] >= 100:
            raise HTTPException(status_code=400, detail="Cây này đã nở hoa rồi.")
        wrow = conn.execute(
            "SELECT used, bonus FROM user_water WHERE user_id = ? AND day = ?",
            (user["id"], today),
        ).fetchone()
        used = wrow["used"] if wrow else 0
        bonus = wrow["bonus"] if wrow else 0
        if used >= water_cap(user) + bonus:
            raise AppError(
                "NO_WATER",
                "Hết nước tưới hôm nay — làm nhiệm vụ để có thêm, hoặc đợi sang ngày mai.",
            )
        nxt = min(100, row["growth"] + GROWTH_PER_WATER)
        conn.execute(
            "UPDATE user_garden SET growth = ? WHERE id = ? AND user_id = ?",
            (nxt, plant_id, user["id"]),
        )
        conn.execute(
            "INSERT INTO user_water (user_id, day, used, bonus) VALUES (?,?,1,0) "
            "ON CONFLICT(user_id, day) DO UPDATE SET used = used + 1",
            (user["id"], today),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"]), "water": water_state(user)}


def remove_plant(user: dict, plant_id: str) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM user_garden WHERE id = ? AND user_id = ?", (plant_id, user["id"]))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "garden": garden(user["id"])}


def add_path(user: dict, title: str, data: dict) -> dict:
    blob = json.dumps(data, ensure_ascii=False)
    if len(blob) > MAX_PATH_CHARS:
        raise AppError("PATH_TOO_BIG", "Lộ trình này quá lớn để lưu.", 400)
    pid = "pa" + secrets.token_hex(6)
    conn = db.get_conn()
    try:
        have = conn.execute(
            "SELECT COUNT(*) AS n FROM user_paths WHERE user_id = ?", (user["id"],)
        ).fetchone()["n"]
        if have >= MAX_PATHS:
            raise AppError("PATHS_FULL", f"Bạn đã lưu {MAX_PATHS} lộ trình — xoá bớt rồi thêm mới nhé.")
        conn.execute(
            "INSERT INTO user_paths (id, user_id, title, data) VALUES (?,?,?,?)",
            (pid, user["id"], title, blob),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "paths": paths(user["id"])}


def save_video(user: dict, v: dict) -> dict:
    from . import quota

    conn = db.get_conn()
    try:
        lang = (v.get("lang") or "").strip().lower()
        if not lang:
            known = conn.execute(
                "SELECT lang FROM catalog_videos WHERE id = ?", (v.get("id"),)
            ).fetchone()
            lang = (known["lang"] if known else "") or "ko"
        if not quota.is_plus(user):
            have = conn.execute(
                "SELECT COUNT(*) AS n FROM user_videos WHERE user_id = ?", (user["id"],)
            ).fetchone()["n"]
            already = conn.execute(
                "SELECT 1 FROM user_videos WHERE user_id = ? AND video_id = ?",
                (user["id"], v.get("id")),
            ).fetchone()
            if not already and have >= quota.FREE_VIDEOS:
                raise AppError(
                    "PLUS_REQUIRED",
                    f"Gói Miễn phí lưu được {quota.FREE_VIDEOS} video. "
                    "Xoá bớt một video cũ, hoặc nâng cấp Plus để lưu không giới hạn.",
                    403,
                )
        conn.execute(
            "INSERT OR IGNORE INTO user_videos (user_id, video_id, title, channel, level, dur, topic, tone, lang) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            (user["id"], v.get("id"), v.get("title"), v.get("channel"), v.get("level"),
             v.get("dur"), v.get("topic"), v.get("tone"), lang),
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
                "reward": q["reward"], "water": q.get("water", 0), "target": q["target"], "plus": q["plus"],
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
    grant_water(user["id"], int(quest.get("water") or 0))
    return {"ok": True, "user": accounts.public_user(accounts.reload(user["id"])),
            "water": water_state(user)}


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


_EVENT_XP = {"lesson": 30, "pronounce": 5, "review": 2, "video": 25, "word": 4, "login": 0, "toeic": 10, "grammar": 10, "tutor": 3}


def record_event(user: dict, etype: str, amount: int = 1, minutes: int = 0, words: int = 0,
                 lang: str = "") -> dict:
    amount = max(0, int(amount))
    minutes = max(0, int(minutes))
    lang = (lang or "").strip().lower()[:8]
    if etype != "login" and (amount or minutes or words):
        accounts.touch_streak(user["id"])
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
        if lang:
            conn.execute(
                "INSERT INTO activity_lang (user_id, day, lang, minutes, words, xp, lessons, videos, reviews) "
                "VALUES (?,?,?,?,?,?,?,?,?) "
                "ON CONFLICT(user_id, day, lang) DO UPDATE SET minutes = minutes + ?, words = words + ?, "
                "xp = xp + ?, lessons = lessons + ?, videos = videos + ?, reviews = reviews + ?",
                (user["id"], today, lang, minutes, word_gain, xp_gain, lessons, videos, reviews,
                 minutes, word_gain, xp_gain, lessons, videos, reviews),
            )
        for q in catalog.quests():
            if q.get("lang") and lang and q["lang"] != lang:
                continue
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
        league.touch(user["id"], user.get("league_tier") or 0)
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


MAX_WORDS_PER_LANG = 20000


def learned_words(user_id: str, lang: str) -> list[str]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT word FROM user_words WHERE user_id = ? AND lang = ? ORDER BY word",
            (user_id, lang),
        ).fetchall()
        return [r["word"] for r in rows]
    finally:
        conn.close()


def mark_words(user_id: str, lang: str, add: list[str], remove: list[str]) -> dict:
    lang = (lang or "").strip().lower()[:8]
    if not lang:
        raise AppError("VALIDATION", "Thiếu mã ngôn ngữ.", 422)
    add = [w.strip()[:120] for w in add if w and w.strip()][:2000]
    remove = [w.strip()[:120] for w in remove if w and w.strip()][:2000]
    conn = db.get_conn()
    try:
        if add:
            have = conn.execute(
                "SELECT COUNT(*) AS n FROM user_words WHERE user_id = ? AND lang = ?",
                (user_id, lang),
            ).fetchone()["n"]
            room = max(0, MAX_WORDS_PER_LANG - have)
            conn.executemany(
                "INSERT INTO user_words (user_id, lang, word) VALUES (?,?,?) "
                "ON CONFLICT(user_id, lang, word) DO UPDATE SET updated_at = datetime('now','localtime')",
                [(user_id, lang, w) for w in add[:room]],
            )
        if remove:
            conn.executemany(
                "DELETE FROM user_words WHERE user_id = ? AND lang = ? AND word = ?",
                [(user_id, lang, w) for w in remove],
            )
        conn.commit()
        total = conn.execute(
            "SELECT COUNT(*) AS n FROM user_words WHERE user_id = ? AND lang = ?",
            (user_id, lang),
        ).fetchone()["n"]
    finally:
        conn.close()
    return {"ok": True, "total": total}


def progress_by_lang(user_id: str, days: int = 30) -> dict:
    span = max(1, min(int(days or 30), 400))
    start = (date.today() - timedelta(days=span - 1)).isoformat()
    today = date.today().isoformat()
    conn = db.get_conn()
    try:
        acts = conn.execute(
            "SELECT lang, COALESCE(SUM(minutes),0) AS minutes, COALESCE(SUM(words),0) AS words, "
            "COALESCE(SUM(xp),0) AS xp, COALESCE(SUM(lessons),0) AS lessons, "
            "COALESCE(SUM(videos),0) AS videos, COALESCE(SUM(reviews),0) AS reviews, "
            "COUNT(DISTINCT day) AS activeDays, MAX(day) AS lastDay "
            "FROM activity_lang WHERE user_id = ? AND day >= ? GROUP BY lang",
            (user_id, start),
        ).fetchall()
        cards = conn.execute(
            "SELECT lang, COUNT(*) AS total, "
            "COALESCE(SUM(CASE WHEN due <= ? THEN 1 ELSE 0 END),0) AS due, "
            "COALESCE(SUM(CASE WHEN reps >= 2 THEN 1 ELSE 0 END),0) AS learned "
            "FROM srs_cards WHERE user_id = ? GROUP BY lang",
            (today, user_id),
        ).fetchall()
        words = conn.execute(
            "SELECT lang, COUNT(*) AS n FROM user_words WHERE user_id = ? GROUP BY lang",
            (user_id,),
        ).fetchall()
        videos = conn.execute(
            "SELECT lang, COUNT(*) AS n FROM user_videos WHERE user_id = ? GROUP BY lang",
            (user_id,),
        ).fetchall()
    finally:
        conn.close()

    out: dict[str, dict] = {}

    def slot(code: str) -> dict:
        key = (code or "").strip().lower() or "khac"
        if key not in out:
            out[key] = {
                "lang": key, "minutes": 0, "words": 0, "xp": 0, "lessons": 0,
                "videos": 0, "reviews": 0, "activeDays": 0, "lastDay": None,
                "cards": {"total": 0, "due": 0, "learned": 0},
                "learnedWords": 0, "savedVideos": 0,
            }
        return out[key]

    for r in acts:
        s = slot(r["lang"])
        for k in ("minutes", "words", "xp", "lessons", "videos", "reviews", "activeDays"):
            s[k] = r[k]
        s["lastDay"] = r["lastDay"]
    for r in cards:
        slot(r["lang"])["cards"] = {"total": r["total"], "due": r["due"], "learned": r["learned"]}
    for r in words:
        slot(r["lang"])["learnedWords"] = r["n"]
    for r in videos:
        slot(r["lang"])["savedVideos"] = r["n"]

    ranked = sorted(out.values(), key=lambda x: (x["xp"], x["cards"]["total"]), reverse=True)
    return {"since": start, "days": span, "langs": ranked}


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
