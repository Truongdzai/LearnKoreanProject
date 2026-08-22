from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from .. import db
from ..services import analytics, auth, accounts, audit, catalog, events, feedback, quota

router = APIRouter(prefix="/api/admin", tags=["Quản trị"])
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


@router.get("/funnel")
def api_funnel(days: int = 30, admin: dict = Admin):
    return events.funnel(days)


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


@router.get("/series")
def api_series(days: int = 30, admin: dict = Admin):
    return analytics.overview(days)


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
def api_catalog_save(body: CatalogItem, request: Request, admin: dict = Admin):
    out = catalog.upsert(body.kind, body.data)
    audit.log(
        admin,
        "catalog.save",
        f"{body.kind}:{body.data.get('id', '')}",
        {"title": body.data.get("title") or body.data.get("name") or ""},
        quota.client_ip(request),
    )
    return out


@router.post("/catalog/delete")
def api_catalog_delete(body: CatalogDelete, request: Request, admin: dict = Admin):
    out = catalog.remove(body.kind, body.id)
    audit.log(admin, "catalog.delete", f"{body.kind}:{body.id}", None, quota.client_ip(request))
    return out


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
def api_users_update(body: UserUpdate, request: Request, admin: dict = Admin):
    fields = body.model_dump(exclude={"id"}, exclude_none=True)
    user = accounts.admin_update_user(body.id, fields)
    audit.log(admin, "user.update", body.id, fields, quota.client_ip(request))
    return {"ok": True, "user": accounts.public_user(user)}


@router.post("/users/gift")
def api_users_gift(body: GiftIn, request: Request, admin: dict = Admin):
    user = accounts.gift_coins(body.id, body.coins, body.message)
    audit.log(admin, "user.gift", body.id, {"coins": body.coins}, quota.client_ip(request))
    return {"ok": True, "user": accounts.public_user(user)}


@router.post("/users/plus")
def api_users_plus(body: PlusIn, request: Request, admin: dict = Admin):
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
    if body.action != "keep":
        audit.log(
            admin,
            "user.plus",
            body.id,
            {"action": body.action, "until": body.until, "plan": body.plan_id},
            quota.client_ip(request),
        )
    return {"ok": True, "user": accounts.public_user(user)}


@router.post("/users/delete")
def api_users_delete(body: IdIn, request: Request, admin: dict = Admin):
    try:
        victim = accounts.reload(body.id)
    except Exception:
        victim = {}
    accounts.admin_delete_user(body.id)
    audit.log(
        admin,
        "user.delete",
        body.id,
        {"email": victim.get("email", ""), "name": victim.get("name", "")},
        quota.client_ip(request),
    )
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
def api_feedback_status(body: FeedbackStatusIn, request: Request, admin: dict = Admin):
    out = feedback.set_status(body.id, body.status)
    audit.log(admin, "feedback.status", str(body.id), {"status": body.status}, quota.client_ip(request))
    return out


@router.post("/feedback/delete")
def api_feedback_delete(body: FeedbackIdIn, request: Request, admin: dict = Admin):
    out = feedback.remove(body.id)
    audit.log(admin, "feedback.delete", str(body.id), None, quota.client_ip(request))
    return out


@router.get("/audit")
def api_audit(action: str = "", page: int = 1, page_size: int = 30, admin: dict = Admin):
    return audit.recent(page, page_size, action)
