from __future__ import annotations

from fastapi import APIRouter, Query

from ..services import dictionary

router = APIRouter(prefix="/api/define", tags=["Từ điển"])

@router.get("")
def api_define(word: str = Query(..., min_length=1, max_length=40)):
    return dictionary.lookup(word)

@router.get("/rich")
def api_define_rich(
    word: str = Query(..., min_length=1, max_length=40),
    lang: str = Query("ko", max_length=5),
    native: str = Query("vi", max_length=5),
):
    return dictionary.lookup_rich(word, lang, native)
