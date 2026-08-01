from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..services import auth, duel, league

router = APIRouter(prefix="/api/arena", tags=["Giải đấu & thử thách"])
Auth = Depends(auth.get_current_user)


class JoinIn(BaseModel):
    code: str


@router.get("/league")
def api_league(user: dict = Auth):
    return league.standings(user)


@router.get("/duel")
def api_duel(user: dict = Auth):
    return duel.state(user)


@router.post("/duel/create")
def api_duel_create(user: dict = Auth):
    return duel.create(user)


@router.post("/duel/cancel")
def api_duel_cancel(user: dict = Auth):
    return duel.cancel(user)


@router.post("/duel/join")
def api_duel_join(body: JoinIn, user: dict = Auth):
    return duel.join(user, body.code)
