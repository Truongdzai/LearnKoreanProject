from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

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


MAX_FRONT = 200
MAX_BACK = 500
MAX_SOURCE = 80


class AddIn(BaseModel):
    front: str = Field(max_length=MAX_FRONT)
    back: str = Field(default="", max_length=MAX_BACK)
    source: str = Field(default="", max_length=MAX_SOURCE)
    lang: str = Field(default="", max_length=8)

class EditIn(BaseModel):
    front: str = Field(max_length=MAX_FRONT)
    back: str = Field(default="", max_length=MAX_BACK)
    source: str = Field(default="", max_length=MAX_SOURCE)

class DeckIn(BaseModel):
    source: str = Field(default="", max_length=MAX_SOURCE)
    lang: str = Field(default="", max_length=8)

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

@router.delete("/card/{card_id}")
def api_delete(card_id: int, user: dict | None = Depends(auth.get_optional_user)):
    try:
        return srs.delete_card(card_id, _require(user))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.put("/card/{card_id}")
def api_edit(card_id: int, body: EditIn, user: dict | None = Depends(auth.get_optional_user)):
    front = body.front.strip()
    if not front:
        raise HTTPException(status_code=400, detail="Mặt trước của thẻ không được để trống.")
    try:
        return srs.update_card(card_id, front, body.back.strip(), body.source.strip(), _require(user))
    except ValueError as exc:
        raise AppError("SRS_EDIT", str(exc), 400)


@router.post("/deck/delete")
def api_delete_deck(body: DeckIn, user: dict | None = Depends(auth.get_optional_user)):
    return srs.delete_deck(body.source.strip(), _require(user), body.lang.strip())


@router.get("/stats")
def api_stats(lang: str = "", user: dict | None = Depends(auth.get_optional_user)):
    uid = _uid(user)
    return srs.stats(uid, lang) if uid else dict(EMPTY_STATS)
