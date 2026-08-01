from __future__ import annotations

from fastapi import APIRouter, Depends

from ..services import catalog, accounts, auth

router = APIRouter(prefix="/api/content", tags=["Catalog công khai"])


@router.get("/videos")
def api_videos(lang: str = ""):
    vids = catalog.videos()
    if lang:
        vids = [v for v in vids if v["lang"] == lang]
    return {"videos": vids}


@router.get("/quests")
def api_quests():
    return {"quests": catalog.quests()}


@router.get("/shop")
def api_shop():
    return {"shop": catalog.shop()}


@router.get("/plans")
def api_plans():
    return {"plans": catalog.plans(), "perks": catalog.DEFAULT_PERKS}


@router.get("/leaderboard")
def api_leaderboard(scope: str = "all", user: dict | None = Depends(auth.get_optional_user)):
    return {"entries": accounts.leaderboard(user["id"] if user else None, scope=scope)}
