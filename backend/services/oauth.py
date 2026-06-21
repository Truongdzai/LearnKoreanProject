from __future__ import annotations

import secrets
import time
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from ..config import settings

GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo"

FB_VERSION = "v19.0"
FB_AUTH = f"https://www.facebook.com/{FB_VERSION}/dialog/oauth"
FB_TOKEN = f"https://graph.facebook.com/{FB_VERSION}/oauth/access_token"
FB_USERINFO = "https://graph.facebook.com/me"

_states: dict[str, tuple[str, float]] = {}


def _cfg() -> dict:
    return settings.get("oauth", {})


def google_enabled() -> bool:
    c = _cfg()
    return bool(c.get("google_client_id") and c.get("google_client_secret"))


def facebook_enabled() -> bool:
    c = _cfg()
    return bool(c.get("facebook_app_id") and c.get("facebook_app_secret"))


def enabled(provider: str) -> bool:
    return google_enabled() if provider == "google" else facebook_enabled() if provider == "facebook" else False


def make_state(return_origin: str) -> str:
    now = time.time()
    for k, (_, exp) in list(_states.items()):
        if exp < now:
            _states.pop(k, None)
    nonce = secrets.token_urlsafe(20)
    _states[nonce] = (return_origin, now + 600)
    return nonce


def take_state(nonce: str) -> str | None:
    data = _states.pop(nonce, None)
    if not data:
        return None
    origin, exp = data
    return origin if time.time() <= exp else None


def authorize_url(provider: str, redirect_uri: str, state: str) -> str:
    c = _cfg()
    if provider == "google":
        params = {
            "client_id": c["google_client_id"],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "online",
            "prompt": "select_account",
        }
        return GOOGLE_AUTH + "?" + urlencode(params)
    if provider == "facebook":
        params = {
            "client_id": c["facebook_app_id"],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "email,public_profile",
            "state": state,
        }
        return FB_AUTH + "?" + urlencode(params)
    raise HTTPException(status_code=404, detail="Nhà cung cấp không hỗ trợ.")


def _google_exchange(code: str, redirect_uri: str) -> dict:
    c = _cfg()
    with httpx.Client(timeout=20.0) as client:
        tok = client.post(GOOGLE_TOKEN, data={
            "code": code,
            "client_id": c["google_client_id"],
            "client_secret": c["google_client_secret"],
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        })
        tok.raise_for_status()
        access_token = tok.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=502, detail="Google không trả về token.")
        info = client.get(GOOGLE_USERINFO, headers={"Authorization": "Bearer " + access_token})
        info.raise_for_status()
        data = info.json()
    return {
        "id": data.get("sub"),
        "email": (data.get("email") or "").lower() or None,
        "name": data.get("name") or (data.get("email") or "Người dùng Google").split("@")[0],
        "avatar": data.get("picture"),
    }


def _facebook_exchange(code: str, redirect_uri: str) -> dict:
    c = _cfg()
    with httpx.Client(timeout=20.0) as client:
        tok = client.get(FB_TOKEN, params={
            "client_id": c["facebook_app_id"],
            "client_secret": c["facebook_app_secret"],
            "redirect_uri": redirect_uri,
            "code": code,
        })
        tok.raise_for_status()
        access_token = tok.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=502, detail="Facebook không trả về token.")
        info = client.get(FB_USERINFO, params={
            "fields": "id,name,email,picture.type(large)",
            "access_token": access_token,
        })
        info.raise_for_status()
        data = info.json()
    picture = data.get("picture", {})
    avatar = picture.get("data", {}).get("url") if isinstance(picture, dict) else None
    return {
        "id": data.get("id"),
        "email": (data.get("email") or "").lower() or None,
        "name": data.get("name") or "Người dùng Facebook",
        "avatar": avatar,
    }


def exchange(provider: str, code: str, redirect_uri: str) -> dict:
    try:
        if provider == "google":
            return _google_exchange(code, redirect_uri)
        if provider == "facebook":
            return _facebook_exchange(code, redirect_uri)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Lỗi kết nối {provider}: {exc}")
    raise HTTPException(status_code=404, detail="Nhà cung cấp không hỗ trợ.")
