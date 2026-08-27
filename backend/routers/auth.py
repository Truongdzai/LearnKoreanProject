from __future__ import annotations

from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from ..schemas.account import AuthMeOut, ProvidersOut, SessionOut
from ..services import accounts, audit, auth, gameplay, oauth, quota

router = APIRouter(prefix="/api/auth", tags=["Tài khoản"])

MAX_EMAIL = 190
MAX_PASSWORD = 128
MAX_NAME = 80


class RegisterIn(BaseModel):
    name: str = Field(default="", max_length=MAX_NAME)
    email: str = Field(max_length=MAX_EMAIL)
    password: str = Field(max_length=MAX_PASSWORD)
    ref: str = Field(default="", max_length=40)


class LoginIn(BaseModel):
    email: str = Field(max_length=MAX_EMAIL)
    password: str = Field(max_length=MAX_PASSWORD)


def _session(row: dict) -> dict:
    return {
        "token": auth.make_token(row["id"], row["role"], row.get("token_version") or 0),
        "user": accounts.public_user(row),
    }


@router.post("/register", response_model=SessionOut)
def api_register(body: RegisterIn, request: Request):
    row = accounts.register(body.name, body.email, body.password, quota.client_ip(request), body.ref)
    return _session(row)


@router.post("/login", response_model=SessionOut)
def api_login(body: LoginIn, request: Request):
    row = accounts.login(body.email, body.password, quota.client_ip(request))
    if row.get("role") == "admin":
        audit.log(row, "admin.login", str(row["id"]), None, quota.client_ip(request))
    return _session(row)


class ForgotIn(BaseModel):
    email: str = Field(max_length=MAX_EMAIL)


class ResetIn(BaseModel):
    email: str = Field(max_length=MAX_EMAIL)
    code: str = Field(max_length=16)
    password: str = Field(max_length=MAX_PASSWORD)


class ChangeIn(BaseModel):
    current_password: str = Field(max_length=MAX_PASSWORD)
    code: str = Field(max_length=16)
    new_password: str = Field(max_length=MAX_PASSWORD)


@router.post("/password/forgot")
def api_forgot(body: ForgotIn):
    accounts.request_reset(body.email)
    return {"ok": True}


@router.post("/password/reset")
def api_reset(body: ResetIn):
    accounts.reset_password(body.email, body.code, body.password)
    return {"ok": True}


@router.post("/password/change/code")
def api_change_code(user: dict = Depends(auth.get_current_user)):
    accounts.request_change(user)
    return {"ok": True}


@router.post("/password/change")
def api_change(body: ChangeIn, user: dict = Depends(auth.get_current_user)):
    row = accounts.change_password(user["id"], body.current_password, body.code, body.new_password)
    return {"ok": True, "token": auth.make_token(row["id"], row["role"], row.get("token_version") or 0)}


class CodeIn(BaseModel):
    code: str = Field(max_length=16)


@router.post("/email/verify/send")
def api_verify_send(user: dict = Depends(auth.get_current_user)):
    accounts.request_verify(user)
    return {"ok": True}


@router.post("/email/verify")
def api_verify(body: CodeIn, user: dict = Depends(auth.get_current_user)):
    row = accounts.confirm_verify(user["id"], body.code)
    return {"ok": True, "user": accounts.public_user(row)}


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


def _safe_origin(request: Request, return_to: str) -> str:
    self_origin = str(request.base_url).rstrip("/")
    want = (return_to or "").strip()
    if not want:
        return self_origin
    try:
        a, b = urlsplit(want), urlsplit(self_origin)
    except ValueError:
        return self_origin
    if a.scheme in ("http", "https") and (a.hostname, a.port) == (b.hostname, b.port):
        return f"{a.scheme}://{a.netloc}"
    return self_origin


@router.get("/{provider}/start")
def api_oauth_start(provider: str, request: Request, return_to: str = ""):
    if provider not in ("google", "facebook"):
        raise HTTPException(status_code=404, detail="Nhà cung cấp không hỗ trợ.")
    if not oauth.enabled(provider):
        raise HTTPException(status_code=400, detail=f"Đăng nhập {provider} chưa được cấu hình.")
    origin = _safe_origin(request, return_to)
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
        token = auth.make_token(row["id"], row["role"], row.get("token_version") or 0)
        return RedirectResponse(f"{origin}/#token={token}")
    except HTTPException as exc:
        return RedirectResponse(f"{origin}/#auth_error={exc.status_code}")
