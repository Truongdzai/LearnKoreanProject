from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..schemas.account import MeState
from ..services import auth, accounts, dataexport, gameplay, quota

router = APIRouter(prefix="/api/me", tags=["Người dùng"])
Auth = Depends(auth.get_current_user)


class BuyIn(BaseModel):
    item_id: str


class EquipIn(BaseModel):
    frame: str | None = None


class EquipPetIn(BaseModel):
    pet: str | None = None


class EquipBgIn(BaseModel):
    bg: str | None = None


class AvatarIn(BaseModel):
    avatar: str | None = None


class PlantIn(BaseModel):
    item_id: str = ""
    art: str
    name: str


class PlantRefIn(BaseModel):
    plant_id: str


class PathIn(BaseModel):
    title: str
    data: dict = {}


class VideoIn(BaseModel):
    id: str
    title: str = ""
    channel: str = ""
    level: str = ""
    dur: str = ""
    topic: str = ""
    tone: str = ""


class VideoRefIn(BaseModel):
    id: str


class ClaimIn(BaseModel):
    quest_id: str


class PlusIn(BaseModel):
    plan_id: str = ""


class EventIn(BaseModel):
    type: str
    amount: int = 1
    minutes: int = 0
    words: int = 0
    lang: str = ""


class GoalIn(BaseModel):
    goal: str | None = None


class GoalBonusIn(BaseModel):
    goal: int


class PlanDataIn(BaseModel):
    data: dict


@router.get("/state", response_model=MeState)
def api_state(user: dict = Auth):
    return gameplay.state(user)


@router.get("/quests")
def api_quests(user: dict = Auth):
    return {"quests": gameplay.quests_for(user), "bonusAvailable": gameplay.bonus_available(user["id"])}


@router.get("/activities")
def api_activities(user: dict = Auth):
    return gameplay.activities(user["id"])


@router.post("/buy")
def api_buy(body: BuyIn, user: dict = Auth):
    return gameplay.buy(user, body.item_id)


@router.post("/equip")
def api_equip(body: EquipIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.equip_frame(user["id"], body.frame))}


@router.post("/equip-pet")
def api_equip_pet(body: EquipPetIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.equip_pet(user["id"], body.pet))}


@router.post("/equip-bg")
def api_equip_bg(body: EquipBgIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.equip_bg(user["id"], body.bg))}


@router.post("/avatar")
def api_avatar(body: AvatarIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.set_avatar(user["id"], body.avatar))}


@router.post("/plus")
def api_plus(body: PlusIn, user: dict = Auth):
    u = accounts.grant_plan(user["id"], body.plan_id) if body.plan_id else accounts.set_plus(user["id"], True)
    return {"ok": True, "user": accounts.public_user(u)}


@router.post("/garden/plant")
def api_plant(body: PlantIn, user: dict = Auth):
    return gameplay.plant(user, body.item_id, body.art, body.name)


@router.post("/garden/water")
def api_water(body: PlantRefIn, user: dict = Auth):
    return gameplay.water(user, body.plant_id)


@router.post("/garden/remove")
def api_remove_plant(body: PlantRefIn, user: dict = Auth):
    return gameplay.remove_plant(user, body.plant_id)


@router.post("/paths")
def api_add_path(body: PathIn, user: dict = Auth):
    return gameplay.add_path(user, body.title, body.data)


@router.post("/videos/save")
def api_save_video(body: VideoIn, user: dict = Auth):
    return gameplay.save_video(user, body.model_dump())


@router.post("/videos/remove")
def api_remove_video(body: VideoRefIn, user: dict = Auth):
    return gameplay.remove_video(user, body.id)


@router.post("/quests/claim")
def api_claim(body: ClaimIn, user: dict = Auth):
    return gameplay.claim_quest(user, body.quest_id)


@router.post("/daily-bonus")
def api_daily_bonus(user: dict = Auth):
    return gameplay.daily_bonus(user)


@router.post("/gift/ack")
def api_gift_ack(user: dict = Auth):
    accounts.ack_gifts(user["id"])
    return {"ok": True}


@router.post("/event")
def api_event(body: EventIn, user: dict = Auth):
    return gameplay.record_event(user, body.type, body.amount, body.minutes, body.words, body.lang)


@router.post("/goal")
def api_goal(body: GoalIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.set_goal(user["id"], body.goal))}


class EmailPrefIn(BaseModel):
    optout: bool


@router.post("/email-prefs")
def api_email_prefs(body: EmailPrefIn, user: dict = Auth):
    return {"ok": True, "user": accounts.public_user(accounts.set_email_optout(user["id"], body.optout))}


class DeleteAccountIn(BaseModel):
    password: str = ""
    confirm: str = ""


@router.get("/export")
def api_export(user: dict = Auth):
    data = dataexport.export_user(user["id"])
    stamp = datetime.now().strftime("%Y%m%d")
    return JSONResponse(
        data,
        headers={"Content-Disposition": f'attachment; filename="vyling-du-lieu-{stamp}.json"'},
    )


@router.post("/delete")
def api_delete_account(body: DeleteAccountIn, user: dict = Auth):
    accounts.delete_own_account(user, body.password, body.confirm)
    return {"ok": True}


@router.post("/goal-bonus")
def api_goal_bonus(body: GoalBonusIn, user: dict = Auth):
    return gameplay.goal_bonus(user, body.goal)


@router.get("/plans/{plan_id}")
def api_get_plan(plan_id: str, user: dict = Auth):
    return gameplay.get_plan(user["id"], plan_id)


@router.put("/plans/{plan_id}")
def api_set_plan(plan_id: str, body: PlanDataIn, user: dict = Auth):
    return gameplay.set_plan(user["id"], plan_id, body.data)


@router.get("/activity-days")
def api_activity_days(since: str, user: dict = Auth):
    return gameplay.activity_days(user["id"], since)


class ExamIn(BaseModel):
    kind: str = "full"


@router.get("/exam-status")
def api_exam_status(kind: str = "full", user: dict = Auth):
    return quota.exam_status(user, kind)


@router.post("/exam-start")
def api_exam_start(body: ExamIn, user: dict = Auth):
    return quota.take_exam(user, body.kind.strip()[:24] or "full")


@router.get("/progress")
def api_progress(days: int = 30, user: dict = Auth):
    return gameplay.progress_by_lang(user["id"], days)


class WordsIn(BaseModel):
    lang: str
    add: list[str] = []
    remove: list[str] = []


@router.get("/words")
def api_words(lang: str, user: dict = Auth):
    return {"lang": lang, "words": gameplay.learned_words(user["id"], lang)}


@router.post("/words")
def api_mark_words(body: WordsIn, user: dict = Auth):
    return gameplay.mark_words(user["id"], body.lang, body.add, body.remove)
