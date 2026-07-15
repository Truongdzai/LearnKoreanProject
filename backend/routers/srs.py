from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..services import srs, auth

router = APIRouter(prefix="/api/srs", tags=["Ôn tập SRS"])


def _uid(user: dict | None) -> str:
    return user["id"] if user else "local"


class AddIn(BaseModel):
    front: str
    back: str = ""
    source: str = ""

class ReviewIn(BaseModel):
    card_id: int
    rating: int

@router.post("/add")
def api_add(body: AddIn, user: dict | None = Depends(auth.get_optional_user)):
    front = body.front.strip()
    if not front:
        raise HTTPException(status_code=400, detail="Thiếu nội dung thẻ.")
    return srs.add_card(front, body.back.strip(), body.source.strip(), _uid(user))

@router.get("/due")
def api_due(user: dict | None = Depends(auth.get_optional_user)):
    uid = _uid(user)
    cards = srs.due_cards(uid)
    return {"cards": cards, **srs.stats(uid)}

@router.get("/all")
def api_all(user: dict | None = Depends(auth.get_optional_user)):
    return {"cards": srs.all_cards(_uid(user))}

@router.post("/review")
def api_review(body: ReviewIn, user: dict | None = Depends(auth.get_optional_user)):
    if body.rating not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Điểm chấm phải là 1..4.")
    try:
        return srs.review(body.card_id, body.rating, _uid(user))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/stats")
def api_stats(user: dict | None = Depends(auth.get_optional_user)):
    return srs.stats(_uid(user))
