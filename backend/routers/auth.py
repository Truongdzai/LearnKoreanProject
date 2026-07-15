from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from ..schemas.account import AuthMeOut, ProvidersOut, SessionOut
from ..services import accounts, auth, gameplay, oauth

router = APIRouter(prefix="/api/auth")


class RegisterIn(BaseModel):
    name: str = ""
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


def _session(row: dict) -> dict:
    return {
        "token": auth.make_token(row["id"], row["role"]),
        "user": accounts.public_user(row),
    }


@router.post("/register", response_model=SessionOut)
def api_register(body: RegisterIn):
    row = accounts.register(body.name, body.email, body.password)
    return _session(row)


@router.post("/login", response_model=SessionOut)
def api_login(body: LoginIn):
    row = accounts.login(body.email, body.password)
    return _session(row)


@router.get("/me", response_model=AuthMeOut)
def api_me(user: dict = Depends(auth.get_current_user)):
    return {
        "user": accounts.public_user(user),
        "bonusAvailable": gameplay.bonus_available(user["id"]),
        "pendingGift": accounts.pending_gift(user["id"]),
    }


@router.get("/providers", response_model=ProvidersOut)
def api_providers():
    return {"google": oauth.google_enabled(), "facebook": oauth.facebook_enabled()}


def _redirect_uri(request: Request, provider: str) -> str:
    base = str(request.base_url).rstrip("/")
    base = base.replace("://127.0.0.1", "://localhost")
    return f"{base}/api/auth/{provider}/callback"


@router.get("/{provider}/start")
def api_oauth_start(provider: str, request: Request, return_to: str = ""):
    if provider not in ("google", "facebook"):
        raise HTTPException(status_code=404, detail="Nhà cung cấp không hỗ trợ.")
    if not oauth.enabled(provider):
        raise HTTPException(status_code=400, detail=f"Đăng nhập {provider} chưa được cấu hình.")
    origin = return_to or str(request.base_url).rstrip("/")
    state = oauth.make_state(origin)
    url = oauth.authorize_url(provider, _redirect_uri(request, provider), state)
    return RedirectResponse(url)


@router.get("/{provider}/callback")
def api_oauth_callback(provider: str, request: Request, code: str = "", state: str = "", error: str = ""):
    origin = oauth.take_state(state) or str(request.base_url).rstrip("/")
    if error or not code:
        return RedirectResponse(f"{origin}/#auth_error={error or 'cancelled'}")
    try:
        info = oauth.exchange(provider, code, _redirect_uri(request, provider))
        row = accounts.upsert_oauth_user(provider, info)
        token = auth.make_token(row["id"], row["role"])
        return RedirectResponse(f"{origin}/#token={token}")
    except HTTPException as exc:
        return RedirectResponse(f"{origin}/#auth_error={exc.status_code}")
