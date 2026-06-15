from __future__ import annotations

from fastapi import APIRouter, Query

from ..services import dictionary

router = APIRouter()

@router.get("/api/define")
def api_define(word: str = Query(..., min_length=1, max_length=40)):
    return dictionary.lookup(word)
