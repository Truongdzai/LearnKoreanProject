from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..errors import AppError
from ..services import srs, auth

router = APIRouter(prefix="/api/srs", tags=["Ôn tập SRS"])


EMPTY_STATS = {"total": 0, "due": 0, "new": 0, "learned": 0, "reviewed_today": 0}


def _uid(user: dict | None) -> str:
    return user["id"] if user else ""


def _require(user: dict | None) -> str:
    if not user:
        raise AppError(
            "SIGNUP_REQUIRED",
            "Hãy đăng ký miễn phí để lưu thẻ vào tài khoản và ôn đúng lịch.",
            401,
        )
    return user["id"]


class AddIn(BaseModel):
    front: str
    back: str = ""
    source: str = ""
    lang: str = ""

class ReviewIn(BaseModel):
    card_id: int
    rating: int

@router.post("/add")
def api_add(body: AddIn, user: dict | None = Depends(auth.get_optional_user)):
    front = body.front.strip()
    if not front:
        raise HTTPException(status_code=400, detail="Thiếu nội dung thẻ.")
    return srs.add_card(front, body.back.strip(), body.source.strip(), _require(user), body.lang.strip())

@router.get("/due")
def api_due(lang: str = "", user: dict | None = Depends(auth.get_optional_user)):
    uid = _uid(user)
    if not uid:
        return {"cards": [], **EMPTY_STATS}
    cards = srs.due_cards(uid, lang=lang)
    return {"cards": cards, **srs.stats(uid, lang)}

@router.get("/all")
def api_all(lang: str = "", user: dict | None = Depends(auth.get_optional_user)):
    uid = _uid(user)
    if not uid:
        return {"cards": [], "byLang": {}}
    return {"cards": srs.all_cards(uid, lang=lang), "byLang": srs.lang_counts(uid)}

@router.post("/review")
def api_review(body: ReviewIn, user: dict | None = Depends(auth.get_optional_user)):
    if body.rating not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Điểm chấm phải là 1..4.")
    try:
        return srs.review(body.card_id, body.rating, _require(user))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/stats")
def api_stats(lang: str = "", user: dict | None = Depends(auth.get_optional_user)):
    uid = _uid(user)
    return srs.stats(uid, lang) if uid else dict(EMPTY_STATS)
