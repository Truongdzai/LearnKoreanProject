from __future__ import annotations

import json
import secrets

from .. import config, db
from ..errors import AppError
from . import auth, llm
from .langs import study_name, native_name

MAX_SIZE = 5
MIN_SIZE = 2
IDLE_SECONDS = 150
MEMBER_GRACE = 75
KEEP_MSGS = 80
MSG_TTL_HOURS = 3
MAX_TEXT = 400
MAX_AUDIO_CHARS = 420_000
MAX_ROOMS_LISTED = 40
LEVELS = ("a1", "a2", "b1", "b2", "c1", "c2")
LEGACY_LEVELS = {"beginner": "a1", "intermediate": "b1", "advanced": "c1"}
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

SIGNAL_KINDS = ("offer", "answer", "ice", "bye", "mute")
SIGNAL_TTL_SECONDS = 120
MAX_SIGNAL_CHARS = 8000
MAX_SIGNALS_READ = 60

QUEUE_IDLE_SECONDS = 40
PAIR_SIZE = 2
MAX_TOPICS = 10
MATCH_TOPICS = {
    "ielts": "IELTS Speaking",
    "toeic": "TOEIC Speaking",
    "toefl": "TOEFL Speaking",
    "topik": "TOPIK Nói",
    "hsk": "HSK Khẩu ngữ",
    "jlpt": "JLPT Hội thoại",
    "interview": "Phỏng vấn xin việc",
    "business": "Tiếng Anh công sở",
    "academic": "Học thuật",
    "daily": "Đời thường",
    "travel": "Du lịch",
    "food": "Ẩm thực",
    "music": "Âm nhạc",
    "movies": "Phim ảnh",
    "sport": "Thể thao",
    "tech": "Công nghệ",
    "gaming": "Game",
    "books": "Sách",
    "science": "Khoa học",
    "art": "Nghệ thuật",
    "health": "Sức khoẻ",
    "fashion": "Thời trang",
    "nature": "Thiên nhiên",
}


def norm_level(value) -> str:
    raw = str(value or "").strip().lower()
    if raw in LEVELS:
        return raw
    return LEGACY_LEVELS.get(raw, "a2")


def _neighbours(level: str) -> tuple[str, ...]:
    i = LEVELS.index(level)
    return tuple(LEVELS[j] for j in (i - 1, i + 1) if 0 <= j < len(LEVELS))


def _code(n: int = 6) -> str:
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(n))


def _clean(text: str | None, limit: int) -> str:
    return " ".join((text or "").split())[:limit]


def _hash(password: str) -> str:
    digest, salt = auth.hash_password(password)
    return f"{digest}${salt}"


def _check_pass(password: str, stored: str | None) -> bool:
    if not stored:
        return True
    try:
        digest, salt = stored.split("$", 1)
    except ValueError:
        return False
    return auth.verify_password(password or "", digest, salt)


def _sweep_queue(conn) -> None:
    conn.execute(
        "DELETE FROM speak_queue WHERE seen_at < datetime('now','localtime',?)",
        (f"-{QUEUE_IDLE_SECONDS} seconds",),
    )
    conn.execute(
        "DELETE FROM speak_queue WHERE room_id IS NOT NULL "
        "AND room_id NOT IN (SELECT id FROM speak_rooms)"
    )


