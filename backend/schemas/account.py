from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class PublicUser(BaseModel):
    id: str
    name: str
    email: str | None = None
    phone: str | None = None
    provider: str | None = None
    role: str
    avatar: str | None = None
    isPlus: bool
    plusUntil: str | None = None
    coins: int
    xp: int
    level: int
    streak: int
    equippedFrame: str | None = None
    equippedPet: str | None = None
    equippedBg: str | None = None
    goal: str | None = None
    refCount: int = 0
    emailVerified: bool = True
    emailOptout: bool = False


class GardenPlant(BaseModel):
    id: str
    itemId: str
    art: str
    name: str
    growth: int


class SavedVideo(BaseModel):
    id: str
    title: str
    channel: str | None = None
    level: str | None = None
    dur: str | None = None
    topic: str | None = None
    tone: str | None = None
    lang: str


class UserPath(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    title: str


class WaterState(BaseModel):
    left: int
    max: int
    used: int
    bonus: int


class MeState(BaseModel):
    user: PublicUser
    owned: list[str]
    seeds: dict[str, int] = {}
    water: WaterState
    garden: list[GardenPlant]
    paths: list[UserPath]
    savedVideos: list[SavedVideo]
    todayXp: int
    goalBonusClaimed: bool


class SessionOut(BaseModel):
    token: str
    user: PublicUser


class PendingGift(BaseModel):
    coins: int
    message: str = ""


class AuthMeOut(BaseModel):
    user: PublicUser
    bonusAvailable: bool
    pendingGift: PendingGift | None = None


class ProvidersOut(BaseModel):
    google: bool
    facebook: bool
