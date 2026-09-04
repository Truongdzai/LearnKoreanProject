from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from ..errors import AppError
from ..services import auth, tutor, cache, quota

router = APIRouter(prefix="/api/tutor", tags=["Gia sư AI"])
OptAuth = Depends(auth.get_optional_user)
Auth = Depends(auth.get_current_user)


MAX_MESSAGE = 1200
MAX_TURN = 900
MAX_TURNS = 20
MAX_VIDEOS = 60


class TutorTurn(BaseModel):
    role: str = Field(default="bot", max_length=8)
    text: str = Field(default="", max_length=MAX_TURN)


class TutorIn(BaseModel):
    message: str = Field(default="", max_length=MAX_MESSAGE)
    history: list[TutorTurn] = Field(default_factory=list, max_length=MAX_TURNS)
    lang: str = Field(default="ko", max_length=8)
    native: str = Field(default="vi", max_length=8)


class FitIn(BaseModel):
    video_ids: list[str] = Field(default_factory=list, max_length=MAX_VIDEOS)
    lang: str = Field(default="ko", max_length=8)


@router.get("/profile")
def api_tutor_profile(request: Request, lang: str = "ko", user: dict | None = OptAuth):
    data = tutor.profile(user, lang)
    data["quota"] = quota.status(user, quota.client_ip(request))
    return data


@router.post("/chat")
def api_tutor_chat(body: TutorIn, request: Request, user: dict | None = OptAuth):
    if not body.message.strip():
        raise AppError("INVALID_INPUT", "Hãy nhập câu hỏi cho gia sư.", 400)
    left = quota.consume("tutor", user, quota.client_ip(request))
    try:
        out = tutor.chat(body, user)
        out["quota"] = left
        return out
    except AppError:
        raise
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"Gia sư chưa trả lời được: {exc}", 502)


@router.post("/fit")
def api_tutor_fit(body: FitIn, user: dict = Auth):
    known = tutor.known_words(user["id"], body.lang)
    out: dict[str, dict] = {}
    for vid in body.video_ids[:MAX_VIDEOS]:
        lesson = cache.get_lesson(vid)
        if not lesson or not lesson.get("segments"):
            continue
        text = " ".join(seg.get("ko") or seg.get("text") or "" for seg in lesson["segments"])
        out[vid] = tutor.fit_score(text, known, body.lang)
    return {"fit": out, "known": len(known)}