def _sweep(conn) -> None:
    _sweep_queue(conn)
    conn.execute(
        "DELETE FROM speak_signals WHERE created_at < datetime('now','localtime',?)",
        (f"-{SIGNAL_TTL_SECONDS} seconds",),
    )
    conn.execute(
        "DELETE FROM speak_room_members WHERE seen_at < datetime('now','localtime',?)",
        (f"-{IDLE_SECONDS} seconds",),
    )
    conn.execute("DELETE FROM speak_room_members WHERE room_id NOT IN (SELECT id FROM speak_rooms)")
    for row in conn.execute("SELECT id, host_id FROM speak_rooms").fetchall():
        still = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (row["id"], row["host_id"]),
        ).fetchone()
        if still:
            continue
        nxt = conn.execute(
            "SELECT user_id FROM speak_room_members WHERE room_id = ? ORDER BY joined_at LIMIT 1",
            (row["id"],),
        ).fetchone()
        if nxt:
            conn.execute("UPDATE speak_rooms SET host_id = ? WHERE id = ?", (nxt["user_id"], row["id"]))
    conn.execute("DELETE FROM speak_rooms WHERE id NOT IN (SELECT room_id FROM speak_room_members)")
    conn.execute("DELETE FROM speak_room_msgs WHERE room_id NOT IN (SELECT id FROM speak_rooms)")
    conn.execute(
        "DELETE FROM speak_room_msgs WHERE created_at < datetime('now','localtime',?)",
        (f"-{MSG_TTL_HOURS} hours",),
    )
    conn.commit()


def _room(conn, room_id: str):
    row = conn.execute("SELECT * FROM speak_rooms WHERE id = ?", (room_id,)).fetchone()
    if not row:
        raise AppError("ROOM_NOT_FOUND", "Phòng không tồn tại hoặc đã đóng.", 404)
    return row


def _members(conn, room_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT m.user_id, m.joined_at, u.name, u.avatar, u.equipped_frame, u.streak, u.xp "
        "FROM speak_room_members m JOIN users u ON u.id = m.user_id "
        "WHERE m.room_id = ? ORDER BY m.joined_at, m.user_id",
        (room_id,),
    ).fetchall()
    return [
        {
            "id": r["user_id"],
            "name": r["name"],
            "avatar": r["avatar"],
            "frame": r["equipped_frame"],
            "streak": r["streak"],
            "xp": r["xp"],
        }
        for r in rows
    ]


def _size(conn, room_id: str) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM speak_room_members WHERE room_id = ?", (room_id,)
    ).fetchone()
    return row["n"] if row else 0


def _card(conn, row) -> dict:
    host = conn.execute("SELECT name FROM users WHERE id = ?", (row["host_id"],)).fetchone()
    return {
        "id": row["id"],
        "name": row["name"],
        "topic": row["topic"] or "",
        "lang": row["lang"],
        "level": row["level"],
        "mode": row["mode"],
        "locked": bool(row["pass_hash"]),
        "hostId": row["host_id"],
        "hostName": host["name"] if host else "",
        "size": _size(conn, row["id"]),
        "max": row["max_size"],
        "createdAt": row["created_at"],
    }


def _msg(row) -> dict:
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "name": row["name"] or "",
        "avatar": row["avatar"],
        "kind": row["kind"],
        "text": row["text"] or "",
        "audio": bool(row["has_audio"]),
        "at": row["created_at"],
    }


def _msgs(conn, room_id: str, after: int) -> list[dict]:
    rows = conn.execute(
        "SELECT m.id, m.user_id, m.kind, m.text, m.created_at, (m.audio IS NOT NULL) AS has_audio, "
        "u.name, u.avatar FROM speak_room_msgs m LEFT JOIN users u ON u.id = m.user_id "
        "WHERE m.room_id = ? AND m.id > ? ORDER BY m.id LIMIT 120",
        (room_id, after),
    ).fetchall()
    return [_msg(r) for r in rows]


def _system(conn, room_id: str, user_id: str, kind: str, text: str = "") -> None:
    conn.execute(
        "INSERT INTO speak_room_msgs (room_id, user_id, kind, text) VALUES (?,?,?,?)",
        (room_id, user_id, kind, text),
    )


def _trim(conn, room_id: str) -> None:
    conn.execute(
        "DELETE FROM speak_room_msgs WHERE room_id = ? AND id NOT IN "
        "(SELECT id FROM speak_room_msgs WHERE room_id = ? ORDER BY id DESC LIMIT ?)",
        (room_id, room_id, KEEP_MSGS),
    )


def _leave(conn, room_id: str, user_id: str) -> None:
    gone = conn.execute(
        "DELETE FROM speak_room_members WHERE room_id = ? AND user_id = ?", (room_id, user_id)
    ).rowcount
    if gone:
        _system(conn, room_id, user_id, "left")


