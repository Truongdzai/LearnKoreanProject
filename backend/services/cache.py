from __future__ import annotations

import json

from .. import db


def get_lesson(video_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT * FROM lesson_cache WHERE video_id = ?", (video_id,)).fetchone()
    finally:
        conn.close()
    if not r:
        return None
    try:
        data = json.loads(r["data"])
    except Exception:
        return None
    return {
        "id": video_id,
        "title": r["title"],
        "channel": r["channel"],
        "source": r["source"],
        "segments": data.get("segments", []),
    }

def save_lesson(lesson: dict) -> None:
    vid = lesson.get("id")
    if not vid:
        return
    payload = json.dumps({"segments": lesson.get("segments", [])}, ensure_ascii=False)
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO lesson_cache (video_id, title, channel, source, data) VALUES (?,?,?,?,?) "
            "ON CONFLICT(video_id) DO UPDATE SET title=excluded.title, channel=excluded.channel, "
            "source=excluded.source, data=excluded.data",
            (vid, lesson.get("title"), lesson.get("channel"), lesson.get("source"), payload),
        )
        conn.commit()
    finally:
        conn.close()


def get_dict(word: str) -> dict | None:
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT data FROM dict_cache WHERE word = ?", (word,)).fetchone()
    finally:
        conn.close()
    if not r:
        return None
    try:
        return json.loads(r["data"])
    except Exception:
        return None

def save_dict(word: str, data: dict) -> None:
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO dict_cache (word, data) VALUES (?,?) "
            "ON CONFLICT(word) DO UPDATE SET data=excluded.data",
            (word, json.dumps(data, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()


def get_speakers(video_id: str) -> dict | None:
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT * FROM speaker_cache WHERE video_id = ?", (video_id,)).fetchone()
    finally:
        conn.close()
    if not r:
        return None
    try:
        return {
            "speakers": json.loads(r["speakers"]),
            "names": json.loads(r["names"]) if r["names"] else [],
            "source": r["source"],
        }
    except Exception:
        return None

def save_speakers(video_id: str, result: dict) -> None:
    if not video_id:
        return
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO speaker_cache (video_id, speakers, names, source) VALUES (?,?,?,?) "
            "ON CONFLICT(video_id) DO UPDATE SET speakers=excluded.speakers, names=excluded.names, "
            "source=excluded.source, updated_at=datetime('now','localtime')",
            (
                video_id,
                json.dumps(result.get("speakers", []), ensure_ascii=False),
                json.dumps(result.get("names", []), ensure_ascii=False),
                result.get("source", ""),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_pronounce(sig: str) -> dict | None:
    if not sig:
        return None
    conn = db.get_conn()
    try:
        r = conn.execute("SELECT payload FROM pronounce_cache WHERE sig = ?", (sig,)).fetchone()
        if not r:
            return None
        conn.execute("UPDATE pronounce_cache SET hits = hits + 1 WHERE sig = ?", (sig,))
        conn.commit()
        return json.loads(r["payload"])
    except Exception:
        return None
    finally:
        conn.close()


def put_pronounce(sig: str, payload: dict) -> None:
    if not sig or not payload.get("feedback"):
        return
    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO pronounce_cache (sig, payload) VALUES (?,?)",
            (sig, json.dumps(payload, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()
