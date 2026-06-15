from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings
from .. import db
from ..schemas.learn import TranscriptIn, MineIn
from ..services import youtube, translate, ankiconnect

router = APIRouter()

@router.post("/api/transcript")
def api_transcript(body: TranscriptIn):
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
    return data

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