def _prune_room(conn, room_id: str) -> None:
    gone = conn.execute(
        "SELECT user_id FROM speak_room_members WHERE room_id = ? AND seen_at < datetime('now','localtime',?)",
        (room_id, f"-{MEMBER_GRACE} seconds"),
    ).fetchall()
    if not gone:
        return
    for r in gone:
        _leave(conn, room_id, r["user_id"])
    row = conn.execute("SELECT host_id FROM speak_rooms WHERE id = ?", (room_id,)).fetchone()
    if not row:
        conn.commit()
        return
    still = conn.execute(
        "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?", (room_id, row["host_id"])
    ).fetchone()
    if not still:
        nxt = conn.execute(
            "SELECT user_id FROM speak_room_members WHERE room_id = ? ORDER BY joined_at, user_id LIMIT 1",
            (room_id,),
        ).fetchone()
        if nxt:
            conn.execute("UPDATE speak_rooms SET host_id = ? WHERE id = ?", (nxt["user_id"], room_id))
        else:
            conn.execute("DELETE FROM speak_rooms WHERE id = ?", (room_id,))
            conn.execute("DELETE FROM speak_room_msgs WHERE room_id = ?", (room_id,))
            conn.execute("DELETE FROM speak_signals WHERE room_id = ?", (room_id,))
    conn.commit()


def _my_room(conn, user_id: str) -> str | None:
    row = conn.execute(
        "SELECT room_id FROM speak_room_members WHERE user_id = ? LIMIT 1", (user_id,)
    ).fetchone()
    return row["room_id"] if row else None


def lobby(user: dict, lang: str = "") -> dict:
    conn = db.get_conn()
    try:
        _sweep(conn)
        sql = "SELECT * FROM speak_rooms WHERE mode = 'public'"
        args: list = []
        if lang:
            sql += " AND lang = ?"
            args.append(lang)
        sql += " ORDER BY created_at DESC LIMIT ?"
        args.append(MAX_ROOMS_LISTED)
        rooms = [_card(conn, r) for r in conn.execute(sql, args).fetchall()]
        return {
            "rooms": [r for r in rooms if r["size"] < r["max"]],
            "mine": _my_room(conn, user["id"]),
            "max": MAX_SIZE,
        }
    finally:
        conn.close()


def peek(user: dict, room_id: str) -> dict:
    conn = db.get_conn()
    try:
        _sweep(conn)
        row = _room(conn, (room_id or "").strip().upper())
        card = _card(conn, row)
        card["needPass"] = bool(row["pass_hash"])
        card["member"] = bool(
            conn.execute(
                "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
                (row["id"], user["id"]),
            ).fetchone()
        )
        return card
    finally:
        conn.close()


def create(user: dict, body: dict) -> dict:
    name = _clean(body.get("name"), 42)
    if len(name) < 2:
        raise AppError("ROOM_NAME", "Hãy đặt tên phòng (ít nhất 2 ký tự).", 400)
    topic = _clean(body.get("topic"), 80)
    lang = _clean(body.get("lang"), 8) or "ko"
    level = norm_level(body.get("level"))
    try:
        size = int(body.get("max") or MAX_SIZE)
    except (TypeError, ValueError):
        size = MAX_SIZE
    size = max(MIN_SIZE, min(MAX_SIZE, size))
    mode = "private" if body.get("mode") == "private" else "public"
    password = (body.get("password") or "").strip()
    if mode == "private" and password and len(password) < 4:
        raise AppError("ROOM_PASS", "Mật khẩu phòng cần ít nhất 4 ký tự.", 400)
    if mode == "public":
        password = ""

    conn = db.get_conn()
    try:
        _sweep(conn)
        old = _my_room(conn, user["id"])
        if old:
            _leave(conn, old, user["id"])
        code = _code()
        while conn.execute("SELECT 1 FROM speak_rooms WHERE id = ?", (code,)).fetchone():
            code = _code()
        conn.execute(
            "INSERT INTO speak_rooms (id, name, topic, lang, level, mode, pass_hash, invite, host_id, max_size) "
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
            (
                code, name, topic, lang, level, mode,
                _hash(password) if password else None,
                _code(14), user["id"], size,
            ),
        )
        conn.execute(
            "INSERT INTO speak_room_members (room_id, user_id) VALUES (?,?)", (code, user["id"])
        )
        _system(conn, code, user["id"], "joined")
        conn.commit()
        return state(user, code)
    finally:
        conn.close()


