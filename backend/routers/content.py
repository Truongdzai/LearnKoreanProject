from __future__ import annotations

from fastapi import APIRouter, Depends

from ..services import catalog, accounts, auth

router = APIRouter(prefix="/api/content")


@router.get("/videos")
def api_videos():
    return {"videos": catalog.videos()}


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
def api_leaderboard(user: dict | None = Depends(auth.get_optional_user)):
    return {"entries": accounts.leaderboard(user["id"] if user else None)}
