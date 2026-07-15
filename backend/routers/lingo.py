from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..services import lingo, diarize, voice_diarize, cache, jobs, auth, accounts

router = APIRouter(prefix="/api")

def _require_plus(user: dict | None) -> None:
    if not user or not (accounts.plus_active(user) or user.get("role") == "admin"):
        raise HTTPException(
            status_code=403,
            detail="Tự động nhận diện người nói là tính năng Plus. Bạn vẫn có thể gán nhân vật thủ công bằng nút A/B.",
        )

@router.get("/lingo")
def api_lingo(refresh: bool = Query(False)):
    return lingo.get(refresh=refresh)

def _to_starts(raw, limit=600) -> list[float]:
    out: list[float] = []
    for x in (raw or [])[:limit]:
        try:
            out.append(float(x))
        except (TypeError, ValueError):
            out.append(0.0)
    return out

@router.post("/speakers")
def api_speakers(body: dict, user: dict | None = Depends(auth.get_optional_user)):
    _require_plus(user)
    lines = [str(x) for x in (body.get("lines") or [])][:600]
    starts = _to_starts(body.get("starts"))
    video_id = str(body.get("id") or "").strip()

    if video_id:
        cached = cache.get_speakers(video_id)
        if cached and len(cached["speakers"]) == len(lines):
            return cached

    result = diarize.label_speakers(lines, starts or None)
    if video_id and result.get("source") == "ai":
        cache.save_speakers(video_id, result)
    return result

@router.post("/diarize/voice")
def api_diarize_voice(body: dict, user: dict | None = Depends(auth.get_optional_user)):
    _require_plus(user)
    video_id = str(body.get("id") or "").strip()
    starts = _to_starts(body.get("starts"))
    if not video_id or not starts:
        raise HTTPException(status_code=400, detail="Thiếu mã video hoặc mốc thời gian.")

    cached = cache.get_speakers(video_id)
    if cached and cached.get("source") == "voice" and len(cached["speakers"]) == len(starts):
        return cached

    ok, msg = voice_diarize.available()
    if not ok:
        raise HTTPException(status_code=503, detail=msg)
    try:
        with jobs.heavy_slot(timeout=5.0):
            result = voice_diarize.diarize(video_id, starts)
        cache.save_speakers(video_id, result)
        return result
    except jobs.Busy:
        raise HTTPException(status_code=503, detail="Máy chủ đang bận phân tích giọng cho video khác, vui lòng thử lại sau ít phút.")
    except Exception as exc:
        low = str(exc).lower()
        if "not a bot" in low or "sign in to confirm" in low:
            raise HTTPException(status_code=400, detail=(
                "YouTube đang chặn tải âm thanh trên máy này (xác minh bot). "
                "Hãy đợi 30–60 phút rồi thử lại, hoặc dùng nút nhận diện AI ở trên."
            ))
        if "429" in low or "too many requests" in low:
            raise HTTPException(status_code=400, detail="YouTube tạm giới hạn (429). Hãy đợi vài phút rồi thử lại.")
        raise HTTPException(status_code=400, detail=f"Không phân tích được giọng: {exc}")