def join(user: dict, room_id: str, password: str = "", invite: str = "") -> dict:
    room_id = (room_id or "").strip().upper()
    conn = db.get_conn()
    try:
        _sweep(conn)
        row = _room(conn, room_id)
        already = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        ).fetchone()
        if not already:
            if _size(conn, room_id) >= row["max_size"]:
                raise AppError("ROOM_FULL", f"Phòng đã đủ {row['max_size']} người.", 400)
            if row["mode"] == "private":
                by_link = bool(invite) and secrets.compare_digest(invite, row["invite"])
                if not by_link:
                    if not row["pass_hash"]:
                        raise AppError("ROOM_PRIVATE", "Phòng riêng tư — bạn cần link mời từ chủ phòng.", 403)
                    if not _check_pass(password, row["pass_hash"]):
                        raise AppError("ROOM_PASSWORD", "Mật khẩu phòng không đúng.", 403)
            old = _my_room(conn, user["id"])
            if old and old != room_id:
                _leave(conn, old, user["id"])
            conn.execute(
                "INSERT INTO speak_room_members (room_id, user_id) VALUES (?,?)", (room_id, user["id"])
            )
            _system(conn, room_id, user["id"], "joined")
        conn.commit()
    finally:
        conn.close()
    return state(user, room_id)


def leave(user: dict, room_id: str) -> dict:
    conn = db.get_conn()
    try:
        _leave(conn, (room_id or "").strip().upper(), user["id"])
        conn.execute("DELETE FROM speak_queue WHERE user_id = ?", (user["id"],))
        conn.commit()
        _sweep(conn)
        return {"ok": True}
    finally:
        conn.close()


def state(user: dict, room_id: str, after: int = 0) -> dict:
    room_id = (room_id or "").strip().upper()
    conn = db.get_conn()
    try:
        row = _room(conn, room_id)
        mine = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        ).fetchone()
        if not mine:
            raise AppError("ROOM_OUTSIDE", "Bạn không còn ở trong phòng này.", 403)
        conn.execute(
            "UPDATE speak_room_members SET seen_at = datetime('now','localtime') "
            "WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        )
        conn.commit()
        _prune_room(conn, room_id)
        row = _room(conn, room_id)
        card = _card(conn, row)
        card["invite"] = row["invite"]
        card["isHost"] = row["host_id"] == user["id"]
        return {"room": card, "members": _members(conn, room_id), "messages": _msgs(conn, room_id, after)}
    finally:
        conn.close()


def say(user: dict, room_id: str, text: str = "", audio: str = "", after: int = 0) -> dict:
    room_id = (room_id or "").strip().upper()
    text = _clean(text, MAX_TEXT)
    audio = (audio or "").strip()
    if audio and (not audio.startswith("data:audio/") or len(audio) > MAX_AUDIO_CHARS):
        audio = ""
    if not text and not audio:
        raise AppError("ROOM_EMPTY", "Chưa có nội dung để gửi.", 400)
    conn = db.get_conn()
    try:
        _room(conn, room_id)
        mine = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        ).fetchone()
        if not mine:
            raise AppError("ROOM_OUTSIDE", "Bạn không còn ở trong phòng này.", 403)
        conn.execute(
            "INSERT INTO speak_room_msgs (room_id, user_id, kind, text, audio) VALUES (?,?,?,?,?)",
            (room_id, user["id"], "voice" if audio else "text", text, audio or None),
        )
        _trim(conn, room_id)
        conn.commit()
    finally:
        conn.close()
    return state(user, room_id, after)


