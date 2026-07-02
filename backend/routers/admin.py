from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from .. import db
from ..services import auth, accounts, catalog, feedback

router = APIRouter(prefix="/api/admin")
Admin = Depends(auth.get_admin)


class CatalogItem(BaseModel):
    kind: str
    data: dict


class CatalogDelete(BaseModel):
    kind: str
    id: str


class IdIn(BaseModel):
    id: str


class UserUpdate(BaseModel):
    id: str
    name: str | None = None
    role: str | None = None
    status: str | None = None
    is_plus: int | None = None
    coins: int | None = None
    xp: int | None = None
    streak: int | None = None


class GiftIn(BaseModel):
    id: str
    coins: int
    message: str = ""


class PlusIn(BaseModel):
    id: str
    action: str = "keep"
    until: str = ""
    plan_id: str = ""


@router.get("/stats")
def api_stats(admin: dict = Admin):
    conn = db.get_conn()
    try:
        def n(sql: str, *a) -> int:
            return conn.execute(sql, a).fetchone()[0]

        return {
            "users": n("SELECT COUNT(*) FROM users"),
            "plus": n("SELECT COUNT(*) FROM users WHERE is_plus = 1"),
            "activeToday": n("SELECT COUNT(*) FROM users WHERE date(last_active) = date('now','localtime')"),
            "newWeek": n("SELECT COUNT(*) FROM users WHERE created_at >= datetime('now','localtime','-7 days')"),
            "videos": n("SELECT COUNT(*) FROM catalog_videos"),
            "quests": n("SELECT COUNT(*) FROM catalog_quests"),
            "shop": n("SELECT COUNT(*) FROM catalog_shop"),
            "plans": n("SELECT COUNT(*) FROM catalog_plans"),
            "srsCards": n("SELECT COUNT(*) FROM srs_cards"),
            "dictEntries": n("SELECT COUNT(*) FROM dict_entries") if _has_dict(conn) else 0,
            "feedbackNew": n("SELECT COUNT(*) FROM feedback WHERE status = 'new'"),
        }
    finally:
        conn.close()


def _has_dict(conn) -> bool:
    return bool(conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='dict_entries'"
    ).fetchone())


@router.get("/catalog")
def api_catalog(admin: dict = Admin):
    return {
        "videos": catalog.videos(active_only=False),
        "quests": catalog.quests(active_only=False),
        "shop": catalog.shop(active_only=False),
        "plans": catalog.plans(active_only=False),
    }


@router.post("/catalog/save")
def api_catalog_save(body: CatalogItem, admin: dict = Admin):
    return catalog.upsert(body.kind, body.data)


@router.post("/catalog/delete")
def api_catalog_delete(body: CatalogDelete, admin: dict = Admin):
    return catalog.remove(body.kind, body.id)


@router.get("/users")
def api_users(
    q: str = "",
    role: str = "",
    status: str = "",
    plus: str = "",
    sort: str = "recent",
    page: int = 1,
    page_size: int = 20,
    admin: dict = Admin,
):
    return accounts.admin_list_users(q, role, status, plus, sort, page, page_size)


@router.post("/users/update")
def api_users_update(body: UserUpdate, admin: dict = Admin):
    fields = body.model_dump(exclude={"id"}, exclude_none=True)
    return {"ok": True, "user": accounts.public_user(accounts.admin_update_user(body.id, fields))}


@router.post("/users/gift")
def api_users_gift(body: GiftIn, admin: dict = Admin):
    return {"ok": True, "user": accounts.public_user(accounts.gift_coins(body.id, body.coins, body.message))}


@router.post("/users/plus")
def api_users_plus(body: PlusIn, admin: dict = Admin):
    if body.action == "free":
        user = accounts.set_plus(body.id, False)
    elif body.action == "lifetime":
        user = accounts.admin_set_plus_until(body.id, None)
    elif body.action == "until":
        user = accounts.admin_set_plus_until(body.id, body.until)
    elif body.action == "plan":
        user = accounts.grant_plan(body.id, body.plan_id)
    else:
        user = accounts.reload(body.id)
    return {"ok": True, "user": accounts.public_user(user)}


@router.post("/users/delete")
def api_users_delete(body: IdIn, admin: dict = Admin):
    accounts.admin_delete_user(body.id)
    return {"ok": True}


class FeedbackStatusIn(BaseModel):
    id: int
    status: str


class FeedbackIdIn(BaseModel):
    id: int


@router.get("/feedback")
def api_feedback_list(status: str = "", page: int = 1, page_size: int = 20, admin: dict = Admin):
    return feedback.admin_list(status, page, page_size)


@router.post("/feedback/status")
def api_feedback_status(body: FeedbackStatusIn, admin: dict = Admin):
    return feedback.set_status(body.id, body.status)


@router.post("/feedback/delete")
def api_feedback_delete(body: FeedbackIdIn, admin: dict = Admin):
    return feedback.remove(body.id)
