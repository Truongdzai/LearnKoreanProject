from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse

from ..errors import AppError
from ..schemas.english import CoachIn
from ..services import auth, dictionary, encoach, quota, wordimg, wordprofile

router = APIRouter(prefix="/api/en", tags=["Tiếng Anh chủ động"])
OptAuth = Depends(auth.get_optional_user)

MAX_SAY = 1200


@router.post("/coach")
def api_en_coach(body: CoachIn, request: Request, user: dict | None = OptAuth):
    say = (body.say or "").strip()
    if not say:
        raise AppError("BAD_INPUT", "Bạn chưa nói hoặc viết gì để chấm.", 400)
    if len(say) > MAX_SAY:
        raise AppError("BAD_INPUT", f"Bài dài quá {MAX_SAY} ký tự, hãy rút ngắn lại.", 400)

    quota.consume("encoach", user, quota.client_ip(request))
    body.say = say
    try:
        return encoach.coach(body)
    except AppError:
        raise
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không chấm được lúc này: {exc}", 502)


@router.get("/image/file/{name}")
def api_en_image_file(name: str):
    path = wordimg.file_path(name)
    if not path:
        raise AppError("NOT_FOUND", "Không có ảnh này.", 404)
    return FileResponse(
        str(path),
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.get("/image")
def api_en_image(
    word: str = Query(..., min_length=1, max_length=40),
    q: str = Query("", max_length=60),
    only_cached: bool = Query(False),
):
    if only_cached:
        return {"word": word.lower(), "image": wordimg.cached_only(word, q), "cached": True}
    return wordimg.lookup(word, q)


@router.get("/ready")
def api_en_ready(word: str = Query(..., min_length=1, max_length=40), q: str = Query("", max_length=60)):
    return {
        "word": word.lower(),
        "rich": dictionary.has_rich_cache(word, "en", "vi"),
        "image": wordimg.cached_only(word, q) is not None,
        "profile": wordprofile.has_cache(word),
    }


@router.get("/profile")
def api_en_profile(
    request: Request,
    word: str = Query(..., min_length=1, max_length=40),
    pos: str = Query("", max_length=20),
    vi: str = Query("", max_length=120),
    only_cached: bool = Query(False),
    user: dict | None = OptAuth,
):
    if only_cached:
        return {"word": word.strip().lower(), "profile": wordprofile.cached_only(word), "cached": True}
    if not wordprofile.has_cache(word):
        quota.consume("profile", user, quota.client_ip(request))
    try:
        return wordprofile.get(word, pos, vi)
    except AppError:
        raise
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"Chưa dựng được hồ sơ từ lúc này: {exc}", 502)