def clip(user: dict, room_id: str, msg_id: int) -> dict:
    room_id = (room_id or "").strip().upper()
    conn = db.get_conn()
    try:
        mine = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        ).fetchone()
        if not mine:
            raise AppError("ROOM_OUTSIDE", "Bạn không còn ở trong phòng này.", 403)
        row = conn.execute(
            "SELECT audio FROM speak_room_msgs WHERE id = ? AND room_id = ?", (msg_id, room_id)
        ).fetchone()
        if not row or not row["audio"]:
            raise AppError("ROOM_CLIP", "Đoạn ghi âm không còn nữa.", 404)
        return {"audio": row["audio"]}
    finally:
        conn.close()


def ice_servers() -> dict:
    cfg = config.settings.get("webrtc") or {}
    urls = [u for u in (cfg.get("stun_urls") or []) if isinstance(u, str) and u.strip()]
    servers: list[dict] = [{"urls": urls}] if urls else []
    turn = (cfg.get("turn_url") or "").strip()
    if turn:
        servers.append({
            "urls": turn,
            "username": cfg.get("turn_user") or "",
            "credential": cfg.get("turn_password") or "",
        })
    return {"iceServers": servers, "relay": bool(turn)}


def _must_be_member(conn, room_id: str, user_id: str) -> None:
    if not conn.execute(
        "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?", (room_id, user_id)
    ).fetchone():
        raise AppError("ROOM_OUTSIDE", "Bạn không còn ở trong phòng này.", 403)


