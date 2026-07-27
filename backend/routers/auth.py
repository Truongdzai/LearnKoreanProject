from __future__ import annotations

from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from ..schemas.account import AuthMeOut, ProvidersOut, SessionOut
from ..services import accounts, auth, gameplay, oauth

router = APIRouter(prefix="/api/auth", tags=["Tài khoản"])


class RegisterIn(BaseModel):
    name: str = ""
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


def _session(row: dict) -> dict:
    return {
        "token": auth.make_token(row["id"], row["role"], row.get("token_version") or 0),
        "user": accounts.public_user(row),
    }


@router.post("/register", response_model=SessionOut)
def api_register(body: RegisterIn, request: Request):
    ip = request.client.host if request.client else ""
    row = accounts.register(body.name, body.email, body.password, ip)
    return _session(row)


@router.post("/login", response_model=SessionOut)
def api_login(body: LoginIn, request: Request):
    ip = request.client.host if request.client else ""
    row = accounts.login(body.email, body.password, ip)
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


def _safe_origin(request: Request, return_to: str) -> str:
    # Token được đính vào URL đích ở callback chỉ cho phép quay về CHÍNH origin
    # của server này Nếu không sẽ thành open-redirect + rò rỉ token cho web lạ
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
