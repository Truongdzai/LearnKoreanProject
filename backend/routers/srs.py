from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services import srs

router = APIRouter()

class AddIn(BaseModel):
    front: str
    back: str = ""
    source: str = ""

class ReviewIn(BaseModel):
    card_id: int
    rating: int

@router.post("/api/srs/add")
def api_add(body: AddIn):
    front = body.front.strip()
    if not front:
        raise HTTPException(status_code=400, detail="Thiếu nội dung thẻ.")
    return srs.add_card(front, body.back.strip(), body.source.strip())

@router.get("/api/srs/due")
def api_due():
    cards = srs.due_cards()
    return {"cards": cards, **srs.stats()}

@router.post("/api/srs/review")
def api_review(body: ReviewIn):
    if body.rating not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Điểm chấm phải là 1..4.")
    try:
        return srs.review(body.card_id, body.rating)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/api/srs/stats")
def api_stats():
    return srs.stats()