def signal_send(user: dict, room_id: str, to_id: str, kind: str, payload: str) -> dict:
    room_id = (room_id or "").strip().upper()
    to_id = (to_id or "").strip()
    if kind not in SIGNAL_KINDS:
        raise AppError("ROOM_SIGNAL", "Loại tín hiệu không hợp lệ.", 400)
    payload = (payload or "").strip()
    if not payload or len(payload) > MAX_SIGNAL_CHARS:
        raise AppError("ROOM_SIGNAL", "Nội dung tín hiệu không hợp lệ.", 400)

    conn = db.get_conn()
    try:
        _must_be_member(conn, room_id, user["id"])
        _must_be_member(conn, room_id, to_id)
        conn.execute(
            "INSERT INTO speak_signals (room_id, from_id, to_id, kind, payload) VALUES (?,?,?,?,?)",
            (room_id, user["id"], to_id, kind, payload),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def signal_fetch(user: dict, room_id: str, after: int = 0) -> dict:
    room_id = (room_id or "").strip().upper()
    conn = db.get_conn()
    try:
        _must_be_member(conn, room_id, user["id"])
        conn.execute(
            "UPDATE speak_room_members SET seen_at = datetime('now','localtime') "
            "WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        )
        rows = conn.execute(
            "SELECT id, from_id, kind, payload FROM speak_signals "
            "WHERE room_id = ? AND to_id = ? AND id > ? ORDER BY id LIMIT ?",
            (room_id, user["id"], after, MAX_SIGNALS_READ),
        ).fetchall()
        conn.execute(
            "DELETE FROM speak_signals WHERE to_id = ? AND room_id = ? AND id <= ?",
            (user["id"], room_id, rows[-1]["id"] if rows else after),
        )
        conn.commit()
        return {
            "signals": [
                {"id": r["id"], "from": r["from_id"], "kind": r["kind"], "payload": r["payload"]}
                for r in rows
            ],
        }
    finally:
        conn.close()


def _topic_ids(raw) -> list[str]:
    items = raw if isinstance(raw, list) else str(raw or "").split(",")
    out: list[str] = []
    for it in items:
        key = str(it or "").strip()
        if key in MATCH_TOPICS and key not in out:
            out.append(key)
    return out[:MAX_TOPICS]


def _topic_text(ids: list[str]) -> str:
    return ", ".join(MATCH_TOPICS[i] for i in ids)


def _levels_ok(mine: str, theirs: str, both_wide: bool) -> bool:
    if mine == theirs:
        return True
    return both_wide and theirs in _neighbours(mine)


def _pool(conn, user_id: str, lang: str, level: str, wide: bool) -> int:
    rows = conn.execute(
        "SELECT level, wide FROM speak_queue WHERE lang = ? AND room_id IS NULL AND user_id <> ?",
        (lang, user_id),
    ).fetchall()
    return sum(1 for r in rows if _levels_ok(level, r["level"], wide and bool(r["wide"])))


def _waiting(conn, user_id: str, lang: str, level: str, wide: bool) -> dict:
    return {"matched": False, "pool": _pool(conn, user_id, lang, level, wide), "state": None}


def _pair_up(conn, user: dict, lang: str, level: str, wide: bool, topics: list[str]) -> str | None:
    rows = conn.execute(
        "SELECT user_id, level, topics, wide FROM speak_queue "
        "WHERE lang = ? AND room_id IS NULL AND user_id <> ? ORDER BY joined_at",
        (lang, user["id"]),
    ).fetchall()
    mine = set(topics)
    best = None
    best_key: tuple[int, int] | None = None
    for r in rows:
        if not _levels_ok(level, r["level"], wide and bool(r["wide"])):
            continue
        key = (0 if r["level"] == level else 1, -len(mine & set(_topic_ids(r["topics"]))))
        if best_key is None or key < best_key:
            best_key, best = key, r
    if best is None:
        return None

    code = _code()
    while conn.execute("SELECT 1 FROM speak_rooms WHERE id = ?", (code,)).fetchone():
        code = _code()
    taken = conn.execute(
        "UPDATE speak_queue SET room_id = ? WHERE user_id = ? AND room_id IS NULL",
        (code, best["user_id"]),
    ).rowcount
    if not taken:
        return None

    shared = [i for i in topics if i in set(_topic_ids(best["topics"]))]
    conn.execute(
        "INSERT INTO speak_rooms (id, name, topic, lang, level, mode, pass_hash, invite, host_id, max_size) "
        "VALUES (?,?,?,?,?,?,?,?,?,?)",
        (
            code, "Ghép cặp 1-1", _topic_text(shared or topics), lang, level,
            "private", None, _code(14), user["id"], PAIR_SIZE,
        ),
    )
    for uid in (best["user_id"], user["id"]):
        conn.execute("INSERT INTO speak_room_members (room_id, user_id) VALUES (?,?)", (code, uid))
        _system(conn, code, uid, "joined")
    conn.execute("UPDATE speak_queue SET room_id = ? WHERE user_id = ?", (code, user["id"]))
    return code


def match_start(user: dict, body: dict) -> dict:
    lang = _clean(body.get("lang"), 8) or "ko"
    level = norm_level(body.get("level"))
    wide = bool(body.get("wide"))
    topics = _topic_ids(body.get("topics"))

    conn = db.get_conn()
    try:
        _sweep(conn)
        old = _my_room(conn, user["id"])
        if old:
            _leave(conn, old, user["id"])
        conn.execute(
            "INSERT INTO speak_queue (user_id, lang, level, topics, wide, room_id, joined_at, seen_at) "
            "VALUES (?,?,?,?,?,NULL,datetime('now','localtime'),datetime('now','localtime')) "
            "ON CONFLICT(user_id) DO UPDATE SET lang = excluded.lang, level = excluded.level, "
            "topics = excluded.topics, wide = excluded.wide, room_id = NULL, "
            "seen_at = datetime('now','localtime')",
            (user["id"], lang, level, ",".join(topics), 1 if wide else 0),
        )
        code = _pair_up(conn, user, lang, level, wide, topics)
        conn.commit()
        if code:
            return {"matched": True, "pool": 0, "state": state(user, code)}
        return _waiting(conn, user["id"], lang, level, wide)
    finally:
        conn.close()


def match_poll(user: dict) -> dict:
    conn = db.get_conn()
    try:
        _sweep(conn)
        row = conn.execute(
            "SELECT lang, level, topics, wide, room_id FROM speak_queue WHERE user_id = ?",
            (user["id"],),
        ).fetchone()
        if not row:
            return {"matched": False, "pool": 0, "state": None, "queued": False}

        conn.execute(
            "UPDATE speak_queue SET seen_at = datetime('now','localtime') WHERE user_id = ?",
            (user["id"],),
        )
        lang, level, wide = row["lang"], row["level"], bool(row["wide"])
        code = row["room_id"]
        if code:
            member = conn.execute(
                "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
                (code, user["id"]),
            ).fetchone()
            if not member:
                conn.execute("DELETE FROM speak_queue WHERE user_id = ?", (user["id"],))
                conn.commit()
                return {"matched": False, "pool": 0, "state": None, "queued": False}
            conn.commit()
            return {"matched": True, "pool": 0, "state": state(user, code), "queued": True}

        code = _pair_up(conn, user, lang, level, wide, _topic_ids(row["topics"]))
        conn.commit()
        if code:
            return {"matched": True, "pool": 0, "state": state(user, code), "queued": True}
        out = _waiting(conn, user["id"], lang, level, wide)
        out["queued"] = True
        return out
    finally:
        conn.close()


def match_cancel(user: dict) -> dict:
    conn = db.get_conn()
    try:
        conn.execute("DELETE FROM speak_queue WHERE user_id = ?", (user["id"],))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


_PROMPT_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"ko": {"type": "string"}, "vi": {"type": "string"}},
                "required": ["ko", "vi"],
            },
        }
    },
    "required": ["questions"],
}

