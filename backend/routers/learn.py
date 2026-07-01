from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.learn import TranscriptIn
from ..services import youtube, translate, cache, jobs

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
                data = youtube.get_segments(body.url, body.lang)
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
