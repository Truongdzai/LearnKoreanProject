from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, Field

from ..services import auth, dictionary, pinyin, quota

router = APIRouter(prefix="/api/define", tags=["Từ điển"])
OptAuth = Depends(auth.get_optional_user)

@router.get("")
def api_define(word: str = Query(..., min_length=1, max_length=40)):
    return dictionary.lookup(word)

@router.get("/rich")
def api_define_rich(
    request: Request,
    word: str = Query(..., min_length=1, max_length=40),
    lang: str = Query("ko", max_length=5),
    native: str = Query("vi", max_length=5),
    user: dict | None = OptAuth,
):
    if not dictionary.has_rich_cache(word, lang, native):
        quota.consume("define", user, quota.client_ip(request))
    return dictionary.lookup_rich(word, lang, native)


class PinyinIn(BaseModel):
    words: list[str] = Field(default_factory=list, max_length=400)


@router.post("/pinyin", tags=["Từ điển"])
def api_pinyin(body: PinyinIn):
    return {"readings": pinyin.readings(body.words)}