_LEVEL_TEXT = {
    "a1": "A1 (câu rất ngắn, từ vựng cơ bản nhất, nói về bản thân)",
    "a2": "A2 (câu ngắn về việc quen thuộc: gia đình, mua sắm, chỗ làm)",
    "b1": "B1 (kể lại trải nghiệm, nêu lý do và dự định bằng câu dài vừa)",
    "b2": "B2 (bàn luận trôi chảy, nêu quan điểm có lập luận)",
    "c1": "C1 (diễn đạt linh hoạt, dùng thành ngữ, ý sâu)",
    "c2": "C2 (gần như người bản xứ, sắc thái tinh tế)",
}


def topic_prompt(user: dict, room_id: str, native: str = "vi", after: int = 0) -> dict:
    room_id = (room_id or "").strip().upper()
    conn = db.get_conn()
    try:
        row = _room(conn, room_id)
        mine = conn.execute(
            "SELECT 1 FROM speak_room_members WHERE room_id = ? AND user_id = ?",
            (room_id, user["id"]),
        ).fetchone()
        if not mine:
            raise AppError("ROOM_OUTSIDE", "Bạn không còn ở trong phòng này.", 403)
        lang, level, topic, name = row["lang"], row["level"], row["topic"], row["name"]
        size = row["max_size"]
    finally:
        conn.close()

    lname = study_name(lang)
    nname = native_name(native)
    prompt = (
        f"Nhóm {size} người đang luyện nói {lname} cùng nhau trong phòng \"{name}\".\n"
        f"Chủ đề: {topic or 'trò chuyện đời thường'}\n"
        f"Trình độ: {_LEVEL_TEXT[norm_level(level)]}\n\n"
        f"Hãy đặt 3 câu hỏi gợi chuyện bằng {lname} để cả nhóm thay phiên trả lời. "
        f"Câu hỏi mở, dễ nói thành 2-3 câu, hợp trình độ trên. "
        f"Trường 'ko' là câu hỏi {lname}, trường 'vi' là bản dịch sang {nname}."
    )
    try:
        data = llm.gemini_json(prompt, _PROMPT_SCHEMA, temperature=0.9)
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    questions = [
        {"ko": _clean(q.get("ko"), 160), "vi": _clean(q.get("vi"), 200)}
        for q in (data.get("questions") or [])[:3]
    ]
    if not questions:
        raise AppError("UPSTREAM_AI", "AI chưa gợi được câu hỏi nào, thử lại nhé.", 502)

    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO speak_room_msgs (room_id, user_id, kind, text) VALUES (?,?,?,?)",
            (room_id, user["id"], "prompt", json.dumps(questions, ensure_ascii=False)),
        )
        _trim(conn, room_id)
        conn.commit()
    finally:
        conn.close()
    return state(user, room_id, after)
