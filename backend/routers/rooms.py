from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from ..services import auth, quota, rooms

router = APIRouter(prefix="/api/rooms", tags=["Phòng luyện nói"])
Auth = Depends(auth.get_current_user)


class CreateIn(BaseModel):
    name: str = ""
    topic: str = ""
    lang: str = "ko"
    level: str = "a2"
    mode: str = "public"
    password: str = ""
    max: int = 5


class JoinIn(BaseModel):
    password: str = ""
    invite: str = ""


class MatchIn(BaseModel):
    lang: str = "ko"
    level: str = "a2"
    topics: list[str] = []
    wide: bool = False


class SignalIn(BaseModel):
    to: str = ""
    kind: str = ""
    payload: str = ""


class SayIn(BaseModel):
    text: str = ""
    audio: str = ""
    after: int = 0


class PromptIn(BaseModel):
    native: str = "vi"
    after: int = 0


@router.get("")
def api_rooms(lang: str = "", user: dict = Auth):
    return rooms.lobby(user, lang)


@router.post("")
def api_room_create(body: CreateIn, user: dict = Auth):
    return rooms.create(user, body.model_dump())


@router.post("/match")
def api_match_start(body: MatchIn, user: dict = Auth):
    return rooms.match_start(user, body.model_dump())


@router.get("/match")
def api_match_poll(user: dict = Auth):
    return rooms.match_poll(user)


@router.post("/match/cancel")
def api_match_cancel(user: dict = Auth):
    return rooms.match_cancel(user)


@router.get("/ice")
def api_room_ice(user: dict = Auth):
    return rooms.ice_servers()


@router.get("/{room_id}/peek")
def api_room_peek(room_id: str, user: dict = Auth):
    return rooms.peek(user, room_id)


@router.post("/{room_id}/join")
def api_room_join(room_id: str, body: JoinIn, user: dict = Auth):
    return rooms.join(user, room_id, body.password, body.invite)


@router.post("/{room_id}/leave")
def api_room_leave(room_id: str, user: dict = Auth):
    return rooms.leave(user, room_id)


@router.get("/{room_id}")
def api_room_state(room_id: str, after: int = 0, user: dict = Auth):
    return rooms.state(user, room_id, after)


@router.post("/{room_id}/say")
def api_room_say(room_id: str, body: SayIn, user: dict = Auth):
    return rooms.say(user, room_id, body.text, body.audio, body.after)


@router.post("/{room_id}/signal")
def api_room_signal(room_id: str, body: SignalIn, user: dict = Auth):
    return rooms.signal_send(user, room_id, body.to, body.kind, body.payload)


@router.get("/{room_id}/signal")
def api_room_signal_poll(room_id: str, after: int = 0, user: dict = Auth):
    return rooms.signal_fetch(user, room_id, after)


@router.get("/{room_id}/clip/{msg_id}")
def api_room_clip(room_id: str, msg_id: int, user: dict = Auth):
    return rooms.clip(user, room_id, msg_id)


@router.post("/{room_id}/prompt")
def api_room_prompt(room_id: str, body: PromptIn, request: Request, user: dict = Auth):
    quota.consume("speaking", user, quota.client_ip(request))
    return rooms.topic_prompt(user, room_id, body.native, body.after)
