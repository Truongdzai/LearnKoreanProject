from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings
from .. import db
from ..schemas.learn import TranscriptIn, MineIn
from ..services import youtube, translate, ankiconnect, cache, jobs

router = APIRouter()

def _attach_speakers(lesson: dict) -> dict:
    spk = cache.get_speakers(lesson.get("id", ""))
    if spk and len(spk["speakers"]) == len(lesson["segments"]):
        for seg, s in zip(lesson["segments"], spk["speakers"]):
            seg["speaker"] = s
    return lesson

@router.post("/api/transcript")
def api_transcript(body: TranscriptIn):
    vid = youtube.extract_id(body.url)

    # Serve from cache → cheap, instant, no YouTube/AI hit (handles many users).
    if vid:
        cached = cache.get_lesson(vid)
        if cached and cached["segments"]:
            return _attach_speakers(cached)

    # Cache miss: fetch+translate is heavy → limit concurrency so a burst can't crash us.
    try:
        with jobs.heavy_slot(timeout=45.0):
            try:
                data = youtube.get_korean_segments(body.url)
            except Exception as exc:
                raise HTTPException(status_code=400, detail=str(exc))
            if not data["segments"]:
                raise HTTPException(status_code=400, detail="Không tìm thấy nội dung phụ đề.")
            try:
                translate.translate_segments(data["segments"])
            except Exception:
                for seg in data["segments"]:
                    seg.setdefault("vi", "")
            if data.get("id"):
                cache.save_lesson(data)
            return _attach_speakers(data)
    except jobs.Busy:
        raise HTTPException(status_code=503, detail="Máy chủ đang bận xử lý video khác, vui lòng thử lại sau giây lát.")

@router.post("/api/mine")
def api_mine(body: MineIn):
    cfg = settings["anki"]
    try:
        ankiconnect.ensure_deck(cfg["url"], cfg["deck"])
        ankiconnect.ensure_model(cfg["url"])
        fields = {"Korean": body.ko, "Vietnamese": body.vi, "Source": body.source}
        anki_id = ankiconnect.add_note(cfg["url"], cfg["deck"], ankiconnect.HANQUAN_MODEL, fields)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    conn = db.get_conn()
    try:
        conn.execute(
            "INSERT INTO mined_cards (source, korean, vietnamese, anki_id) VALUES (?,?,?,?)",
            (body.source, body.ko, body.vi, anki_id),
        )
        conn.commit()
    finally:
        conn.close()
    return {"ok": True, "anki_id": anki_id}
